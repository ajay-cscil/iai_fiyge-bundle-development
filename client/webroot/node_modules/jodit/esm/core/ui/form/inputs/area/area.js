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
var UITextArea_1;
/**
 * @module ui/form/inputs
 */
import { UIInput } from "../input/input.js";
import { component } from "../../../../decorators/component/component.js";
export let UITextArea = UITextArea_1 = class UITextArea extends UIInput {
    /** @override */
    className() {
        return 'UITextArea';
    }
    constructor(jodit, state) {
        super(jodit, state);
        /** @override */
        this.state = { ...UITextArea_1.defaultState };
        this.nativeInput = this.j.create.element('textarea');
        Object.assign(this.state, state);
        if (this.state.resizable === false) {
            this.nativeInput.style.resize = 'none';
        }
    }
};
/** @override */
UITextArea.defaultState = {
    ...UIInput.defaultState,
    size: 5,
    resizable: true
};
UITextArea = UITextArea_1 = __decorate([
    component
], UITextArea);
