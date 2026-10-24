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
            // max é um campo armazenado/editável — necessário para o Foundry
            // reconhecer resources.hitPoints como uma BARRA (value + max).
            max: new fields.NumberField({ required: true, integer: true, initial: 40, nullable: false, min: 0 }),
            base: new fields.NumberField({ required: true, integer: true, initial: 40, nullable: false, min: 0 }),
            die: new fields.NumberField({ required: true, integer: true, initial: 0, nullable: false, min: 0 }),
            temp: new fields.NumberField({ required: true, integer: true, initial: 0, nullable: false })
        }),
        mana: new fields.SchemaField({
            value: new fields.NumberField({ required: true, integer: true, initial: 0, nullable: false }),
            max: new fields.NumberField({ required: true, integer: true, initial: 0, nullable: false, min: 0 })
        })
    });
}

/** Uma RD (física ou mágica): fixa + bônus + temporária. O total é derivado. */
function makeRdPartSchema() {
    return new fields.SchemaField({
        fixed: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0, nullable: false }),
        bonus: new fields.NumberField({ required: true, integer: true, initial: 0, nullable: false }),
        temp: new fields.NumberField({ required: true, integer: true, initial: 0, nullable: false })
    });
}

/**
 * Schema de defesas: bônus de CA (a CA final é derivada) e Redução de Dano,
 * separada em física e mágica. A RD do tipo do dano é abatida do dano
 * aplicado pelo cartão de chat (ver chat.mjs).
 */
export function makeDefensesSchema() {
    return new fields.SchemaField({
        caBonus: new fields.NumberField({ required: true, integer: true, initial: 0, nullable: false }),
        rd: new fields.SchemaField({
            physical: makeRdPartSchema(),
            magical: makeRdPartSchema()
        })
    });
}

/** Schema da biografia (campos HTML), igual no personagem e no adversário. */
export function makeBiographySchema() {
    return new fields.SchemaField({
        appearance: new fields.HTMLField({ required: true, initial: '', blank: true }),
        demons: new fields.HTMLField({ required: true, initial: '', blank: true }),
        motivations: new fields.HTMLField({ required: true, initial: '', blank: true }),
        worldview: new fields.HTMLField({ required: true, initial: '', blank: true }),
        backstory: new fields.HTMLField({ required: true, initial: '', blank: true })
    });
}

/** Pontos de esfera investidos (um número por esfera), no personagem e no adversário. */
export function makeSpheresSchema() {
    const spheres = {};
    for (const key of Object.keys(GRANBLUE.spheres)) {
        spheres[key] = new fields.NumberField({ required: true, integer: true, initial: 0, min: 0, nullable: false });
    }
    return new fields.SchemaField(spheres);
}

/**
 * Campos de uma ação (ataque/magia/manobra) armazenada como linha na ficha.
 * As fórmulas de acerto/dano aceitam sintaxe de rolagem do Foundry com atalhos
 * de dados do personagem (ex.: "3d6 + @precisao", "2d8 + @forca").
 *
 * `statusEffect` guarda o id de um status effect do Granblue (ver
 * GRANBLUE.statusEffects): é o efeito que o botão de aplicar — na caixa da
 * ação e no cartão de chat — coloca nos tokens selecionados. Vazio = nenhum.
 *
 * `passive` transforma a linha numa habilidade passiva: a ficha mostra só a
 * descrição, num texto maior, com botão de enviar ao chat (sem rolagens).
 * `hasPassive` anexa uma passiva a uma habilidade ativa — o texto dela fica em
 * `passiveText`, também com botão de chat.
 *
 * `actionType` é o tipo de ação gasto no turno (GRANBLUE.actionTypes) — vazio
 * cai na Conjuração (magias) ou na ação normal. `basicAttack` marca o ataque
 * básico, rolado pelo HUD ao custo de uma ação normal.
 *
 * Alcance: `rangeType` simples (só a distância em `rangeMeters`, um marcador
 * narrativo) ou complexo (uma área `areaShape` de `areaWidth` × `areaLength`
 * metros, posicionada no mapa). `range` é o texto livre antigo, mantido para
 * alcances sem número ("Toque").
 */
