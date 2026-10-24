import { GRANBLUE } from '../config.mjs';
import {
    makeAttributesSchema,
    makeResourcesSchema,
    makeDefensesSchema,
    makeBiographySchema,
    makeActionSchema,
    makeSpellSchema,
    makeSpheresSchema,
    makeLootSchema,
    migrateActorSource,
    prepareCommonDerived,
    commonRollData
} from './base-actor.mjs';

const fields = foundry.data.fields;

/** Quantas caixas de vantagem (e de desvantagem) a ficha mostra. */
export const ADVANTAGE_SLOTS = 3;

/** Lista de textos com exatamente ADVANTAGE_SLOTS posições. */
function advantageList() {
    return new fields.ArrayField(new fields.StringField({ required: true, initial: '', blank: true }), {
        required: true,
        initial: () => Array(ADVANTAGE_SLOTS).fill('')
    });
}

/**
 * Data model de Adversário / NPC (monstros e personagens do mestre).
 * Usa os mesmos 9 atributos e fórmulas do personagem, com campos extras
 * de mestre (dificuldade, tipagem, loot). `kind` diferencia o monstro do
 * personagem antagonista, que também tem classe e herança.
 */
export class GranblueAdversary extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const schema = {};

        schema.kind = new fields.StringField({
            required: true,
            initial: 'monstro',
            choices: Object.keys(GRANBLUE.adversaryKinds)
        });
        schema.rank = new fields.StringField({ required: true, initial: '', blank: true });
        schema.level = new fields.NumberField({ required: true, integer: true, initial: 1, min: 0, nullable: false });

        schema.difficulty = new fields.StringField({
            required: true,
            initial: 'normal',
            choices: Object.keys(GRANBLUE.adversaryDifficulties)
        });
        schema.creatureType = new fields.StringField({
            required: true,
            initial: 'comum',
            choices: Object.keys(GRANBLUE.adversaryTypes)
        });

        schema.attributes = makeAttributesSchema();
        schema.resources = makeResourcesSchema();
        schema.defenses = makeDefensesSchema();

        schema.movement = new fields.StringField({ required: true, initial: '4', blank: true });
        schema.movementBonus = new fields.NumberField({ required: true, integer: true, initial: 0, nullable: false });
        schema.vision = new fields.StringField({ required: true, initial: '', blank: true });

        // Vantagens / desvantagens da criatura: três caixas de cada, com botão de
        // chat. A desvantagem é o que os jogadores descobrem ao analisar o poder de combate.
        schema.advantages = advantageList();
        schema.disadvantages = advantageList();

        // Ataques / habilidades (ativas e passivas)
        schema.actions = new fields.ArrayField(makeActionSchema(), { required: true, initial: [] });

        // Magias por esfera — a mesma aba Magia do personagem
        schema.spheres = makeSpheresSchema();
        schema.spells = new fields.ArrayField(makeSpellSchema(), { required: true, initial: [] });

        // Loot: lista de { chance, item, quantity, quality }
        schema.loot = new fields.ArrayField(makeLootSchema(), { required: true, initial: [] });

        // Biografia (os mesmos campos do personagem) + descrição e notas do mestre
        schema.biography = makeBiographySchema();
        schema.description = new fields.HTMLField({ required: true, initial: '', blank: true });
        schema.notes = new fields.HTMLField({ required: true, initial: '', blank: true });

        return schema;
    }

    /**
     * Converte dados de versões antigas: RD única, alcance em texto e a
     * vantagem/desvantagem de texto único (vira a primeira caixa).
     */
    static migrateData(source) {
        migrateActorSource(source);
        for (const [legacy, list] of [['advantage', 'advantages'], ['disadvantage', 'disadvantages']]) {
            if (typeof source[legacy] === 'string' && !Array.isArray(source[list])) {
                source[list] = [source[legacy], ...Array(ADVANTAGE_SLOTS - 1).fill('')];
            }
        }
        return super.migrateData(source);
    }

    /** Personagem antagonista (com classe e herança) em vez de monstro? */
    get isAntagonist() {
        return this.kind === 'antagonista';
    }

    prepareDerivedData() {
        // Sempre três caixas, mesmo que a lista gravada tenha menos.
        for (const list of ['advantages', 'disadvantages']) {
            while (this[list].length < ADVANTAGE_SLOTS) this[list].push('');
        }
        prepareCommonDerived(this);
    }

    getRollData() {
        return commonRollData(this);
    }
}
