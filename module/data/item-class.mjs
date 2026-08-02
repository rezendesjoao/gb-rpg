import { GRANBLUE } from '../config.mjs';

const fields = foundry.data.fields;

/**
 * Data model do item Classe (Estilo de Guerreiro).
 * A Energia Vital base é aplicada por um Active Effect (OVERRIDE) sincronizado
 * pelo documento do item. Os dados de vida/dano são usados nas rolagens.
 */
export class GranblueClass extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const schema = {};

        schema.origin = new fields.StringField({ required: true, initial: '', blank: true });
        schema.grupo = new fields.StringField({
            required: true,
            initial: 'conjurador',
            choices: Object.keys(GRANBLUE.classGroups)
        });

        schema.vidaBase = new fields.NumberField({ required: true, integer: true, initial: 40, min: 0, nullable: false });
        schema.vidaDado = new fields.StringField({ required: true, initial: '2d6', blank: true });
        schema.danoDado = new fields.StringField({ required: true, initial: '2d6', blank: true });

        schema.manaCondition = new fields.StringField({ required: true, initial: '', blank: true });
        schema.weapons = new fields.StringField({ required: true, initial: '', blank: true });

        // Habilidades da classe
        schema.abilities = new fields.ArrayField(new fields.SchemaField({
            name: new fields.StringField({ required: true, initial: 'Habilidade', blank: false }),
            type: new fields.StringField({ required: true, initial: 'passiva', choices: ['passiva', 'ativa'] }),
            description: new fields.StringField({ required: true, initial: '', blank: true })
        }), { required: true, initial: [] });

        schema.description = new fields.HTMLField({ required: true, initial: '', blank: true });

        return schema;
    }
}
