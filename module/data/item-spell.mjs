import { parseMeters } from './base-actor.mjs';

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
            // Alcance simples (metros) ou complexo (área a × b) — ver actionFields()
            rangeType: new fields.StringField({ required: true, initial: 'simple', blank: false }),
            rangeMeters: new fields.NumberField({ required: true, initial: null, nullable: true, min: 0 }),
            areaShape: new fields.StringField({ required: true, initial: 'rect', blank: false }),
            areaWidth: new fields.NumberField({ required: true, initial: null, nullable: true, min: 0 }),
            areaLength: new fields.NumberField({ required: true, initial: null, nullable: true, min: 0 }),
            casting: new fields.StringField({ required: true, initial: '', blank: true }),
            // Ação gasta no HUD (vazio = a Conjuração) e tipo do dano (vazio = mágico)
            actionType: new fields.StringField({ required: true, initial: '', blank: true }),
            damageType: new fields.StringField({ required: true, initial: '', blank: true }),
            difficulty: new fields.StringField({ required: true, initial: '', blank: true }),
            hit: new fields.StringField({ required: true, initial: '3d6 + @disciplina', blank: true }),
            damage: new fields.StringField({ required: true, initial: '', blank: true }),
            // Id de um status effect do Granblue aplicado pela magia (vazio = nenhum).
            statusEffect: new fields.StringField({ required: true, initial: '', blank: true }),
            effect: new fields.HTMLField({ required: true, initial: '', blank: true }),
            description: new fields.HTMLField({ required: true, initial: '', blank: true }),
            // Magia passiva (só a descrição, com botão de chat) ou passiva anexada
            // a uma magia ativa — útil para itens mágicos. Ver actionFields().
            passive: new fields.BooleanField({ required: true, initial: false }),
            hasPassive: new fields.BooleanField({ required: true, initial: false }),
            passiveText: new fields.StringField({ required: true, initial: '', blank: true })
        };
    }

    /** O alcance em texto das versões antigas ("4") vira a distância em metros. */
    static migrateData(source) {
        if (!('rangeMeters' in source) && ('range' in source)) source.rangeMeters = parseMeters(source.range);
        return super.migrateData(source);
    }

    /** Converte esta magia em um objeto de ação para a lista da ficha. */
    toActionData() {
        return {
            name: this.parent?.name ?? 'Magia',
            hit: this.hit ?? '',
            damage: this.damage ?? '',
            cost: String(this.cost ?? ''),
            range: String(this.range ?? ''),
            rangeType: this.rangeType || 'simple',
            rangeMeters: this.rangeMeters ?? null,
            areaShape: this.areaShape || 'rect',
            areaWidth: this.areaWidth ?? null,
            areaLength: this.areaLength ?? null,
            casting: String(this.casting ?? ''),
            actionType: String(this.actionType ?? ''),
            damageType: String(this.damageType ?? ''),
            difficulty: String(this.difficulty ?? ''),
            statusEffect: String(this.statusEffect ?? ''),
            effect: this.stripHtml(this.effect),
            description: this.stripHtml(this.description, { keepLines: true }),
            passive: !!this.passive,
            hasPassive: !!this.hasPassive,
            passiveText: String(this.passiveText ?? '').trim()
        };
    }

    /**
     * Remove tags HTML simples para caber nos campos de texto da ação.
     * O efeito vai para um campo de uma linha; com `keepLines` as quebras de
     * parágrafo viram quebras de linha (a descrição é um campo de várias linhas).
     */
    stripHtml(html, { keepLines = false } = {}) {
        if (!html) return '';
        // DOMParser monta um documento inerte (sem scripts nem carregamento) e
        // ainda decodifica entidades como &quot; e &nbsp;.
        const marked = String(html).replace(/<br\s*\/?>|<\/(p|div|li|h[1-6])>/gi, '$&\n');
        const text = new DOMParser().parseFromString(marked, 'text/html').body.textContent ?? '';
        if (!keepLines) return text.replace(/\s+/g, ' ').trim();
        return text.replace(/[ \t ]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    }
}
