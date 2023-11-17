/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2023 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */
import { completeUrl } from "./complete-url.js";
import { isFunction } from "../checker/is-function.js";
import { isString } from "../checker/is-string.js";
const alreadyLoadedList = new Map();
const cacheLoaders = (loader) => {
    return async (jodit, url) => {
        if (alreadyLoadedList.has(url)) {
            return alreadyLoadedList.get(url);
        }
        const promise = loader(jodit, url);
        alreadyLoadedList.set(url, promise);
        return promise;
    };
};
/**
 * Append script in document and call callback function after download
 */
export const appendScript = (jodit, url, callback) => {
    const script = jodit.c.element('script');
    script.type = 'text/javascript';
    script.async = true;
    if (isFunction(callback) && !jodit.isInDestruct) {
        jodit.e.on(script, 'load', callback);
    }
    if (!script.src) {
        script.src = completeUrl(url);
    }
    jodit.od.body.appendChild(script);
    return {
        callback,
        element: script
    };
};
/**
 * Load script and return promise
 */
export const appendScriptAsync = cacheLoaders((jodit, url) => {
    return new Promise((resolve, reject) => {
        if (jodit.isInDestruct) {
            return;
        }
        const { element } = appendScript(jodit, url, resolve);
        !jodit.isInDestruct && jodit.e.on(element, 'error', reject);
    });
});
/**
 * Download CSS style script
 */
export const appendStyleAsync = cacheLoaders((jodit, url) => {
    return new Promise((resolve, reject) => {
        if (jodit.isInDestruct) {
            return;
        }
        const link = jodit.c.element('link');
        link.rel = 'stylesheet';
        link.media = 'all';
        link.crossOrigin = 'anonymous';
        const callback = () => resolve(link);
        !jodit.isInDestruct &&
            jodit.e.on(link, 'load', callback).on(link, 'error', reject);
        link.href = completeUrl(url);
        if (jodit.o.shadowRoot) {
            jodit.o.shadowRoot.appendChild(link);
        }
        else {
            jodit.od.body.appendChild(link);
        }
    });
});
export const loadNext = (jodit, urls, i = 0) => {
    if (!isString(urls[i])) {
        return Promise.resolve();
    }
    return appendScriptAsync(jodit, urls[i]).then(() => loadNext(jodit, urls, i + 1));
};
export function loadNextStyle(jodit, urls, i = 0) {
    if (!isString(urls[i])) {
        return Promise.resolve();
    }
    return appendStyleAsync(jodit, urls[i]).then(() => loadNextStyle(jodit, urls, i + 1));
}
