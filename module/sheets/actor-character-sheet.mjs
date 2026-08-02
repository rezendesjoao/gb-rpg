import { GranblueActorSheetBase } from './actor-sheet-base.mjs';
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
        position: { width: 840, height: 880 }
    };

    static PARTS = {
        main: { template: 'systems/granblue/templates/actor/character.hbs', scrollable: [''] }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const sys = this.document.system;

        // Escolhas
        context.rankOptions = this.constructor.buildOptions(
            Object.fromEntries(Object.entries(GRANBLUE.ranks).map(([k, v]) => [k, v.label])),
            sys.rank
        );
        context.classBlankSelected = !sys.classe;
        context.classGroups = buildClassGroups(sys.classe);
        context.heritageBlankSelected = !sys.heranca;
        context.heritageOptions = this.constructor.buildOptions(
            Object.fromEntries(Object.entries(GRANBLUE.heritages).map(([k, v]) => [k, v.label])),
            sys.heranca
        );

        // Esferas de magia
        context.spheres = Object.entries(GRANBLUE.spheres).map(([key, cfg]) => ({
            key,
            label: game.i18n.localize(cfg.label),
            custo: cfg.custo,
            value: sys.spheres[key]
        }));

        // Point-buy e pontos de esfera (derivados)
        context.pointBuy = sys.pointBuy;
        context.spherePoints = sys.spherePoints;

        // Biografia / progressos
        context.biography = sys.biography;
        context.notes = sys.notes;
        context.progress = sys.progress;

        return context;
    }
}
