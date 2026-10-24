import { GranblueActorSheetBase, ACTION_ROW_PARTIAL } from './actor-sheet-base.mjs';
import { GRANBLUE } from '../config.mjs';
import { qualityRangeLabel } from '../loot.mjs';

/**
 * Ficha de Adversário / NPC.
 */
export class GranblueAdversarySheet extends GranblueActorSheetBase {
    static DEFAULT_OPTIONS = {
        classes: ['granblue', 'sheet', 'actor', 'adversary'],
        position: { width: 960, height: 840 }
    };

    static PARTS = {
        main: {
            template: 'systems/granblue/templates/actor/adversary.hbs',
            templates: [ACTION_ROW_PARTIAL],
            scrollable: ['']
        }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const sys = this.document.system;

        context.difficultyOptions = this.constructor.buildOptions(
            GRANBLUE.adversaryDifficulties, sys.difficulty, { localize: true }
        );
        context.typeOptions = this.constructor.buildOptions(
            GRANBLUE.adversaryTypes, sys.creatureType, { localize: true }
        );

        // Loot: espólio com chance sem número fica marcado (não vai para a rolagem)
        context.loot = (sys.loot ?? []).map((l) => ({
            ...l,
            invalid: String(l.chance ?? '').trim() !== '' && GRANBLUE.parseChance(l.chance) == null
        }));
        context.lootQualityOptions = Object.keys(GRANBLUE.qualityChances).map((key) => ({
            value: key,
            label: qualityRangeLabel(key)
        }));
        context.dropBonus = GRANBLUE.dropBonus[sys.difficulty] ?? 0;
        context.difficultyLabel = game.i18n.localize(GRANBLUE.adversaryDifficulties[sys.difficulty] ?? '');

        context.biography = sys.biography;
        context.description = sys.description;
        context.notes = sys.notes;

        return context;
    }
}
