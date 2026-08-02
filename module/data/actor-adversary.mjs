import { GRANBLUE } from '../config.mjs';
import {
    makeAttributesSchema,
    makeResourcesSchema,
    makeDefensesSchema,
    makeActionSchema,
    prepareCommonDerived
} from './base-actor.mjs';

const fields = foundry.data.fields;

/**
 * Data model de Adversário / NPC (monstros e personagens do mestre).
 * Usa os mesmos 9 atributos e fórmulas do personagem, com campos extras
 * de mestre (dificuldade, tipagem, loot).
 */
export class GranblueAdversary extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const schema = {};

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
        schema.vision = new fields.StringField({ required: true, initial: '', blank: true });

        // Ataques / habilidades
        schema.actions = new fields.ArrayField(makeActionSchema(), { required: true, initial: [] });

        // Loot: lista de { chance, item }
        schema.loot = new fields.ArrayField(new fields.SchemaField({
            chance: new fields.StringField({ required: true, initial: '', blank: true }),
            item: new fields.StringField({ required: true, initial: '', blank: true })
        }), { required: true, initial: [] });

        schema.description = new fields.HTMLField({ required: true, initial: '', blank: true });
        schema.notes = new fields.HTMLField({ required: true, initial: '', blank: true });

        return schema;
    }

    prepareDerivedData() {
        prepareCommonDerived(this);
    }

    getRollData() {
        const data = {};
        for (const [key, attr] of Object.entries(this.attributes)) {
            data[key] = attr.total;
        }
        data.attributes = this.attributes;
        data.nivel = this.level;
        data.ca = this.defenses.ca;
        data.vida = this.resources.hitPoints.value;
        data.vidaMax = this.resources.hitPoints.max;
        data.mana = this.resources.mana.value;
        data.manaMax = this.resources.mana.max;
        return data;
    }
}
