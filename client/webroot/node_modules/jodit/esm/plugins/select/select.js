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
import { Plugin } from "../../core/plugin/index.js";
import { autobind, watch } from "../../core/decorators/index.js";
import { camelCase } from "../../core/helpers/string/camel-case.js";
import { Dom } from "../../core/dom/dom.js";
import { Popup, UIElement } from "../../core/ui/index.js";
import { pluginSystem } from "../../core/global.js";
import "./config.js";
/**
 * A utility plugin that allows you to subscribe to a click/mousedown/touchstart/mouseup on an element in DOM order
 *
 * @example
 * ```js
 * const editor = Jodit.make('#editor');
 * editor.e.on('clickImg', (img) => {
 *   console.log(img.src);
 * })
 * ```
 */
export class select extends Plugin {
    constructor() {
        super(...arguments);
        this.proxyEventsList = [
            'click',
            'mousedown',
            'touchstart',
            'mouseup',
            'touchend'
        ];
    }
    afterInit(jodit) {
        this.proxyEventsList.forEach(eventName => {
            jodit.e.on(eventName + '.select', this.onStartSelection);
        });
    }
    beforeDestruct(jodit) {
        this.proxyEventsList.forEach(eventName => {
            jodit.e.on(eventName + '.select', this.onStartSelection);
        });
    }
    onStartSelection(e) {
        const { j } = this;
        let result, target = e.target;
        while (result === undefined && target && target !== j.editor) {
            result = j.e.fire(camelCase(e.type + '_' + target.nodeName.toLowerCase()), target, e);
            target = target.parentElement;
        }
        if (e.type === 'click' && result === undefined && target === j.editor) {
            j.e.fire(e.type + 'Editor', target, e);
        }
    }
    /**
     * @event outsideClick(e) - when user clicked in the outside of editor
     */
    onOutsideClick(e) {
        const node = e.target;
        if (Dom.up(node, elm => elm === this.j.editor)) {
            return;
        }
        const box = UIElement.closestElement(node, Popup);
        if (!box) {
            this.j.e.fire('outsideClick', e);
        }
    }
    beforeCommandCut(command) {
        const { s } = this.j;
        if (command === 'cut' && !s.isCollapsed()) {
            const current = s.current();
            if (current && Dom.isOrContains(this.j.editor, current)) {
                this.onCopyNormalizeSelectionBound();
            }
        }
    }
    onCopyNormalizeSelectionBound(e) {
        const { s, editor, o } = this.j;
        if (!o.select.normalizeSelectionBeforeCutAndCopy || s.isCollapsed()) {
            return;
        }
        if (e &&
            (!e.isTrusted ||
                !Dom.isNode(e.target) ||
                !Dom.isOrContains(editor, e.target))) {
            return;
        }
        this.jodit.s.expandSelection();
    }
}
__decorate([
    autobind
], select.prototype, "onStartSelection", null);
__decorate([
    watch('ow:click')
], select.prototype, "onOutsideClick", null);
__decorate([
    watch([':beforeCommand'])
], select.prototype, "beforeCommandCut", null);
__decorate([
    watch([':copy', ':cut'])
], select.prototype, "onCopyNormalizeSelectionBound", null);
pluginSystem.add('select', select);
