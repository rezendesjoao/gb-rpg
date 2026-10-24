import { GranblueActorSheetBase, SHEET_PARTIALS } from './actor-sheet-base.mjs';
import { GRANBLUE } from '../config.mjs';

/**
 * Ficha do Personagem (Guerreiro Mágico).
 * Classe/herança, esferas e RD vêm da ficha base (compartilhados com o
 * adversário antagonista); aqui ficam rank e inventário.
 */
export class GranblueCharacterSheet extends GranblueActorSheetBase {
    static DEFAULT_OPTIONS = {
        classes: ['granblue', 'sheet', 'actor', 'character'],
        position: { width: 840, height: 840 }
    };

    static DEFAULT_TAB = 'atributos';

    static PARTS = {
        main: {
            template: 'systems/granblue/templates/actor/character.hbs',
            templates: SHEET_PARTIALS,
            scrollable: ['']
        }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const sys = this.document.system;

        context.rankOptions = this.constructor.buildOptions(
            Object.fromEntries(Object.entries(GRANBLUE.ranks).map(([k, v]) => [k, v.label])),
            sys.rank
        );

        // Inventário agrupado por categoria (categoria desconhecida cai em "outros")
        const categories = Object.keys(GRANBLUE.itemCategories);
        const items = (sys.inventory ?? []).map((item, index) => ({
            ...item,
            index,
            categoryKey: categories.includes(item.category) ? item.category : 'outros'
        }));
        context.inventoryGroups = categories.map((key) => ({
            key,
            label: game.i18n.localize(GRANBLUE.itemCategories[key]),
            items: items.filter((i) => i.categoryKey === key)
        }));
        context.inventoryCount = items.length;
        context.inventoryWeight = GranblueCharacterSheet.#totalWeight(items);
        context.currency = sys.currency;
        context.categoryOptions = categories.map((key) => ({
            value: key,
            label: game.i18n.localize(GRANBLUE.itemCategories[key])
        }));
        context.qualityOptions = Object.entries(GRANBLUE.itemQualities).map(([key, label]) => ({
            value: key,
            label: game.i18n.localize(label)
        }));
        context.tierOptions = GRANBLUE.itemTiers.map((t) => ({ value: String(t), label: String(t) }));

        context.biography = sys.biography;
        context.notes = sys.notes;
        context.progress = sys.progress;

        return context;
    }

    /**
     * Soma o peso do inventário (peso × quantidade). O campo é texto livre:
     * entradas sem número ("leve", "—") são simplesmente ignoradas.
     * Devolve null quando nenhum item tem peso numérico.
     */
    static #totalWeight(items) {
        let total = 0;
        let found = false;
        for (const item of items) {
            const match = String(item.weight ?? '').replace(',', '.').match(/-?\d+(\.\d+)?/);
            if (!match) continue;
            found = true;
            total += Number(match[0]) * (item.quantity ?? 1);
        }
        return found ? Math.round(total * 100) / 100 : null;
    }
}
