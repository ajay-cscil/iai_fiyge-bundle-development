/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2023 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */
/**
 * [[include:README.md]]
 * @packageDocumentation
 * @module jodit
 */
import * as constants from "./core/constants.js";
import { Jodit as DefaultJodit } from "./jodit.js";
import Languages from "./languages.js";
import * as decorators from "./core/decorators/index.js";
import * as Modules from "./modules/index.js";
import * as Icons from "./styles/icons/index.js";
import "./plugins/index.js";
// copy constants in Jodit
Object.keys(constants).forEach((key) => {
    DefaultJodit[key] = constants[key];
});
const esFilter = (key) => key !== '__esModule';
// Icons
Object.keys(Icons)
    .filter(esFilter)
    .forEach((key) => {
    Modules.Icon.set(key.replace('_', '-'), Icons[key]);
});
// Modules
Object.keys(Modules)
    .filter(esFilter)
    .forEach((key) => {
    // @ts-ignore
    DefaultJodit.modules[key] = Modules[key];
});
// Decorators
Object.keys(decorators)
    .filter(esFilter)
    .forEach((key) => {
    // @ts-ignore
    DefaultJodit.decorators[key] = decorators[key];
});
['Confirm', 'Alert', 'Prompt'].forEach((key) => {
    // @ts-ignore
    DefaultJodit[key] = Modules[key];
});
// Languages
Object.keys(Languages)
    .filter(esFilter)
    .forEach((key) => {
    DefaultJodit.lang[key] = Languages[key];
});
export { DefaultJodit as Jodit };
export class CommitMode {
}
