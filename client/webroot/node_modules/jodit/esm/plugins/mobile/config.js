/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2023 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */
/**
 * @module plugins/mobile
 */
import { Config } from "../../config.js";
import * as consts from "../../core/constants.js";
import { makeCollection } from "../../modules/toolbar/factory.js";
import { splitArray } from "../../core/helpers/index.js";
import { ToolbarCollection } from "../../modules/toolbar/collection/collection.js";
Config.prototype.mobileTapTimeout = 300;
Config.prototype.toolbarAdaptive = true;
Config.prototype.controls.dots = {
    mode: consts.MODE_SOURCE + consts.MODE_WYSIWYG,
    popup: (editor, current, control, close, button) => {
        let store = control.data;
        if (store === undefined) {
            store = {
                toolbar: makeCollection(editor),
                rebuild: () => {
                    if (button) {
                        const buttons = editor.e.fire('getDiffButtons.mobile', button.closest(ToolbarCollection));
                        if (buttons && store) {
                            store.toolbar.build(splitArray(buttons));
                            const w = editor.toolbar?.firstButton?.container
                                .offsetWidth || 36;
                            store.toolbar.container.style.width =
                                (w + 4) * 3 + 'px';
                        }
                    }
                }
            };
            control.data = store;
        }
        store.rebuild();
        return store.toolbar;
    },
    tooltip: 'Show all'
};
