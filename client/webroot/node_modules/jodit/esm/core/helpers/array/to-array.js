/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2023 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */
/**
 * @module helpers/array
 */
import { reset } from "../utils/reset.js";
import { isNativeFunction } from "../checker/is-native-function.js";
/**
 * Always return Array. In some cases(Joomla Mootools)
 * Array.from can be replaced to some bad implementation.
 */
export const toArray = function toArray(...args) {
    const func = isNativeFunction(Array.from)
        ? Array.from
        : reset('Array.from') ?? Array.from;
    return func.apply(Array, args);
};
