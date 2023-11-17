/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2023 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */
import { ConfigFlatten, isString } from "../../helpers/index.js";
import { Config } from "../../../config.js";
/**
 * Get control for button name
 * @private
 */
export function getControlType(button, controls) {
    let buttonControl;
    if (!controls) {
        controls = Config.defaultOptions.controls;
    }
    if (!isString(button)) {
        buttonControl = { name: 'empty', ...ConfigFlatten(button) };
        if (controls[buttonControl.name] !== undefined) {
            buttonControl = {
                ...ConfigFlatten(controls[buttonControl.name]),
                ...ConfigFlatten(buttonControl)
            };
        }
    }
    else {
        buttonControl = findControlType(button, controls) || {
            name: button,
            command: button,
            tooltip: button
        };
    }
    return buttonControl;
}
/**
 * @private
 */
export function findControlType(path, controls) {
    // eslint-disable-next-line prefer-const
    let [namespaceOrKey, key] = path.split(/\./);
    let store = controls;
    if (key != null) {
        if (controls[namespaceOrKey] !== undefined) {
            store = controls[namespaceOrKey];
        }
    }
    else {
        key = namespaceOrKey;
    }
    return store[key]
        ? {
            name: key,
            ...ConfigFlatten(store[key])
        }
        : undefined;
}
