import { GranblueItemSheetBase } from './item-sheet-base.mjs';
import { GRANBLUE } from '../config.mjs';

/** Ficha do item Magia. */
export class GranblueSpellSheet extends GranblueItemSheetBase {
    static DEFAULT_OPTIONS = {
        classes: ['granblue', 'sheet', 'item', 'spell'],
        position: { width: 520, height: 640 }
    };

    static PARTS = {
        main: { template: 'systems/granblue/templates/item/spell.hbs', scrollable: [''] }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        // A esfera vira um seletor: garante que a magia caia no grupo certo da ficha.
        const current = GRANBLUE.normalizeSphere(this.document.system.sphere);
        context.sphereOptions = Object.entries(GRANBLUE.spheres).map(([key, cfg]) => ({
            value: key,
            label: game.i18n.localize(cfg.label),
            selected: key === current
        }));
        return context;
    }
}
