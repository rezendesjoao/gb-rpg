import { GRANBLUE } from '../config.mjs';

const fields = foundry.data.fields;

/**
 * Constrói o schema dos 9 atributos: cada um tem { value, bonus }.
 * O "total" (value + bonus) é calculado em prepareDerivedData.
 */
export function makeAttributesSchema() {
    const attrs = {};
    for (const key of Object.keys(GRANBLUE.attributes)) {
        attrs[key] = new fields.SchemaField({
            value: new fields.NumberField({ required: true, integer: true, initial: 0, nullable: false }),
            bonus: new fields.NumberField({ required: true, integer: true, initial: 0, nullable: false })
        });
    }
    return new fields.SchemaField(attrs);
}

/**
 * Schema de recursos (vida e mana). Os máximos são derivados.
 *   hitPoints: value (atual), base (da classe), die (dado de vida rolado), temp
 *   mana: value (atual)
 */
export function makeResourcesSchema() {
    return new fields.SchemaField({
        hitPoints: new fields.SchemaField({
            value: new fields.NumberField({ required: true, integer: true, initial: 40, nullable: false }),
            base: new fields.NumberField({ required: true, integer: true, initial: 40, nullable: false, min: 0 }),
            die: new fields.NumberField({ required: true, integer: true, initial: 0, nullable: false, min: 0 }),
            temp: new fields.NumberField({ required: true, integer: true, initial: 0, nullable: false })
        }),
        mana: new fields.SchemaField({
            value: new fields.NumberField({ required: true, integer: true, initial: 0, nullable: false })
        })
    });
}

/** Schema de defesas: bônus de CA (a CA final é derivada). */
export function makeDefensesSchema() {
    return new fields.SchemaField({
        caBonus: new fields.NumberField({ required: true, integer: true, initial: 0, nullable: false })
    });
}

/**
 * Schema de uma ação (ataque/magia/manobra) armazenada como linha na ficha.
 * As fórmulas de acerto/dano aceitam sintaxe de rolagem do Foundry com atalhos
 * de dados do personagem (ex.: "3d6 + @precisao", "2d8 + @forca").
 */
export function makeActionSchema() {
    return new fields.SchemaField({
        name: new fields.StringField({ required: true, initial: 'Nova ação', blank: false }),
        hit: new fields.StringField({ required: true, initial: '', blank: true }),
        damage: new fields.StringField({ required: true, initial: '', blank: true }),
        cost: new fields.StringField({ required: true, initial: '', blank: true }),
        range: new fields.StringField({ required: true, initial: '', blank: true }),
        casting: new fields.StringField({ required: true, initial: '', blank: true }),
        difficulty: new fields.StringField({ required: true, initial: '', blank: true }),
        effect: new fields.StringField({ required: true, initial: '', blank: true }),
        description: new fields.StringField({ required: true, initial: '', blank: true }),
        collapsed: new fields.BooleanField({ required: true, initial: false })
    });
}

/**
 * Cálculo compartilhado dos derivados de atributo/vida/mana/CA.
 * Recebe o objeto system (data model) e preenche os campos derivados.
 */
export function prepareCommonDerived(system) {
    // Totais de atributo (value + bonus). Este total é o modificador somado ao 3d6.
    for (const key of Object.keys(GRANBLUE.attributes)) {
        const attr = system.attributes[key];
        attr.total = (attr.value ?? 0) + (attr.bonus ?? 0);
    }

    // CA = 10 + Reação + bônus de CA
    system.defenses.ca = 10 + system.attributes.reacao.total + (system.defenses.caBonus ?? 0);

    // Vida máxima = base + (Resiliência × 3) + dado de vida + vida temporária
    const hp = system.resources.hitPoints;
    hp.mod = system.attributes.resiliencia.total * 3;
    hp.max = (hp.base ?? 0) + hp.mod + (hp.die ?? 0) + (hp.temp ?? 0);

    // Mana máxima = Sabedoria × 2
    const mana = system.resources.mana;
    mana.max = system.attributes.sabedoria.total * 2;
}
