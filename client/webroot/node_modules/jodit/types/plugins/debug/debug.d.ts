/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2023 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */
/**
 * [[include:plugins/debug/README.md]]
 * @packageDocumentation
 * @module plugins/debug
 */
import type { IJodit } from "../../types";
import { Plugin } from "../../core/plugin";
export declare class Debug extends Plugin {
    protected afterInit(jodit: IJodit): void;
    protected beforeDestruct(jodit: IJodit): void;
}
