import { GranblueActorSheetBase } from './actor-sheet-base.mjs';
import { GranblueItem } from '../documents/item.mjs';
import { GRANBLUE } from '../config.mjs';

/** Monta os grupos de classe (optgroups) marcando a classe atual. */
function buildClassGroups(current) {
    const groups = {};
    for (const [key, cfg] of Object.entries(GRANBLUE.classes)) {
        const g = cfg.grupo;
        groups[g] ??= { key: g, label: game.i18n.localize(GRANBLUE.classGroups[g]), options: [] };
        groups[g].options.push({ value: key, label: cfg.label, selected: key === current });
    }
    return Object.values(groups);
}

/**
 * Ficha do Personagem (Guerreiro Mágico).
 */
export class GranblueCharacterSheet extends GranblueActorSheetBase {
    static DEFAULT_OPTIONS = {
        classes: ['granblue', 'sheet', 'actor', 'character'],
        position: { width: 840, height: 820 },
        actions: {
            openEmbedded: GranblueCharacterSheet.#onOpenEmbedded,
            removeEmbedded: GranblueCharacterSheet.#onRemoveEmbedded
        }
    };

    static DEFAULT_TAB = 'atributos';

    static PARTS = {
        main: { template: 'systems/granblue/templates/actor/character.hbs', scrollable: [''] }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const sys = this.document.system;
        const classOrigin = context.classItem?.system.origin ?? '';
        const heritageOrigin = context.heritageItem?.system.origin ?? '';

        // Seletores de classe / herança (criam itens a partir dos presets)
        context.classBlankSelected = !classOrigin;
        context.classGroups = buildClassGroups(classOrigin);
        context.heritageBlankSelected = !heritageOrigin;
        context.heritageOptions = Object.entries(GRANBLUE.heritages).map(([key, cfg]) => ({
            value: key, label: cfg.label, selected: key === heritageOrigin
        }));

        context.rankOptions = this.constructor.buildOptions(
            Object.fromEntries(Object.entries(GRANBLUE.ranks).map(([k, v]) => [k, v.label])),
            sys.rank
        );

        // Habilidades da classe / traços da herança para exibição
        context.classAbilities = context.classItem?.system.abilities ?? [];
        context.heritageProgress = context.heritageItem?.system.progress ?? [];

        // Esferas de magia
        context.spheres = Object.entries(GRANBLUE.spheres).map(([key, cfg]) => ({
            key,
            label: game.i18n.localize(cfg.label),
            custo: cfg.custo,
            value: sys.spheres[key]
        }));

        context.pointBuy = sys.pointBuy;
        context.spherePoints = sys.spherePoints;
        context.biography = sys.biography;
        context.notes = sys.notes;
        context.progress = sys.progress;

        return context;
    }

    /* ---------------------------------- */
    /*  Render: liga os seletores          */
    /* ---------------------------------- */

    _onRender(context, options) {
        super._onRender(context, options);
        const root = this.element;
        if (!root) return;
        root.querySelectorAll('[data-gb-chooser]').forEach((sel) => {
            sel.addEventListener('change', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                const kind = sel.dataset.gbChooser;
                if (kind === 'class') this.#setClass(sel.value);
                else if (kind === 'heritage') this.#setHeritage(sel.value);
            });
        });
    }

    /** Substitui o item de Classe do ator pelo preset escolhido. */
    async #setClass(origin) {
        const existing = this.document.items.filter((i) => i.type === 'class').map((i) => i.id);
        if (existing.length) await this.document.deleteEmbeddedDocuments('Item', existing);
        if (origin) {
            const data = GranblueItem.presetClassData(origin);
            if (data) await this.document.createEmbeddedDocuments('Item', [data]);
        }
        await this.document.recalcMax();
    }

    /** Substitui o item de Herança do ator pelo preset escolhido. */
    async #setHeritage(origin) {
        const existing = this.document.items.filter((i) => i.type === 'heritage').map((i) => i.id);
        if (existing.length) await this.document.deleteEmbeddedDocuments('Item', existing);
        if (origin) {
            const data = GranblueItem.presetHeritageData(origin);
            if (data) await this.document.createEmbeddedDocuments('Item', [data]);
        }
    }

    /* ---------------------------------- */
    /*  Ações                              */
    /* ---------------------------------- */

    static async #onOpenEmbedded(event, target) {
        const id = target.dataset.itemId;
        this.document.items.get(id)?.sheet?.render(true);
    }

    static async #onRemoveEmbedded(event, target) {
        const id = target.dataset.itemId;
        if (id) await this.document.deleteEmbeddedDocuments('Item', [id]);
    }
}
