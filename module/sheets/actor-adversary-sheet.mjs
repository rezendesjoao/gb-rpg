import { GranblueActorSheetBase, SHEET_PARTIALS } from './actor-sheet-base.mjs';
import { GRANBLUE } from '../config.mjs';
import { qualityRangeLabel } from '../loot.mjs';

/**
 * Ficha de Adversário / NPC. Os ícones de modelo no cabeçalho diferenciam o
 * monstro do personagem antagonista, que ganha classe, herança e a aba
 * Classe & Herança.
 */
export class GranblueAdversarySheet extends GranblueActorSheetBase {
    static DEFAULT_OPTIONS = {
        classes: ['granblue', 'sheet', 'actor', 'adversary'],
        position: { width: 920, height: 860 }
    };

    static PARTS = {
        main: {
            template: 'systems/granblue/templates/actor/adversary.hbs',
            templates: SHEET_PARTIALS,
            scrollable: ['.gb-body', '.gb-side']
        }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const sys = this.document.system;

        context.isAntagonist = sys.kind === 'antagonista';
        // Modelo da ficha: dois ícones no cabeçalho, o escolhido aceso
        context.kindOptions = this.constructor.buildOptions(GRANBLUE.adversaryKinds, sys.kind, { localize: true })
            .map((o) => ({ ...o, icon: GRANBLUE.adversaryKindIcons[o.value] }));
        context.difficultyOptions = this.constructor.buildOptions(
            GRANBLUE.adversaryDifficulties, sys.difficulty, { localize: true }
        );
        context.typeOptions = this.constructor.buildOptions(
            GRANBLUE.adversaryTypes, sys.creatureType, { localize: true }
        );
        context.typeLabel = game.i18n.localize(GRANBLUE.adversaryTypes[sys.creatureType] ?? '');
        context.typeIcon = GRANBLUE.adversaryTypeIcons[sys.creatureType] ?? 'fa-skull';

        // Três caixas de vantagem e de desvantagem, cada uma com botão de chat
        const boxes = (list) => sys[list].map((text, index) => ({ index, text, list }));
        context.advantages = boxes('advantages');
        context.disadvantages = boxes('disadvantages');

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
