/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2023 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */
import { isFunction, isNumber, isPlainObject } from "../../helpers/checker/index.js";
import { Component, STATUSES } from "../../component/index.js";
import { error } from "../../helpers/utils/error/index.js";
import { assert } from "../../helpers/utils/assert.js";
export function debounce(timeout, firstCallImmediately = false, method = 'debounce') {
    return (target, propertyKey) => {
        const fn = target[propertyKey];
        if (!isFunction(fn)) {
            throw error('Handler must be a Function');
        }
        target.hookStatus(STATUSES.ready, (component) => {
            const { async } = component;
            assert(async != null, `Component ${component.componentName || component.constructor.name} should have "async:IAsync" field`);
            const realTimeout = isFunction(timeout)
                ? timeout(component)
                : timeout;
            Object.defineProperty(component, propertyKey, {
                configurable: true,
                value: async[method](component[propertyKey].bind(component), isNumber(realTimeout) || isPlainObject(realTimeout)
                    ? realTimeout
                    : component.defaultTimeout, firstCallImmediately)
            });
        });
        return {
            configurable: true,
            get() {
                return fn.bind(this);
            }
        };
    };
}
/**
 * Wrap function in throttle wrapper
 */
export function throttle(timeout, firstCallImmediately = false) {
    return debounce(timeout, firstCallImmediately, 'throttle');
}
