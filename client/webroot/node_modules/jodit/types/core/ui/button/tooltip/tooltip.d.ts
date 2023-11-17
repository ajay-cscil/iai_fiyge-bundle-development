/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2023 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */
/**
 * [[include:plugins/tooltip/README.md]]
 * @packageDocumentation
 * @module plugins/tooltip
 */

import type { IViewBased } from "../../../../types";
import { UIElement } from "../../element";
export declare class UITooltip extends UIElement {
    private __isOpened;
    className(): string;
    protected render(): string;
    constructor(view: IViewBased);
    private __listenClose;
    private __addListenersOnClose;
    private __removeListenersOnClose;
    private __currentTarget;
    private __onMouseLeave;
    private __onMouseEnter;
    private __delayShowTimeout;
    private __hideTimeout;
    private __delayOpen;
    private __open;
    private __setPosition;
    private __hide;
    private __hideDelay;
    destruct(): void;
}
