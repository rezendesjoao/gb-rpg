import { GranblueItemSheetBase } from './item-sheet-base.mjs';
import { GRANBLUE } from '../config.mjs';

/** Ficha do item Herança. */
export class GranblueHeritageSheet extends GranblueItemSheetBase {
    static HTML_FIELDS = ['sharedTrait', 'weakness', 'description'];

    static DEFAULT_OPTIONS = {
        classes: ['granblue', 'sheet', 'item', 'heritage'],
        position: { width: 600, height: 740 }
    };

    static PARTS = {
        main: { template: 'systems/granblue/templates/item/heritage.hbs', scrollable: ['.gb-item-body'] }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const sys = this.document.system;
        context.bonuses = Object.entries(GRANBLUE.attributes).map(([key, cfg]) => ({
            key,
            label: game.i18n.localize(cfg.label),
            icon: cfg.icon,
            group: GRANBLUE.magicalAttributes.includes(key) ? 'mente' : 'corpo',
            value: sys.bonuses?.[key] ?? 0
        }));
        context.progress = sys.progress ?? [];
        return context;
    }
}
