import { GRANBLUE } from '../config.mjs';
import {
    makeAttributesSchema,
    makeResourcesSchema,
    makeDefensesSchema,
    makeBiographySchema,
    makeActionSchema,
    makeSpellSchema,
    makeInventorySchema,
    makeSpheresSchema,
    migrateActorSource,
    prepareCommonDerived,
    commonRollData
} from './base-actor.mjs';

const fields = foundry.data.fields;

/**
 * Data model do Personagem (Guerreiro Mágico) jogável.
 */
export class GranblueCharacter extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const schema = {};

        // Identidade / progressão
        schema.rank = new fields.StringField({
            required: true,
            initial: 'd1',
            choices: Object.fromEntries(Object.entries(GRANBLUE.ranks).map(([k, v]) => [k, v.label]))
        });
        schema.level = new fields.NumberField({ required: true, integer: true, initial: 1, min: 0, nullable: false });
        schema.classe = new fields.StringField({ required: true, initial: '', blank: true });
        schema.heranca = new fields.StringField({ required: true, initial: '', blank: true });

        // Atributos, recursos, defesas
        schema.attributes = makeAttributesSchema();
        schema.resources = makeResourcesSchema();
        schema.defenses = makeDefensesSchema();

        // Movimento (com bônus, editável pelo HUD) e visão
        schema.movement = new fields.StringField({ required: true, initial: '4', blank: true });
        schema.movementBonus = new fields.NumberField({ required: true, integer: true, initial: 0, nullable: false });
        schema.vision = new fields.StringField({ required: true, initial: '', blank: true });

        // Esferas de magia (pontos investidos em cada uma)
        schema.spheres = makeSpheresSchema();

        // Progressos de Rank
        schema.progress = new fields.SchemaField({
            current: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0, nullable: false }),
            final: new fields.NumberField({ required: true, integer: true, initial: 8, min: 0, nullable: false })
        });

        // Ações (ataques/manobras) — lista editável na aba Ações
        schema.actions = new fields.ArrayField(makeActionSchema(), { required: true, initial: [] });

        // Magias — lista editável na aba Magia, agrupada por esfera
        schema.spells = new fields.ArrayField(makeSpellSchema(), { required: true, initial: [] });

        // Inventário — lista editável na aba Inventário (sem rolagens)
        schema.inventory = new fields.ArrayField(makeInventorySchema(), { required: true, initial: [] });
        schema.currency = new fields.NumberField({ required: true, integer: true, initial: 0, min: 0, nullable: false });

        // Biografia (campos HTML)
        schema.biography = makeBiographySchema();
        schema.notes = new fields.HTMLField({ required: true, initial: '', blank: true });

        return schema;
    }

    /** Converte dados de versões antigas (RD única, alcance em texto). */
    static migrateData(source) {
        migrateActorSource(source);
        return super.migrateData(source);
    }

    /** Cálculo dos valores derivados (atributos, CA, RD, point-buy, esferas). */
    prepareDerivedData() {
        prepareCommonDerived(this);
    }

    /** Dados de rolagem: atalhos @forca, @precisao, ... além de @nivel, @ca, @rd, etc. */
    getRollData() {
        return commonRollData(this);
    }
}
