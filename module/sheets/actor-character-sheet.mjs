import { GranblueActorSheetBase, SHEET_PARTIALS } from './actor-sheet-base.mjs';
import { GRANBLUE } from '../config.mjs';

/**
 * Ficha do Personagem (Guerreiro Mágico).
 * Classe/herança, esferas e RD vêm da ficha base (compartilhados com o
 * adversário antagonista); aqui ficam rank, progresso e inventário.
 */
export class GranblueCharacterSheet extends GranblueActorSheetBase {
    static DEFAULT_OPTIONS = {
        classes: ['granblue', 'sheet', 'actor', 'character'],
        position: { width: 920, height: 860 }
    };

    static DEFAULT_TAB = 'atributos';

    static PARTS = {
        main: {
            template: 'systems/granblue/templates/actor/character.hbs',
            templates: SHEET_PARTIALS,
            scrollable: ['.gb-body', '.gb-side']
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
        const items = (sys.inventory ?? []).map((item, index) => GranblueCharacterSheet.#decorateItem(item, index, categories));
        context.inventoryGroups = categories.map((key) => ({
            key,
            label: game.i18n.localize(GRANBLUE.itemCategories[key]),
            icon: GRANBLUE.itemCategoryIcons[key],
            items: items.filter((i) => i.categoryKey === key)
        }));
        context.inventoryCount = items.length;
        context.equippedCount = items.filter((i) => i.equipped).length;
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
        context.progressPct = sys.progress.final > 0
            ? Math.max(0, Math.min(100, Math.round((sys.progress.current / sys.progress.final) * 100)))
            : 0;

        return context;
    }

    /**
     * Item do inventário pronto para a ficha: a categoria reconhecida, a
     * qualidade (que dá a cor do nome) e o resumo em fichas — qualidade,
     * tier, peso, valor e a ação gasta pelo HUD.
     */
    static #decorateItem(item, index, categories) {
        const qualityKey = item.quality in GRANBLUE.itemQualities ? item.quality : '';
        const chips = [];
        if (qualityKey && qualityKey !== 'normal') {
            chips.push({ icon: 'fa-solid fa-star', label: 'Qualidade', value: game.i18n.localize(GRANBLUE.itemQualities[qualityKey]), cls: 'is-quality' });
        }
        if (item.tier) chips.push({ icon: 'fa-solid fa-layer-group', label: 'Tier', value: `T${item.tier}` });
        if (String(item.weight ?? '').trim()) chips.push({ icon: 'fa-solid fa-weight-hanging', label: 'Peso', value: String(item.weight).trim() });
        if (String(item.value ?? '').trim()) chips.push({ icon: 'fa-solid fa-gem', label: 'Valor', value: String(item.value).trim() });
        const type = GRANBLUE.actionTypes[item.actionType];
        if (type) chips.push({ icon: type.icon, label: 'Ação gasta no HUD', value: game.i18n.localize(type.label) });
        return {
            ...item,
            index,
            categoryKey: categories.includes(item.category) ? item.category : 'outros',
            qualityKey: qualityKey || 'normal',
            chips
        };
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
