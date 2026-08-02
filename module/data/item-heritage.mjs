import { GRANBLUE } from '../config.mjs';

const fields = foundry.data.fields;

/**
 * Data model do item Herança (Raça).
 * Os bônus de atributo são aplicados automaticamente por um Active Effect
 * sincronizado pelo documento do item (ver documents/item.mjs).
 */
export class GranblueHeritage extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const schema = {};

        schema.origin = new fields.StringField({ required: true, initial: '', blank: true });

        // Bônus de atributo (o que vira Active Effect)
        const bonuses = {};
        for (const key of Object.keys(GRANBLUE.attributes)) {
            bonuses[key] = new fields.NumberField({ required: true, integer: true, initial: 0, nullable: false });
        }
        schema.bonuses = new fields.SchemaField(bonuses);

        schema.sharedTrait = new fields.HTMLField({ required: true, initial: '', blank: true });
        schema.weakness = new fields.HTMLField({ required: true, initial: '', blank: true });

        // Progressos (habilidades desbloqueadas por limites de atributo)
        schema.progress = new fields.ArrayField(new fields.SchemaField({
            name: new fields.StringField({ required: true, initial: 'Progresso', blank: false }),
            requirement: new fields.StringField({ required: true, initial: '', blank: true }),
            description: new fields.StringField({ required: true, initial: '', blank: true })
        }), { required: true, initial: [] });

        schema.description = new fields.HTMLField({ required: true, initial: '', blank: true });

        return schema;
    }
}
