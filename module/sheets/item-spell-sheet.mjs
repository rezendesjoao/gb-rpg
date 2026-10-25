import { GranblueItemSheetBase } from './item-sheet-base.mjs';
import { GRANBLUE } from '../config.mjs';
import { sigilSVG, roman } from '../sigil.mjs';

/** Ficha do item Magia, com o selo procedural da magia no alto. */
export class GranblueSpellSheet extends GranblueItemSheetBase {
    static HTML_FIELDS = ['effect', 'description'];

    static DEFAULT_OPTIONS = {
        classes: ['granblue', 'sheet', 'item', 'spell'],
        position: { width: 600, height: 760 }
    };

    static PARTS = {
        main: {
            template: 'systems/granblue/templates/item/spell.hbs',
            templates: ['systems/granblue/templates/actor/parts/range-fields.hbs'],
            scrollable: ['.gb-item-body']
        }
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
        // Efeito que a magia aplica (botão de aplicar na ficha e no cartão de chat)
        context.statusEffectOptions = GRANBLUE.statusEffectOptions();
        // O selo e a cor da esfera do cabeçalho
        const sys = this.document.system;
        context.sphereKey = current;
        context.sphereLabel = current ? game.i18n.localize(GRANBLUE.spheres[current].label) : '';
        context.levelRoman = roman(sys.level);
        context.sigil = sigilSVG({ name: this.document.name, sphere: current, arcano: sys.arcano, level: sys.level, detail: 2 });
        return context;
    }
}
