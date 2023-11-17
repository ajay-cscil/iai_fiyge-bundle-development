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
 * [[include:plugins/sticky/README.md]]
 * @packageDocumentation
 * @module plugins/sticky
 */
import { IS_ES_NEXT, IS_IE, MODE_WYSIWYG } from "../../core/constants.js";
import { Plugin } from "../../core/plugin/plugin.js";
import { Dom } from "../../core/dom/dom.js";
import { css, offset } from "../../core/helpers/index.js";
import { throttle } from "../../core/decorators/index.js";
import { pluginSystem } from "../../core/global.js";
import "./config.js";
export class sticky extends Plugin {
    constructor() {
        super(...arguments);
        this.isToolbarSticked = false;
        this.createDummy = (toolbar) => {
            if (!IS_ES_NEXT && IS_IE && !this.dummyBox) {
                this.dummyBox = this.j.c.div();
                this.dummyBox.classList.add('jodit_sticky-dummy_toolbar');
                this.j.container.insertBefore(this.dummyBox, toolbar);
            }
        };
        /**
         * Add sticky
         */
        this.addSticky = (toolbar) => {
            if (!this.isToolbarSticked) {
                this.createDummy(toolbar);
                this.j.container.classList.add('jodit_sticky');
                this.isToolbarSticked = true;
            }
            // on resize it should work always
            css(toolbar, {
                top: this.j.o.toolbarStickyOffset || null,
                width: this.j.container.offsetWidth - 2
            });
            if (!IS_ES_NEXT && IS_IE && this.dummyBox) {
                css(this.dummyBox, {
                    height: toolbar.offsetHeight
                });
            }
        };
        /**
         * Remove sticky behaviour
         */
        this.removeSticky = (toolbar) => {
            if (this.isToolbarSticked) {
                css(toolbar, {
                    width: '',
                    top: ''
                });
                this.j.container.classList.remove('jodit_sticky');
                this.isToolbarSticked = false;
            }
        };
    }
    afterInit(jodit) {
        jodit.e
            .on(jodit.ow, 'scroll.sticky wheel.sticky mousewheel.sticky resize.sticky', this.onScroll)
            .on('getStickyState.sticky', () => this.isToolbarSticked);
    }
    /**
     * Scroll handler
     */
    onScroll() {
        const { jodit } = this;
        const scrollWindowTop = jodit.ow.pageYOffset ||
            (jodit.od.documentElement &&
                jodit.od.documentElement.scrollTop) ||
            0, offsetEditor = offset(jodit.container, jodit, jodit.od, true), doSticky = jodit.getMode() === MODE_WYSIWYG &&
            scrollWindowTop + jodit.o.toolbarStickyOffset >
                offsetEditor.top &&
            scrollWindowTop + jodit.o.toolbarStickyOffset <
                offsetEditor.top + offsetEditor.height &&
            !(jodit.o.toolbarDisableStickyForMobile && this.isMobile());
        if (jodit.o.toolbarSticky &&
            jodit.o.toolbar === true &&
            this.isToolbarSticked !== doSticky) {
            const container = jodit.toolbarContainer;
            if (container) {
                doSticky
                    ? this.addSticky(container)
                    : this.removeSticky(container);
            }
            jodit.e.fire('toggleSticky', doSticky);
        }
    }
    /**
     * Is mobile device
     */
    isMobile() {
        return (this.j &&
            this.j.options &&
            this.j.container &&
            this.j.o.sizeSM >= this.j.container.offsetWidth);
    }
    /** @override */
    beforeDestruct(jodit) {
        this.dummyBox && Dom.safeRemove(this.dummyBox);
        jodit.e
            .off(jodit.ow, 'scroll.sticky wheel.sticky mousewheel.sticky resize.sticky', this.onScroll)
            .off('.sticky');
    }
}
__decorate([
    throttle()
], sticky.prototype, "onScroll", null);
pluginSystem.add('sticky', sticky);
