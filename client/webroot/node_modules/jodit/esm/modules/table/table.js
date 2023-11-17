/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2023 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
        r = Reflect.decorate(decorators, target, key, desc);
    else
        for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i])
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import * as consts from "../../core/constants.js";
import { Dom } from "../../core/dom/index.js";
import { $$, attr, cssPath, isNumber, toArray, trim } from "../../core/helpers/index.js";
import { ViewComponent } from "../../core/component/index.js";
import { getContainer } from "../../core/global.js";
import { debounce } from "../../core/decorators/index.js";
const markedValue = new WeakMap();
export class Table extends ViewComponent {
    constructor() {
        super(...arguments);
        this.selected = new Set();
    }
    /** @override */
    className() {
        return 'Table';
    }
    recalculateStyles() {
        const style = getContainer(this.j, Table, 'style', true);
        const selectors = [];
        this.selected.forEach(td => {
            const selector = cssPath(td);
            selector && selectors.push(selector);
        });
        // eslint-disable-next-line no-prototype-builtins
        style.innerHTML = selectors.length
            ? selectors.join(',') +
                `{${this.jodit.options.table.selectionCellStyle}}`
            : '';
    }
    addSelection(td) {
        this.selected.add(td);
        this.recalculateStyles();
        const table = Dom.closest(td, 'table', this.j.editor);
        if (table) {
            const cells = Table.selectedByTable.get(table) || new Set();
            cells.add(td);
            Table.selectedByTable.set(table, cells);
        }
    }
    removeSelection(td) {
        this.selected.delete(td);
        this.recalculateStyles();
        const table = Dom.closest(td, 'table', this.j.editor);
        if (table) {
            const cells = Table.selectedByTable.get(table);
            if (cells) {
                cells.delete(td);
                if (!cells.size) {
                    Table.selectedByTable.delete(table);
                }
            }
        }
    }
    /**
     * Returns array of selected cells
     */
    getAllSelectedCells() {
        return toArray(this.selected);
    }
    static getSelectedCellsByTable(table) {
        const cells = Table.selectedByTable.get(table);
        return cells ? toArray(cells) : [];
    }
    /** @override **/
    destruct() {
        this.selected.clear();
        return super.destruct();
    }
    /**
     * Returns rows count in the table
     */
    static getRowsCount(table) {
        return table.rows.length;
    }
    /**
     * Returns columns count in the table
     */
    static getColumnsCount(table) {
        const matrix = Table.formalMatrix(table);
        return matrix.reduce((max_count, cells) => Math.max(max_count, cells.length), 0);
    }
    /**
     * Generate formal table martix columns*rows
     * @param callback - if return false cycle break
     */
    static formalMatrix(table, callback) {
        const matrix = [[]];
        const rows = toArray(table.rows);
        const setCell = (cell, i) => {
            if (matrix[i] === undefined) {
                matrix[i] = [];
            }
            const colSpan = cell.colSpan, rowSpan = cell.rowSpan;
            let column, row, currentColumn = 0;
            while (matrix[i][currentColumn]) {
                currentColumn += 1;
            }
            for (row = 0; row < rowSpan; row += 1) {
                for (column = 0; column < colSpan; column += 1) {
                    if (matrix[i + row] === undefined) {
                        matrix[i + row] = [];
                    }
                    if (callback &&
                        callback(cell, i + row, currentColumn + column, colSpan, rowSpan) === false) {
                        return false;
                    }
                    matrix[i + row][currentColumn + column] = cell;
                }
            }
        };
        for (let i = 0; i < rows.length; i += 1) {
            const cells = toArray(rows[i].cells);
            for (let j = 0; j < cells.length; j += 1) {
                if (setCell(cells[j], i) === false) {
                    return matrix;
                }
            }
        }
        return matrix;
    }
    /**
     * Get cell coordinate in formal table (without colspan and rowspan)
     */
    static formalCoordinate(table, cell, max = false) {
        let i = 0, j = 0, width = 1, height = 1;
        Table.formalMatrix(table, (td, ii, jj, colSpan, rowSpan) => {
            if (cell === td) {
                i = ii;
                j = jj;
                width = colSpan || 1;
                height = rowSpan || 1;
                if (max) {
                    j += (colSpan || 1) - 1;
                    i += (rowSpan || 1) - 1;
                }
                return false;
            }
        });
        return [i, j, width, height];
    }
    /**
     * Inserts a new line after row what contains the selected cell
     *
     * @param line - Insert a new line after/before this
     * line contains the selected cell
     * @param after - Insert a new line after line contains the selected cell
     */
    static appendRow(table, line, after, create) {
        let row;
        if (!line) {
            const columnsCount = Table.getColumnsCount(table);
            row = create.element('tr');
            for (let j = 0; j < columnsCount; j += 1) {
                row.appendChild(create.element('td'));
            }
        }
        else {
            row = line.cloneNode(true);
            $$('td,th', line).forEach(cell => {
                const rowspan = attr(cell, 'rowspan');
                if (rowspan && parseInt(rowspan, 10) > 1) {
                    const newRowSpan = parseInt(rowspan, 10) - 1;
                    attr(cell, 'rowspan', newRowSpan > 1 ? newRowSpan : null);
                }
            });
            $$('td,th', row).forEach(cell => {
                cell.innerHTML = '';
            });
        }
        if (after && line && line.nextSibling) {
            line.parentNode &&
                line.parentNode.insertBefore(row, line.nextSibling);
        }
        else if (!after && line) {
            line.parentNode && line.parentNode.insertBefore(row, line);
        }
        else {
            (table.getElementsByTagName('tbody')?.[0] || table).appendChild(row);
        }
    }
    /**
     * Remove row
     */
    static removeRow(table, rowIndex) {
        const box = Table.formalMatrix(table);
        let dec;
        const row = table.rows[rowIndex];
        box[rowIndex].forEach((cell, j) => {
            dec = false;
            if (rowIndex - 1 >= 0 && box[rowIndex - 1][j] === cell) {
                dec = true;
            }
            else if (box[rowIndex + 1] && box[rowIndex + 1][j] === cell) {
                if (cell.parentNode === row && cell.parentNode.nextSibling) {
                    dec = true;
                    let nextCell = j + 1;
                    while (box[rowIndex + 1][nextCell] === cell) {
                        nextCell += 1;
                    }
                    const nextRow = Dom.next(cell.parentNode, elm => Dom.isTag(elm, 'tr'), table);
                    if (nextRow) {
                        if (box[rowIndex + 1][nextCell]) {
                            nextRow.insertBefore(cell, box[rowIndex + 1][nextCell]);
                        }
                        else {
                            nextRow.appendChild(cell);
                        }
                    }
                }
            }
            else {
                Dom.safeRemove(cell);
            }
            if (dec &&
                (cell.parentNode === row || cell !== box[rowIndex][j - 1])) {
                const rowSpan = cell.rowSpan;
                attr(cell, 'rowspan', rowSpan - 1 > 1 ? rowSpan - 1 : null);
            }
        });
        Dom.safeRemove(row);
    }
    /**
     * Insert column before / after all the columns containing the selected cells
     */
    static appendColumn(table, j, after, create) {
        const box = Table.formalMatrix(table);
        let i;
        if (j === undefined || j < 0) {
            j = Table.getColumnsCount(table) - 1;
        }
        for (i = 0; i < box.length; i += 1) {
            const cell = create.element('td');
            const td = box[i][j];
            let added = false;
            if (after) {
                if ((box[i] && td && j + 1 >= box[i].length) ||
                    td !== box[i][j + 1]) {
                    if (td.nextSibling) {
                        Dom.before(td.nextSibling, cell);
                    }
                    else {
                        td.parentNode && td.parentNode.appendChild(cell);
                    }
                    added = true;
                }
            }
            else {
                if (j - 1 < 0 ||
                    (box[i][j] !== box[i][j - 1] && box[i][j].parentNode)) {
                    Dom.before(box[i][j], cell);
                    added = true;
                }
            }
            if (!added) {
                attr(box[i][j], 'colspan', parseInt(attr(box[i][j], 'colspan') || '1', 10) + 1);
            }
        }
    }
    /**
     * Remove column by index
     */
    static removeColumn(table, j) {
        const box = Table.formalMatrix(table);
        let dec;
        box.forEach((cells, i) => {
            const td = cells[j];
            dec = false;
            if (j - 1 >= 0 && box[i][j - 1] === td) {
                dec = true;
            }
            else if (j + 1 < cells.length && box[i][j + 1] === td) {
                dec = true;
            }
            else {
                Dom.safeRemove(td);
            }
            if (dec && (i - 1 < 0 || td !== box[i - 1][j])) {
                const colSpan = td.colSpan;
                attr(td, 'colspan', colSpan - 1 > 1 ? (colSpan - 1).toString() : null);
            }
        });
    }
    /**
     * Define bound for selected cells
     */
    static getSelectedBound(table, selectedCells) {
        const bound = [
            [Infinity, Infinity],
            [0, 0]
        ];
        const box = Table.formalMatrix(table);
        let i, j, k;
        for (i = 0; i < box.length; i += 1) {
            for (j = 0; box[i] && j < box[i].length; j += 1) {
                if (selectedCells.includes(box[i][j])) {
                    bound[0][0] = Math.min(i, bound[0][0]);
                    bound[0][1] = Math.min(j, bound[0][1]);
                    bound[1][0] = Math.max(i, bound[1][0]);
                    bound[1][1] = Math.max(j, bound[1][1]);
                }
            }
        }
        for (i = bound[0][0]; i <= bound[1][0]; i += 1) {
            for (k = 1, j = bound[0][1]; j <= bound[1][1]; j += 1) {
                while (box[i] && box[i][j - k] && box[i][j] === box[i][j - k]) {
                    bound[0][1] = Math.min(j - k, bound[0][1]);
                    bound[1][1] = Math.max(j - k, bound[1][1]);
                    k += 1;
                }
                k = 1;
                while (box[i] && box[i][j + k] && box[i][j] === box[i][j + k]) {
                    bound[0][1] = Math.min(j + k, bound[0][1]);
                    bound[1][1] = Math.max(j + k, bound[1][1]);
                    k += 1;
                }
                k = 1;
                while (box[i - k] && box[i][j] === box[i - k][j]) {
                    bound[0][0] = Math.min(i - k, bound[0][0]);
                    bound[1][0] = Math.max(i - k, bound[1][0]);
                    k += 1;
                }
                k = 1;
                while (box[i + k] && box[i][j] === box[i + k][j]) {
                    bound[0][0] = Math.min(i + k, bound[0][0]);
                    bound[1][0] = Math.max(i + k, bound[1][0]);
                    k += 1;
                }
            }
        }
        return bound;
    }
    /**
     * Try recalculate all coluns and rows after change
     */
    static normalizeTable(table) {
        let i, j, min, not;
        const __marked = [], box = Table.formalMatrix(table);
        // remove extra colspans
        for (j = 0; j < box[0].length; j += 1) {
            min = 1000000;
            not = false;
            for (i = 0; i < box.length; i += 1) {
                if (box[i][j] === undefined) {
                    continue; // broken table
                }
                if (box[i][j].colSpan < 2) {
                    not = true;
                    break;
                }
                min = Math.min(min, box[i][j].colSpan);
            }
            if (!not) {
                for (i = 0; i < box.length; i += 1) {
                    if (box[i][j] === undefined) {
                        continue; // broken table
                    }
                    Table.mark(box[i][j], 'colspan', box[i][j].colSpan - min + 1, __marked);
                }
            }
        }
        // remove extra rowspans
        for (i = 0; i < box.length; i += 1) {
            min = 1000000;
            not = false;
            for (j = 0; j < box[i].length; j += 1) {
                if (box[i][j] === undefined) {
                    continue; // broken table
                }
                if (box[i][j].rowSpan < 2) {
                    not = true;
                    break;
                }
                min = Math.min(min, box[i][j].rowSpan);
            }
            if (!not) {
                for (j = 0; j < box[i].length; j += 1) {
                    if (box[i][j] === undefined) {
                        continue; // broken table
                    }
                    Table.mark(box[i][j], 'rowspan', box[i][j].rowSpan - min + 1, __marked);
                }
            }
        }
        // remove rowspans and colspans equal 1 and empty class
        for (i = 0; i < box.length; i += 1) {
            for (j = 0; j < box[i].length; j += 1) {
                if (box[i][j] === undefined) {
                    continue; // broken table
                }
                if (box[i][j].hasAttribute('rowspan') &&
                    box[i][j].rowSpan === 1) {
                    attr(box[i][j], 'rowspan', null);
                }
                if (box[i][j].hasAttribute('colspan') &&
                    box[i][j].colSpan === 1) {
                    attr(box[i][j], 'colspan', null);
                }
                if (box[i][j].hasAttribute('class') &&
                    !attr(box[i][j], 'class')) {
                    attr(box[i][j], 'class', null);
                }
            }
        }
        Table.unmark(__marked);
    }
    /**
     * It combines all of the selected cells into one. The contents of the cells will also be combined
     */
    static mergeSelected(table, jodit) {
        const html = [], bound = Table.getSelectedBound(table, Table.getSelectedCellsByTable(table));
        let w = 0, first = null, first_j = 0, td, cols = 0, rows = 0;
        const alreadyMerged = new Set(), __marked = [];
        if (bound && (bound[0][0] - bound[1][0] || bound[0][1] - bound[1][1])) {
            Table.formalMatrix(table, (cell, i, j, cs, rs) => {
                if (i >= bound[0][0] && i <= bound[1][0]) {
                    if (j >= bound[0][1] && j <= bound[1][1]) {
                        td = cell;
                        if (alreadyMerged.has(td)) {
                            return;
                        }
                        alreadyMerged.add(td);
                        if (i === bound[0][0] && td.style.width) {
                            w += td.offsetWidth;
                        }
                        if (trim(cell.innerHTML.replace(/<br(\/)?>/g, '')) !== '') {
                            html.push(cell.innerHTML);
                        }
                        if (cs > 1) {
                            cols += cs - 1;
                        }
                        if (rs > 1) {
                            rows += rs - 1;
                        }
                        if (!first) {
                            first = cell;
                            first_j = j;
                        }
                        else {
                            Table.mark(td, 'remove', 1, __marked);
                            instance(jodit).removeSelection(td);
                        }
                    }
                }
            });
            cols = bound[1][1] - bound[0][1] + 1;
            rows = bound[1][0] - bound[0][0] + 1;
            if (first) {
                if (cols > 1) {
                    Table.mark(first, 'colspan', cols, __marked);
                }
                if (rows > 1) {
                    Table.mark(first, 'rowspan', rows, __marked);
                }
                if (w) {
                    Table.mark(first, 'width', ((w / table.offsetWidth) * 100).toFixed(consts.ACCURACY) + '%', __marked);
                    if (first_j) {
                        Table.setColumnWidthByDelta(table, first_j, 0, true, __marked);
                    }
                }
                first.innerHTML = html.join('<br/>');
                instance(jodit).addSelection(first);
                alreadyMerged.delete(first);
                Table.unmark(__marked);
                Table.normalizeTable(table);
                toArray(table.rows).forEach((tr, index) => {
                    if (!tr.cells.length) {
                        Dom.safeRemove(tr);
                    }
                });
            }
        }
    }
    /**
     * Divides all selected by `jodit_focused_cell` class table cell in 2 parts vertical. Those division into 2 columns
     */
    static splitHorizontal(table, jodit) {
        let coord, td, tr, parent, after;
        const __marked = [];
        Table.getSelectedCellsByTable(table).forEach((cell) => {
            td = jodit.createInside.element('td');
            td.appendChild(jodit.createInside.element('br'));
            tr = jodit.createInside.element('tr');
            coord = Table.formalCoordinate(table, cell);
            if (cell.rowSpan < 2) {
                Table.formalMatrix(table, (tdElm, i, j) => {
                    if (coord[0] === i &&
                        coord[1] !== j &&
                        tdElm !== cell) {
                        Table.mark(tdElm, 'rowspan', tdElm.rowSpan + 1, __marked);
                    }
                });
                Dom.after(Dom.closest(cell, 'tr', table), tr);
                tr.appendChild(td);
            }
            else {
                Table.mark(cell, 'rowspan', cell.rowSpan - 1, __marked);
                Table.formalMatrix(table, (tdElm, i, j) => {
                    if (i > coord[0] &&
                        i < coord[0] + cell.rowSpan &&
                        coord[1] > j &&
                        tdElm.parentNode
                            .rowIndex === i) {
                        after = tdElm;
                    }
                    if (coord[0] < i && tdElm === cell) {
                        parent = table.rows[i];
                    }
                });
                if (after) {
                    Dom.after(after, td);
                }
                else {
                    parent.insertBefore(td, parent.firstChild);
                }
            }
            if (cell.colSpan > 1) {
                Table.mark(td, 'colspan', cell.colSpan, __marked);
            }
            Table.unmark(__marked);
            instance(jodit).removeSelection(cell);
        });
        this.normalizeTable(table);
    }
    /**
     * It splits all the selected cells into 2 parts horizontally. Those. are added new row
     */
    static splitVertical(table, jodit) {
        let coord, td, percentage;
        const __marked = [];
        Table.getSelectedCellsByTable(table).forEach(cell => {
            coord = Table.formalCoordinate(table, cell);
            if (cell.colSpan < 2) {
                Table.formalMatrix(table, (tdElm, i, j) => {
                    if (coord[1] === j && coord[0] !== i && tdElm !== cell) {
                        Table.mark(tdElm, 'colspan', tdElm.colSpan + 1, __marked);
                    }
                });
            }
            else {
                Table.mark(cell, 'colspan', cell.colSpan - 1, __marked);
            }
            td = jodit.createInside.element('td');
            td.appendChild(jodit.createInside.element('br'));
            if (cell.rowSpan > 1) {
                Table.mark(td, 'rowspan', cell.rowSpan, __marked);
            }
            const oldWidth = cell.offsetWidth; // get old width
            Dom.after(cell, td);
            percentage = oldWidth / table.offsetWidth / 2;
            Table.mark(cell, 'width', (percentage * 100).toFixed(consts.ACCURACY) + '%', __marked);
            Table.mark(td, 'width', (percentage * 100).toFixed(consts.ACCURACY) + '%', __marked);
            Table.unmark(__marked);
            instance(jodit).removeSelection(cell);
        });
        Table.normalizeTable(table);
    }
    /**
     * Set column width used delta value
     */
    static setColumnWidthByDelta(table, column, delta, noUnmark, marked) {
        const box = Table.formalMatrix(table);
        let clearWidthIndex = 0;
        for (let i = 0; i < box.length; i += 1) {
            const cell = box[i][column];
            if (cell.colSpan > 1 && box.length > 1) {
                continue;
            }
            const w = cell.offsetWidth;
            const percent = ((w + delta) / table.offsetWidth) * 100;
            Table.mark(cell, 'width', percent.toFixed(consts.ACCURACY) + '%', marked);
            clearWidthIndex = i;
            break;
        }
        for (let i = clearWidthIndex + 1; i < box.length; i += 1) {
            const cell = box[i][column];
            Table.mark(cell, 'width', null, marked);
        }
        if (!noUnmark) {
            Table.unmark(marked);
        }
    }
    static mark(cell, key, value, marked) {
        marked.push(cell);
        const dict = markedValue.get(cell) ?? {};
        dict[key] = value === undefined ? 1 : value;
        markedValue.set(cell, dict);
    }
    static unmark(marked) {
        marked.forEach(cell => {
            const dict = markedValue.get(cell);
            if (dict) {
                Object.keys(dict).forEach((key) => {
                    const value = dict[key];
                    switch (key) {
                        case 'remove':
                            Dom.safeRemove(cell);
                            break;
                        case 'rowspan':
                            attr(cell, 'rowspan', isNumber(value) && value > 1 ? value : null);
                            break;
                        case 'colspan':
                            attr(cell, 'colspan', isNumber(value) && value > 1 ? value : null);
                            break;
                        case 'width':
                            if (value == null) {
                                cell.style.removeProperty('width');
                                if (!attr(cell, 'style')) {
                                    attr(cell, 'style', null);
                                }
                            }
                            else {
                                cell.style.width = value.toString();
                            }
                            break;
                    }
                    delete dict[key];
                });
                markedValue.delete(cell);
            }
        });
    }
}
Table.selectedByTable = new WeakMap();
__decorate([
    debounce()
], Table.prototype, "recalculateStyles", null);
const instance = (j) => j.getInstance('Table', j.o);
