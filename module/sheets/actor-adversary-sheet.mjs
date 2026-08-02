import { GranblueActorSheetBase } from './actor-sheet-base.mjs';
import { GRANBLUE } from '../config.mjs';

/**
 * Ficha de Adversário / NPC.
 */
export class GranblueAdversarySheet extends GranblueActorSheetBase {
    static DEFAULT_OPTIONS = {
        classes: ['granblue', 'sheet', 'actor', 'adversary'],
        position: { width: 820, height: 820 }
    };

    static PARTS = {
        main: { template: 'systems/granblue/templates/actor/adversary.hbs', scrollable: [''] }
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

        context.loot = sys.loot ?? [];
        context.description = sys.description;
        context.notes = sys.notes;

        return context;
    }
}
