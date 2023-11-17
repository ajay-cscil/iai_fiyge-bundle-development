/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2023 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */
import { Config } from "../../config.js";
import { Dom } from "../../modules/index.js";
import { memorizeExec } from "../../core/helpers/index.js";
import { pluginSystem } from "../../core/global.js";
import { Icon } from "../../core/ui/icon.js";
import paragraphIcon from "./paragraph.svg.js";
Icon.set('paragraph', paragraphIcon);
Config.prototype.controls.paragraph = {
    command: 'formatBlock',
    update(button, editor) {
        const control = button.control, current = editor.s.current();
        if (current && editor.o.textIcons) {
            const currentBox = Dom.closest(current, Dom.isBlock, editor.editor) ||
                editor.editor, currentValue = currentBox.nodeName.toLowerCase(), list = control.list;
            if (button &&
                control.data &&
                control.data.currentValue !== currentValue &&
                list &&
                list[currentValue]) {
                if (editor.o.textIcons) {
                    button.state.text = currentValue;
                }
                else {
                    button.state.icon.name = currentValue;
                }
                control.data.currentValue = currentValue;
            }
        }
        return false;
    },
    exec: memorizeExec,
    data: {
        currentValue: 'left'
    },
    list: {
        p: 'Normal',
        h1: 'Heading 1',
        h2: 'Heading 2',
        h3: 'Heading 3',
        h4: 'Heading 4',
        blockquote: 'Quote',
        pre: 'Code'
    },
    isChildActive: (editor, control) => {
        const current = editor.s.current();
        if (current) {
            const currentBox = Dom.closest(current, Dom.isBlock, editor.editor);
            return Boolean(currentBox &&
                currentBox !== editor.editor &&
                control.args !== undefined &&
                currentBox.nodeName.toLowerCase() === control.args[0]);
        }
        return false;
    },
    isActive: (editor, control) => {
        const current = editor.s.current();
        if (current) {
            const currentBpx = Dom.closest(current, Dom.isBlock, editor.editor);
            return Boolean(currentBpx &&
                currentBpx !== editor.editor &&
                control.list !== undefined &&
                !Dom.isTag(currentBpx, 'p') &&
                control.list[currentBpx.nodeName.toLowerCase()] !== undefined);
        }
        return false;
    },
    childTemplate: (e, key, value) => `<${key} style="margin:0;padding:0"><span>${e.i18n(value)}</span></${key}>`,
    tooltip: 'Insert format block'
};
/**
 * Process command - `formatblock`
 */
export function formatBlock(editor) {
    editor.registerButton({
        name: 'paragraph',
        group: 'font'
    });
    editor.registerCommand('formatblock', (command, second, third) => {
        editor.s.commitStyle({
            element: third
        });
        editor.synchronizeValues();
        return false;
    });
}
pluginSystem.add('formatBlock', formatBlock);
