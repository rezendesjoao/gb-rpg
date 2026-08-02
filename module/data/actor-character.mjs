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

        // Movimento e visão
        schema.movement = new fields.StringField({ required: true, initial: '4', blank: true });
        schema.vision = new fields.StringField({ required: true, initial: '', blank: true });

        // Esferas de magia (pontos investidos em cada uma)
        const spheres = {};
        for (const key of Object.keys(GRANBLUE.spheres)) {
            spheres[key] = new fields.NumberField({ required: true, integer: true, initial: 0, min: 0, nullable: false });
        }
        schema.spheres = new fields.SchemaField(spheres);

        // Progressos de Rank
        schema.progress = new fields.SchemaField({
            current: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0, nullable: false }),
            final: new fields.NumberField({ required: true, integer: true, initial: 8, min: 0, nullable: false })
        });

        // Ações (ataques/magias/manobras) — lista editável na ficha
        schema.actions = new fields.ArrayField(makeActionSchema(), { required: true, initial: [] });

        // Biografia (campos HTML)
        schema.biography = new fields.SchemaField({
            appearance: new fields.HTMLField({ required: true, initial: '', blank: true }),
            demons: new fields.HTMLField({ required: true, initial: '', blank: true }),
            motivations: new fields.HTMLField({ required: true, initial: '', blank: true }),
            worldview: new fields.HTMLField({ required: true, initial: '', blank: true }),
            backstory: new fields.HTMLField({ required: true, initial: '', blank: true })
        });
        schema.notes = new fields.HTMLField({ required: true, initial: '', blank: true });

        return schema;
    }

    /** Cálculo dos valores derivados. */
    prepareDerivedData() {
        prepareCommonDerived(this);

        // Total de pontos de atributo gastos e disponíveis (point-buy).
        // Base: 20 pontos no rank D1 (10 físicos + 5 mágicos + 5 livres); +4 por nível acima de 1.
        const spent = Object.values(this.attributes).reduce((sum, a) => sum + (a.value ?? 0), 0);
        const totalPoints = 20 + Math.max(0, (this.level ?? 1) - 1) * 4;
        this.pointBuy = {
            spent,
            total: totalPoints,
            remaining: totalPoints - spent
        };

        // Pontos de esfera gastos/disponíveis (começa com 5).
        const sphereSpent = Object.entries(this.spheres).reduce((sum, [key, pts]) => {
            // Cada esfera com pelo menos 1 ponto foi "desbloqueada" ao custo dela;
            // pontos extras acima do custo de desbloqueio contam 1:1.
            if (!pts) return sum;
            const custo = GRANBLUE.spheres[key]?.custo ?? 1;
            return sum + custo + Math.max(0, pts - 1);
        }, 0);
        this.spherePoints = {
            spent: sphereSpent,
            total: GRANBLUE.spherePointsStart,
            remaining: GRANBLUE.spherePointsStart - sphereSpent
        };
    }

    /** Dados de rolagem: atalhos @forca, @precisao, ... além de @nivel, @ca, etc. */
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
