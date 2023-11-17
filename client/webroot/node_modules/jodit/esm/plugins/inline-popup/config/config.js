/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2023 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */
import { Config } from "../../../config.js";
import { Icon } from "../../../core/ui/icon.js";
import * as addcolumn from "../icons/addcolumn.svg.js";
import * as addrow from "../icons/addrow.svg.js";
import * as merge from "../icons/merge.svg.js";
import * as th from "../icons/th.svg.js";
import * as splitg from "../icons/splitg.svg.js";
import * as splitv from "../icons/splitv.svg.js";
import * as thList from "../icons/th-list.svg.js";
import a from "./items/a.js";
import img from "./items/img.js";
import cells from "./items/cells.js";
import toolbar from "./items/toolbar.js";
import jodit from "./items/iframe.js";
import iframe from "./items/iframe.js";
import joditMedia from "./items/iframe.js";
Config.prototype.toolbarInline = true;
Config.prototype.toolbarInlineForSelection = false;
Config.prototype.toolbarInlineDisableFor = [];
Config.prototype.toolbarInlineDisabledButtons = ['source'];
Icon.set('addcolumn', addcolumn.default)
    .set('addrow', addrow.default)
    .set('merge', merge.default)
    .set('th', th.default)
    .set('splitg', splitg.default)
    .set('splitv', splitv.default)
    .set('th-list', thList.default);
Config.prototype.popup = {
    a,
    img,
    cells,
    toolbar,
    jodit,
    iframe,
    'jodit-media': joditMedia,
    selection: [
        'bold',
        'underline',
        'italic',
        'ul',
        'ol',
        '\n',
        'outdent',
        'indent',
        'fontsize',
        'brush',
        'cut',
        '\n',
        'paragraph',
        'link',
        'align',
        'dots'
    ]
};
