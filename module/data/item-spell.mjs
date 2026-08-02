const fields = foundry.data.fields;

/**
 * Data model do item Magia (arcano de uma esfera).
 * Ao ser arrastado para a ficha, vira uma "Ação" (não fica embutido).
 * hit/damage são fórmulas no padrão das ações (ex.: "3d6 + @disciplina",
 * "2d12 + @potencia * 2").
 */
export class GranblueSpell extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            sphere: new fields.StringField({ required: true, initial: 'energia', blank: true }),
            arcano: new fields.StringField({ required: true, initial: '', blank: true }),
            level: new fields.NumberField({ required: true, integer: true, initial: 1, min: 1, max: 9, nullable: false }),
            cost: new fields.StringField({ required: true, initial: '', blank: true }),
            range: new fields.StringField({ required: true, initial: '', blank: true }),
            casting: new fields.StringField({ required: true, initial: '', blank: true }),
            difficulty: new fields.StringField({ required: true, initial: '', blank: true }),
            hit: new fields.StringField({ required: true, initial: '3d6 + @disciplina', blank: true }),
            damage: new fields.StringField({ required: true, initial: '', blank: true }),
            effect: new fields.HTMLField({ required: true, initial: '', blank: true }),
            description: new fields.HTMLField({ required: true, initial: '', blank: true })
        };
    }

    /** Converte esta magia em um objeto de ação para a lista da ficha. */
    toActionData() {
        return {
            name: this.parent?.name ?? 'Magia',
            hit: this.hit ?? '',
            damage: this.damage ?? '',
            cost: String(this.cost ?? ''),
            range: String(this.range ?? ''),
            casting: String(this.casting ?? ''),
            difficulty: String(this.difficulty ?? ''),
            effect: this.stripHtml(this.effect),
            description: this.stripHtml(this.description)
        };
    }

    /** Remove tags HTML simples para caber nos campos de texto da ação. */
    stripHtml(html) {
        if (!html) return '';
        return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }
}
