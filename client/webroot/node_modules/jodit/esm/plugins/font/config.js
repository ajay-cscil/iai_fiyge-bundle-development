/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2023 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */
import { Config } from "../../config.js";
import { Dom } from "../../core/dom/dom.js";
import { css, memorizeExec } from "../../core/helpers/utils/index.js";
import { Icon } from "../../core/ui/icon.js";
import fontsizeIcon from "./icons/fontsize.svg.js";
import fontIcon from "./icons/font.svg.js";
/**
 * Default font-size points
 */
Config.prototype.defaultFontSizePoints = 'px';
Icon.set('font', fontIcon).set('fontsize', fontsizeIcon);
Config.prototype.controls.fontsize = {
    command: 'fontsize',
    data: {
        cssRule: 'font-size'
    },
    list: [
        '8',
        '9',
        '10',
        '11',
        '12',
        '14',
        '16',
        '18',
        '24',
        '30',
        '36',
        '48',
        '60',
        '72',
        '96'
    ],
    exec: (editor, event, { control }) => memorizeExec(editor, event, { control }, (value) => {
        if (control.command?.toLowerCase() === 'fontsize') {
            return `${value}${editor.o.defaultFontSizePoints}`;
        }
        return value;
    }),
    childTemplate: (editor, key, value) => {
        return `${value}${editor.o.defaultFontSizePoints}`;
    },
    tooltip: 'Font size',
    isChildActive: (editor, control) => {
        const current = editor.s.current(), cssKey = control.data?.cssRule || 'font-size', normalize = control.data?.normalize ||
            ((v) => {
                if (/pt$/i.test(v) &&
                    editor.o.defaultFontSizePoints === 'pt') {
                    return v.replace(/pt$/i, '');
                }
                return v;
            });
        if (current) {
            const currentBpx = Dom.closest(current, Dom.isElement, editor.editor) || editor.editor;
            const value = css(currentBpx, cssKey);
            return Boolean(value &&
                control.args &&
                normalize(control.args[0].toString()) ===
                    normalize(value.toString()));
        }
        return false;
    }
};
Config.prototype.controls.font = {
    ...Config.prototype.controls.fontsize,
    command: 'fontname',
    list: {
        '': 'Default',
        'helvetica,sans-serif': 'Helvetica',
        'arial,helvetica,sans-serif': 'Arial',
        'georgia,palatino,serif': 'Georgia',
        'impact,charcoal,sans-serif': 'Impact',
        'tahoma,geneva,sans-serif': 'Tahoma',
        'times new roman,times,serif': 'Times New Roman',
        'verdana,geneva,sans-serif': 'Verdana'
    },
    childTemplate: (editor, key, value) => {
        let isAvailable = false;
        try {
            isAvailable =
                key.indexOf('dings') === -1 &&
                    document.fonts.check(`16px ${key}`, value);
        }
        catch { }
        return `<span data-style="${key}" style="${isAvailable ? `font-family: ${key}!important;` : ''}">${value}</span>`;
    },
    data: {
        cssRule: 'font-family',
        normalize: (v) => {
            return v
                .toLowerCase()
                .replace(/['"]+/g, '')
                .replace(/[^a-z0-9]+/g, ',');
        }
    },
    tooltip: 'Font family'
};
