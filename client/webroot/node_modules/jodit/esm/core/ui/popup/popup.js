/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2023 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
        r = Reflect.decorate(decorators, target, key, desc);
    else
        for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i])
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * [[include:core/ui/popup/README.md]]
 * @packageDocumentation
 * @module ui/popup
 */
import { Dom } from "../../dom/dom.js";
import { attr, css, isString, kebabCase, markOwner, position, ucfirst } from "../../helpers/index.js";
import { assert } from "../../helpers/utils/assert.js";
import { UIElement } from "../element.js";
import { autobind, throttle } from "../../decorators/index.js";
import { Component } from "../../component/component.js";
import { eventEmitter, getContainer } from "../../global.js";
export class Popup extends UIElement {
    /** @override */
    className() {
        return 'Popup';
    }
    /** @override */
    updateParentElement(target) {
        if (target !== this && Component.isInstanceOf(target, Popup)) {
            this.childrenPopups.forEach(popup => {
                if (!target.closest(popup) && popup.isOpened) {
                    popup.close();
                }
            });
            if (!this.childrenPopups.has(target)) {
                this.j.e.on(target, 'beforeClose', () => {
                    this.childrenPopups.delete(target);
                });
            }
            this.childrenPopups.add(target);
        }
        return super.updateParentElement(target);
    }
    /**
     * Set popup content
     */
    setContent(content) {
        Dom.detach(this.container);
        const box = this.j.c.div(`${this.componentName}__content`);
        let elm;
        if (Component.isInstanceOf(content, UIElement)) {
            elm = content.container;
            content.parentElement = this;
        }
        else if (isString(content)) {
            elm = this.j.c.fromHTML(content);
        }
        else {
            elm = content;
        }
        box.appendChild(elm);
        this.container.appendChild(box);
        this.updatePosition();
        return this;
    }
    /**
     * Open popup near with some bound
     */
    open(getBound, keepPosition = false, parentContainer) {
        markOwner(this.jodit, this.container);
        this.calculateZIndex();
        this.isOpened = true;
        this.addGlobalListeners();
        this.targetBound = !keepPosition
            ? getBound
            : this.getKeepBound(getBound);
        if (parentContainer) {
            parentContainer.appendChild(this.container);
        }
        else {
            const popupContainer = getContainer(this.jodit, Popup);
            if (parentContainer !== this.container.parentElement) {
                popupContainer.appendChild(this.container);
            }
        }
        this.updatePosition();
        this.j.e.fire(this, 'afterOpen');
        this.j.e.fire('afterOpenPopup', this);
        return this;
    }
    calculateZIndex() {
        if (this.container.style.zIndex) {
            return;
        }
        const checkView = (view) => {
            const zIndex = view.container.style.zIndex || view.o.zIndex;
            if (zIndex) {
                this.setZIndex(1 + parseInt(zIndex.toString(), 10));
                return true;
            }
            return false;
        };
        const { j } = this;
        if (checkView(j)) {
            return;
        }
        let pe = this.parentElement;
        while (pe) {
            if (checkView(j)) {
                return;
            }
            if (pe.container.style.zIndex) {
                this.setZIndex(1 + parseInt(pe.container.style.zIndex.toString(), 10));
                return;
            }
            if (!pe.parentElement && pe.container.parentElement) {
                const elm = UIElement.closestElement(pe.container.parentElement, UIElement);
                if (elm) {
                    pe = elm;
                    continue;
                }
            }
            pe = pe.parentElement;
        }
    }
    /**
     * Calculate static bound for point
     */
    getKeepBound(getBound) {
        const oldBound = getBound();
        const elmUnderCursor = this.od.elementFromPoint(oldBound.left, oldBound.top);
        if (!elmUnderCursor) {
            return getBound;
        }
        const element = Dom.isHTMLElement(elmUnderCursor)
            ? elmUnderCursor
            : elmUnderCursor.parentElement;
        const oldPos = position(element, this.j);
        return () => {
            const bound = getBound();
            const newPos = position(element, this.j);
            return {
                ...bound,
                top: bound.top + (newPos.top - oldPos.top),
                left: bound.left + (newPos.left - oldPos.left)
            };
        };
    }
    /**
     * Update container position
     */
    updatePosition() {
        if (!this.isOpened) {
            return this;
        }
        const [pos, strategy] = this.calculatePosition(this.targetBound(), this.viewBound(), position(this.container, this.j));
        this.setMod('strategy', strategy);
        css(this.container, {
            left: pos.left,
            top: pos.top
        });
        this.childrenPopups.forEach(popup => popup.updatePosition());
        return this;
    }
    throttleUpdatePosition() {
        this.updatePosition();
    }
    /**
     * Calculate start point
     */
    calculatePosition(target, view, container, defaultStrategy = this.strategy) {
        const x = {
            left: target.left,
            right: target.left - (container.width - target.width)
        }, y = {
            bottom: target.top + target.height,
            top: target.top - container.height
        };
        const list = Object.keys(x).reduce((keys, xKey) => keys.concat(Object.keys(y).map(yKey => `${xKey}${ucfirst(yKey)}`)), []);
        const getPointByStrategy = (strategy) => {
            const [xKey, yKey] = kebabCase(strategy).split('-');
            return {
                left: x[xKey],
                top: y[yKey],
                width: container.width,
                height: container.height
            };
        };
        const getMatchStrategy = (inBox) => {
            let strategy = null;
            if (Popup.boxInView(getPointByStrategy(defaultStrategy), inBox)) {
                strategy = defaultStrategy;
            }
            else {
                strategy =
                    list.find((key) => {
                        if (Popup.boxInView(getPointByStrategy(key), inBox)) {
                            return key;
                        }
                        return;
                    }) || null;
            }
            return strategy;
        };
        // Try find match position inside Jodit.container
        let strategy = getMatchStrategy(position(this.j.container, this.j));
        // If not found or is not inside window view
        if (!strategy || !Popup.boxInView(getPointByStrategy(strategy), view)) {
            // Find match strategy inside window view
            strategy = getMatchStrategy(view) || strategy || defaultStrategy;
        }
        return [getPointByStrategy(strategy), strategy];
    }
    /**
     * Check if one box is inside second
     */
    static boxInView(box, view) {
        const accuracy = 2;
        return (box.top - view.top >= -accuracy &&
            box.left - view.left >= -accuracy &&
            view.top + view.height - (box.top + box.height) >= -accuracy &&
            view.left + view.width - (box.left + box.width) >= -accuracy);
    }
    /**
     * Close popup
     */
    close() {
        if (!this.isOpened) {
            return this;
        }
        this.isOpened = false;
        this.childrenPopups.forEach(popup => popup.close());
        this.j.e.fire(this, 'beforeClose');
        this.j.e.fire('beforePopupClose', this);
        this.removeGlobalListeners();
        Dom.safeRemove(this.container);
        return this;
    }
    /**
     * Close popup if click was in outside
     */
    closeOnOutsideClick(e) {
        if (!this.isOpened || this.isOwnClick(e)) {
            return;
        }
        this.close();
    }
    isOwnClick(e) {
        if (!e.target) {
            return false;
        }
        const box = UIElement.closestElement(e.target, Popup);
        return Boolean(box && (this === box || box.closest(this)));
    }
    addGlobalListeners() {
        const up = this.throttleUpdatePosition, ow = this.ow;
        eventEmitter.on('closeAllPopups', this.close);
        if (this.smart) {
            this.j.e
                .on('escape', this.close)
                .on('mousedown touchstart', this.closeOnOutsideClick)
                .on(ow, 'mousedown touchstart', this.closeOnOutsideClick);
        }
        this.j.e
            .on('closeAllPopups', this.close)
            .on('resize', up)
            .on(this.container, 'scroll mousewheel', up)
            .on(ow, 'scroll', up)
            .on(ow, 'resize', up);
        Dom.up(this.j.container, box => {
            box && this.j.e.on(box, 'scroll mousewheel', up);
        });
    }
    removeGlobalListeners() {
        const up = this.throttleUpdatePosition, ow = this.ow;
        eventEmitter.off('closeAllPopups', this.close);
        if (this.smart) {
            this.j.e
                .off('escape', this.close)
                .off('mousedown touchstart', this.closeOnOutsideClick)
                .off(ow, 'mousedown touchstart', this.closeOnOutsideClick);
        }
        this.j.e
            .off('closeAllPopups', this.close)
            .off('resize', up)
            .off(this.container, 'scroll mousewheel', up)
            .off(ow, 'scroll', up)
            .off(ow, 'resize', up);
        assert(this.j.container.isConnected, 'The container must be built into the DOM');
        Dom.up(this.j.container, box => {
            box && this.j.e.off(box, 'scroll mousewheel', up);
        });
    }
    /**
     * Set ZIndex
     */
    setZIndex(index) {
        this.container.style.zIndex = index.toString();
    }
    constructor(jodit, smart = true) {
        super(jodit);
        this.smart = smart;
        this.isOpened = false;
        this.strategy = 'leftBottom';
        this.viewBound = () => ({
            left: 0,
            top: 0,
            width: this.ow.innerWidth,
            height: this.ow.innerHeight
        });
        this.childrenPopups = new Set();
        attr(this.container, 'role', 'popup');
    }
    /** @override **/
    destruct() {
        this.close();
        return super.destruct();
    }
}
__decorate([
    autobind
], Popup.prototype, "updatePosition", null);
__decorate([
    throttle(10),
    autobind
], Popup.prototype, "throttleUpdatePosition", null);
__decorate([
    autobind
], Popup.prototype, "close", null);
__decorate([
    autobind
], Popup.prototype, "closeOnOutsideClick", null);
