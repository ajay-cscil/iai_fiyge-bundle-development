/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2023 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */
import { isVoid } from "../../../helpers/checker/is-void.js";
import { normalizeCssValue } from "../../../helpers/normalize/normalize-css-value.js";
import { Dom } from "../../../dom/dom.js";
import { assert } from "../../../helpers/utils/assert.js";
/**
 * Element has the same styles as in the commit
 * @private
 */
export function hasSameStyle(elm, rules) {
    return Boolean(!Dom.isTag(elm, 'font') &&
        Dom.isHTMLElement(elm) &&
        Object.keys(rules).every(property => {
            const value = css(elm, property, true);
            if (value === '' &&
                (rules[property] === '' || rules[property] == null)) {
                return true;
            }
            return (!isVoid(value) &&
                value !== '' &&
                !isVoid(rules[property]) &&
                normalizeCssValue(property, rules[property])
                    .toString()
                    .toLowerCase() === value.toString().toLowerCase());
        }));
}
const elm = document.createElement('div');
elm.style.color = 'red';
assert(hasSameStyle(elm, { color: 'red' }), 'Style test');
assert(hasSameStyle(elm, { fontSize: null }), 'Style test');
assert(hasSameStyle(elm, { fontSize: '' }), 'Style test');
/**
 * Element has the similar styles
 */
export function hasSameStyleKeys(elm, rules) {
    return Boolean(!Dom.isTag(elm, 'font') &&
        Dom.isHTMLElement(elm) &&
        Object.keys(rules).every(property => {
            const value = css(elm, property, true);
            return !isVoid(value);
        }));
}
assert(hasSameStyleKeys(elm, { color: 'red' }), 'Style test');
assert(hasSameStyleKeys(elm, { font: 'Arial', color: 'red' }), 'Style test');