function actionFields() {
    return {
        name: new fields.StringField({ required: true, initial: 'Nova ação', blank: false }),
        hit: new fields.StringField({ required: true, initial: '', blank: true }),
        damage: new fields.StringField({ required: true, initial: '', blank: true }),
        damageType: new fields.StringField({ required: true, initial: '', blank: true }),
        cost: new fields.StringField({ required: true, initial: '', blank: true }),
        range: new fields.StringField({ required: true, initial: '', blank: true }),
        rangeType: new fields.StringField({ required: true, initial: 'simple', blank: false }),
        rangeMeters: new fields.NumberField({ required: true, initial: null, nullable: true, min: 0 }),
        areaShape: new fields.StringField({ required: true, initial: 'rect', blank: false }),
        areaWidth: new fields.NumberField({ required: true, initial: null, nullable: true, min: 0 }),
        areaLength: new fields.NumberField({ required: true, initial: null, nullable: true, min: 0 }),
        casting: new fields.StringField({ required: true, initial: '', blank: true }),
        actionType: new fields.StringField({ required: true, initial: '', blank: true }),
        basicAttack: new fields.BooleanField({ required: true, initial: false }),
        difficulty: new fields.StringField({ required: true, initial: '', blank: true }),
        statusEffect: new fields.StringField({ required: true, initial: '', blank: true }),
        effect: new fields.StringField({ required: true, initial: '', blank: true }),
        description: new fields.StringField({ required: true, initial: '', blank: true }),
        passive: new fields.BooleanField({ required: true, initial: false }),
        hasPassive: new fields.BooleanField({ required: true, initial: false }),
        passiveText: new fields.StringField({ required: true, initial: '', blank: true })
    };
}

/** Schema de uma ação da lista `system.actions`. */
export function makeActionSchema() {
    return new fields.SchemaField(actionFields());
}

/**
 * Schema de uma magia da lista `system.spells`: os mesmos campos de uma ação
 * (para rolar acerto/dano do mesmo jeito) mais a esfera a que pertence.
 */
export function makeSpellSchema() {
    return new fields.SchemaField({
        ...actionFields(),
        sphere: new fields.StringField({ required: true, initial: 'energia', blank: true }),
        arcano: new fields.StringField({ required: true, initial: '', blank: true }),
        level: new fields.NumberField({ required: true, integer: true, initial: 1, min: 1, max: 9, nullable: false })
    });
}

/**
 * Schema de um item do inventário. Tier, qualidade, peso e valor são textos
 * livres de propósito: aceitam tanto números quanto anotações ("0,5", "~200 rupias").
 * `actionType` é a ação gasta ao usar o item pelo HUD (vazio = não aparece lá).
 */
export function makeInventorySchema() {
    return new fields.SchemaField({
        name: new fields.StringField({ required: true, initial: 'Novo item', blank: true }),
        category: new fields.StringField({ required: true, initial: 'outros', blank: true }),
        quantity: new fields.NumberField({ required: true, integer: true, initial: 1, min: 0, nullable: false }),
        tier: new fields.StringField({ required: true, initial: '', blank: true }),
        quality: new fields.StringField({ required: true, initial: '', blank: true }),
        weight: new fields.StringField({ required: true, initial: '', blank: true }),
        value: new fields.StringField({ required: true, initial: '', blank: true }),
        equipped: new fields.BooleanField({ required: true, initial: false }),
        actionType: new fields.StringField({ required: true, initial: '', blank: true }),
        description: new fields.StringField({ required: true, initial: '', blank: true })
    });
}

/**
 * Schema de um espólio do adversário (aba Loot).
 *   chance    texto livre ("35%"), lido por GRANBLUE.parseChance
 *   quantity  fórmula de rolagem da quantidade ("1d3", "2")
 *   quality   a MELHOR qualidade que o item pode ter: o d100 de qualidade vai
 *             de Normal até ela (ver GRANBLUE.qualityChances)
 */
export function makeLootSchema() {
    return new fields.SchemaField({
        chance: new fields.StringField({ required: true, initial: '', blank: true }),
        item: new fields.StringField({ required: true, initial: '', blank: true }),
        quantity: new fields.StringField({ required: true, initial: '1', blank: true }),
        quality: new fields.StringField({ required: true, initial: 'normal', blank: true })
    });
}

/* -------------------------------------------- */
/*  Migração dos dados antigos                  */
/* -------------------------------------------- */

/** Primeiro número de um texto ("4", "4m", "1,5 metros") ou null. */
export function parseMeters(value) {
    const match = String(value ?? '').replace(',', '.').match(/\d+(\.\d+)?/);
    return match ? Number(match[0]) : null;
}

