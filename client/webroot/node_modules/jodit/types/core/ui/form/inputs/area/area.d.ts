/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2023 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */
/**
 * @module ui/form/inputs
 */

import type { IUITextArea, IViewBased } from "../../../../../types";
import { UIInput } from "../input/input";
export declare class UITextArea extends UIInput implements IUITextArea {
    /** @override */
    className(): string;
    /** @override */
    static defaultState: IUITextArea['state'];
    nativeInput: HTMLTextAreaElement;
    /** @override */
    state: IUITextArea['state'];
    constructor(jodit: IViewBased, state: Partial<IUITextArea['state']>);
}
