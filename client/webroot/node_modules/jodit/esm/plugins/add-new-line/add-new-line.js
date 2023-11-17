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
 * [[include:plugins/add-new-line/README.md]]
 * @packageDocumentation
 * @module plugins/add-new-line
 */
import { Dom, Icon, Plugin } from "../../modules/index.js";
import { offset, position, call, scrollIntoViewIfNeeded } from "../../core/helpers/index.js";
import { autobind, debounce, watch } from "../../core/decorators/index.js";
import { pluginSystem } from "../../core/global.js";
import "./config.js";
const ns = 'addnewline';
/**
 * Create helper for adding new paragraph(Jodit.defaultOptions.enter tag) before iframe, table or image
 */
export class addNewLine extends Plugin {
    constructor() {
        super(...arguments);
        this.line = this.j.c.fromHTML(`<div role="button" tabindex="-1" title="${this.j.i18n('Break')}" class="jodit-add-new-line"><span>${Icon.get('enter')}</span></div>`);
        this.isMatchedTag = (node) => Boolean(node &&
            this.j.o.addNewLineTagsTriggers.includes(node.nodeName.toLowerCase()));
        this.preview = false;
        this.lineInFocus = false;
        this.isShown = false;
        this.hideForce = () => {
            if (!this.isShown) {
                return;
            }
            this.isShown = false;
            this.j.async.clearTimeout(this.timeout);
            this.lineInFocus = false;
            Dom.safeRemove(this.line);
            this.line.style.setProperty('--jd-offset-handle', '0');
        };
        this.canGetFocus = (elm) => {
            return (elm != null &&
                Dom.isBlock(elm) &&
                !/^(img|table|iframe|hr)$/i.test(elm.nodeName));
        };
        this.onClickLine = (e) => {
            const editor = this.j;
            const p = editor.createInside.element(editor.o.enter);
            if (this.preview && this.current && this.current.parentNode) {
                if (this.current === editor.editor) {
                    Dom.prepend(editor.editor, p);
                }
                else {
                    this.current.parentNode.insertBefore(p, this.current);
                }
            }
            else {
                editor.editor.appendChild(p);
            }
            editor.s.setCursorIn(p);
            scrollIntoViewIfNeeded(p, editor.editor, editor.ed);
            editor.synchronizeValues();
            this.hideForce();
            e.preventDefault();
        };
    }
    show() {
        if (this.isShown || this.j.o.readonly || this.j.isLocked) {
            return;
        }
        this.isShown = true;
        this.j.async.clearTimeout(this.timeout);
        this.line.classList.toggle('jodit-add-new-line_after', !this.preview);
        this.j.container.appendChild(this.line);
        this.line.style.width = this.j.container.clientWidth + 'px';
    }
    onLock(isLocked) {
        if (isLocked && this.isShown) {
            this.hideForce();
        }
    }
    hide() {
        if (!this.isShown || this.lineInFocus) {
            return;
        }
        this.timeout = this.j.async.setTimeout(this.hideForce, {
            timeout: 500,
            label: 'add-new-line-hide'
        });
    }
    afterInit(editor) {
        if (!editor.o.addNewLine) {
            return;
        }
        editor.e
            .on(this.line, 'mousemove', (e) => {
            e.stopPropagation();
        })
            .on(this.line, 'mousedown touchstart', this.onClickLine)
            .on('change', this.hideForce)
            .on(this.line, 'mouseenter', () => {
            this.j.async.clearTimeout(this.timeout);
            this.lineInFocus = true;
        })
            .on(this.line, 'mouseleave', () => {
            this.lineInFocus = false;
        })
            .on('changePlace', this.addEventListeners.bind(this));
        this.addEventListeners();
    }
    addEventListeners() {
        const editor = this.j;
        editor.e
            .off(editor.editor, '.' + ns)
            .off(editor.container, '.' + ns)
            .on([editor.ow, editor.ew, editor.editor], 'scroll' + '.' + ns, this.hideForce)
            .on(editor.editor, 'click' + '.' + ns, this.hide)
            .on(editor.container, 'mouseleave' + '.' + ns, this.hide)
            .on(editor.editor, 'mousemove' + '.' + ns, this.onMouseMove);
    }
    onDblClickEditor(e) {
        const editor = this.j;
        if (!editor.o.readonly &&
            editor.o.addNewLineOnDBLClick &&
            e.target === editor.editor &&
            editor.s.isCollapsed()) {
            const editorBound = offset(editor.editor, editor, editor.ed);
            const top = e.pageY - editor.ew.pageYOffset;
            const p = editor.createInside.element(editor.o.enter);
            if (Math.abs(top - editorBound.top) <
                Math.abs(top - (editorBound.height + editorBound.top)) &&
                editor.editor.firstChild) {
                editor.editor.insertBefore(p, editor.editor.firstChild);
            }
            else {
                editor.editor.appendChild(p);
            }
            editor.s.setCursorIn(p);
            editor.synchronizeValues();
            this.hideForce();
            e.preventDefault();
        }
    }
    onMouseMove(e) {
        const editor = this.j;
        let currentElement = editor.ed.elementFromPoint(e.clientX, e.clientY);
        if (!Dom.isHTMLElement(currentElement) ||
            Dom.isOrContains(this.line, currentElement)) {
            return;
        }
        if (!Dom.isOrContains(editor.editor, currentElement)) {
            return;
        }
        if (editor.editor !== currentElement &&
            !this.isMatchedTag(currentElement)) {
            currentElement = Dom.closest(currentElement, this.isMatchedTag, editor.editor);
        }
        if (!currentElement) {
            this.hide();
            return;
        }
        if (this.isMatchedTag(currentElement)) {
            const parentBox = Dom.up(currentElement, Dom.isBlock, editor.editor);
            if (parentBox && parentBox !== editor.editor) {
                currentElement = parentBox;
            }
        }
        const pos = position(currentElement, this.j);
        let top = false;
        let { clientY, clientX } = e;
        if (this.j.iframe) {
            const { top, left } = position(this.j.iframe, this.j, true);
            clientY += top;
            clientX += left;
        }
        const delta = this.j.o.addNewLineDeltaShow;
        if (Math.abs(clientY - pos.top) <= delta) {
            top = pos.top;
            this.preview = true;
        }
        if (Math.abs(clientY - (pos.top + pos.height)) <= delta) {
            top = pos.top + pos.height;
            this.preview = false;
        }
        if (top !== false &&
            ((editor.editor === currentElement && !this.preview) ||
                !call(this.preview ? Dom.prev : Dom.next, currentElement, this.canGetFocus, editor.editor))) {
            this.line.style.top = top + 'px';
            this.current = currentElement;
            this.show();
            this.line.style.setProperty('--jd-offset-handle', clientX - pos.left - 10 + 'px');
        }
        else {
            this.current = false;
            this.hide();
        }
    }
    /** @override */
    beforeDestruct() {
        this.j.async.clearTimeout(this.timeout);
        this.j.e.off(this.line).off('changePlace', this.addEventListeners);
        Dom.safeRemove(this.line);
        this.j.e
            .off([this.j.ow, this.j.ew, this.j.editor], '.' + ns)
            .off(this.j.container, '.' + ns);
    }
}
__decorate([
    watch(':lock')
], addNewLine.prototype, "onLock", null);
__decorate([
    autobind
], addNewLine.prototype, "hide", null);
__decorate([
    watch(':dblclick')
], addNewLine.prototype, "onDblClickEditor", null);
__decorate([
    debounce(ctx => ctx.defaultTimeout * 5)
], addNewLine.prototype, "onMouseMove", null);
pluginSystem.add('addNewLine', addNewLine);
