import { GranblueItemSheetBase } from './item-sheet-base.mjs';
import { GRANBLUE } from '../config.mjs';

/** Ficha do item Classe. */
export class GranblueClassSheet extends GranblueItemSheetBase {
    static HTML_FIELDS = ['description'];

    static DEFAULT_OPTIONS = {
        classes: ['granblue', 'sheet', 'item', 'class'],
        position: { width: 600, height: 740 }
    };

    static PARTS = {
        main: { template: 'systems/granblue/templates/item/class.hbs', scrollable: ['.gb-item-body'] }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const sys = this.document.system;
        context.grupoOptions = Object.entries(GRANBLUE.classGroups).map(([value, label]) => ({
            value, label: game.i18n.localize(label), selected: value === sys.grupo
        }));
        context.abilities = sys.abilities ?? [];
        return context;
    }
}
