import { GranblueItemSheetBase } from './item-sheet-base.mjs';

/** Ficha do item Magia. */
export class GranblueSpellSheet extends GranblueItemSheetBase {
    static DEFAULT_OPTIONS = {
        classes: ['granblue', 'sheet', 'item', 'spell'],
        position: { width: 520, height: 640 }
    };

    static PARTS = {
        main: { template: 'systems/granblue/templates/item/spell.hbs', scrollable: [''] }
    };
}
