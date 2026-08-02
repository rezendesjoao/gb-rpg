import { GranblueItemSheetBase } from './item-sheet-base.mjs';
import { GRANBLUE } from '../config.mjs';

/** Ficha do item Herança. */
export class GranblueHeritageSheet extends GranblueItemSheetBase {
    static DEFAULT_OPTIONS = {
        classes: ['granblue', 'sheet', 'item', 'heritage'],
        position: { width: 580, height: 700 }
    };

    static PARTS = {
        main: { template: 'systems/granblue/templates/item/heritage.hbs', scrollable: [''] }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const sys = this.document.system;
        context.bonuses = Object.entries(GRANBLUE.attributes).map(([key, cfg]) => ({
            key,
            label: game.i18n.localize(cfg.label),
            value: sys.bonuses?.[key] ?? 0
        }));
        context.progress = sys.progress ?? [];
        return context;
    }
}
