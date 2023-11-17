/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2023 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */
import { isFunction, isString } from "../../../core/helpers/index.js";
export function buildData(uploader, data) {
    if (isFunction(uploader.o.buildData)) {
        return uploader.o.buildData.call(uploader, data);
    }
    const FD = uploader.ow.FormData;
    if (FD !== undefined) {
        if (data instanceof FD) {
            return data;
        }
        if (isString(data)) {
            return data;
        }
        const newData = new FD();
        Object.keys(data).forEach(key => {
            newData.append(key, data[key]);
        });
        return newData;
    }
    return data;
}