/**
 * Completa uma linha de ação/magia antiga: o alcance em texto ("4") vira a
 * distância em metros do alcance simples. Só age quando o campo novo não
 * existe — um alcance apagado de propósito continua apagado.
 */
export function migrateActionRow(row) {
    if (!row || typeof row !== 'object') return;
    if (!('rangeMeters' in row) && ('range' in row)) row.rangeMeters = parseMeters(row.range);
}

/**
 * Migração dos dados de um ator (personagem ou adversário), aplicada pelo
 * Foundry ao carregar cada ficha. A RD era um número único: vira a RD fixa
 * física E mágica, para o dano continuar reduzido do mesmo jeito.
 */
export function migrateActorSource(source) {
    const rd = source.defenses?.rd;
    if (typeof rd === 'number') {
        source.defenses.rd = {
            physical: { fixed: rd, bonus: 0, temp: 0 },
            magical: { fixed: rd, bonus: 0, temp: 0 }
        };
    }
    for (const list of ['actions', 'spells']) {
        if (Array.isArray(source[list])) source[list].forEach(migrateActionRow);
    }
    return source;
}

/* -------------------------------------------- */
/*  Derivados                                   */
/* -------------------------------------------- */

/**
 * Cálculo compartilhado dos derivados de atributo/vida/mana/CA/RD.
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

    // RD física e mágica = fixa + bônus + temporária (nunca negativa)
    for (const part of Object.values(system.defenses.rd)) {
        part.total = Math.max(0, (part.fixed ?? 0) + (part.bonus ?? 0) + (part.temp ?? 0));
    }

    // Movimento: o campo é texto livre ("4"); o bônus soma quando há número.
    const baseMove = parseMeters(system.movement);
    system.movementTotal = baseMove == null ? null : baseMove + (system.movementBonus ?? 0);

    // Vida/Mana máximas são campos ARMAZENADOS/editáveis (para funcionarem como
    // barra de token). Aqui só calculamos o valor SUGERIDO pela fórmula, usado
    // pelo botão "Recalcular" e exibido como dica — sem sobrescrever o max.
    const hp = system.resources.hitPoints;
    hp.mod = system.attributes.resiliencia.total * 3;
    hp.maxFormula = (hp.base ?? 0) + hp.mod + (hp.die ?? 0) + (hp.temp ?? 0);

    const mana = system.resources.mana;
    mana.maxFormula = system.attributes.sabedoria.total * 2;

    // Total de pontos de atributo gastos e disponíveis (point-buy).
    // Base: 20 pontos no nível 1 (10 físicos + 5 mágicos + 5 livres); +4 por nível acima de 1.
    const spent = Object.values(system.attributes).reduce((sum, a) => sum + (a.value ?? 0), 0);
    const totalPoints = 20 + Math.max(0, (system.level ?? 1) - 1) * 4;
    system.pointBuy = { spent, total: totalPoints, remaining: totalPoints - spent };

    // Pontos de esfera gastos/disponíveis (começa com 5). Cada esfera com pelo
    // menos 1 ponto foi "desbloqueada" ao custo dela; pontos extras contam 1:1.
    if (system.spheres) {
        const sphereSpent = Object.entries(system.spheres).reduce((sum, [key, pts]) => {
            if (!pts) return sum;
            const custo = GRANBLUE.spheres[key]?.custo ?? 1;
            return sum + custo + Math.max(0, pts - 1);
        }, 0);
        system.spherePoints = {
            spent: sphereSpent,
            total: GRANBLUE.spherePointsStart,
            remaining: GRANBLUE.spherePointsStart - sphereSpent
        };
    }
}

/** Atalhos de rolagem (@forca, @precisao, ..., @nivel, @ca, @rd) comuns aos atores. */
export function commonRollData(system) {
    const data = {};
    for (const [key, attr] of Object.entries(system.attributes)) {
        data[key] = attr.total;
    }
    data.attributes = system.attributes;
    data.nivel = system.level;
    data.ca = system.defenses.ca;
    data.rd = system.defenses.rd.physical.total;
    data.rdFisica = system.defenses.rd.physical.total;
    data.rdMagica = system.defenses.rd.magical.total;
    data.vida = system.resources.hitPoints.value;
    data.vidaMax = system.resources.hitPoints.max;
    data.mana = system.resources.mana.value;
    data.manaMax = system.resources.mana.max;
    return data;
}
