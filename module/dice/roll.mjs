import { GRANBLUE } from '../config.mjs';

const CARD_TEMPLATE = 'systems/granblue/templates/chat/roll-card.hbs';

/** Extrai os dados de exibição de um Roll: cada dado, o modificador e o total. */
function describeRoll(roll) {
    const dice = [];
    let diceSum = 0;
    for (const term of roll.dice) {
        const values = term.results.filter((r) => r.active !== false).map((r) => r.result);
        diceSum += values.reduce((a, b) => a + b, 0);
        dice.push({ faces: term.faces, values });
    }
    return { dice, modifier: roll.total - diceSum, total: roll.total };
}

/** Cria uma seção do cartão a partir de um Roll. */
function makeSection(subtitle, roll, kind) {
    const d = describeRoll(roll);
    return { subtitle, kind, dice: d.dice, modifier: d.modifier, total: d.total };
}

/** Acrescenta dados extras e/ou um bônus situacional a uma fórmula base. */
function applyMods(base, mods = {}) {
    let f = base;
    const dice = String(mods.dice ?? '').trim();
    if (dice) f += ` + ${dice}`;
    const bonus = Number(mods.bonus) || 0;
    if (bonus > 0) f += ` + ${bonus}`;
    else if (bonus < 0) f += ` - ${Math.abs(bonus)}`;
    return f;
}

/**
 * Rola um teste de atributo: 3d6 + (atributo + bônus).
 */
export async function rollAttributeTest(actor, attrKey, options = {}) {
    const attr = actor.system.attributes?.[attrKey];
    if (!attr) return null;
    const mod = attr.total ?? ((attr.value ?? 0) + (attr.bonus ?? 0));
    const roll = new Roll(applyMods('3d6 + @mod', options), { mod });
    await roll.evaluate();

    await postRollCard(actor, {
        title: game.i18n.localize(GRANBLUE.attributes[attrKey]?.label ?? attrKey),
        sections: [makeSection(
            options.mana
                ? game.i18n.localize('GRANBLUE.Chat.manaTest')
                : game.i18n.localize('GRANBLUE.Chat.attributeTest'),
            roll,
            'attribute'
        )],
        rolls: [roll]
    });
    return roll;
}

/** Avalia a fórmula de uma parte da ação (com bônus/dados extras); devolve o Roll ou null. */
async function evalActionRoll(actor, action, part, mods = {}) {
    const base = (action?.[part] ?? '').trim();
    if (!base) return null;
    const formula = applyMods(base, mods);
    try {
        const roll = new Roll(formula, actor.getRollData());
        await roll.evaluate();
        return roll;
    } catch (err) {
        ui.notifications?.error(`${game.i18n.localize('GRANBLUE.Chat.badFormula')}: ${formula}`);
        console.error('Granblue | Erro ao avaliar fórmula:', formula, err);
        return null;
    }
}

/** Rola uma parte (acerto ou dano) de uma ação em um cartão. */
export async function rollActionPart(actor, action, part, mods = {}) {
    const hasFormula = !!(action?.[part] ?? '').trim();
    const roll = await evalActionRoll(actor, action, part, mods);
    if (!roll) {
        if (!hasFormula) ui.notifications?.warn(game.i18n.localize('GRANBLUE.Chat.noFormula'));
        return null;
    }
    const isHit = part === 'hit';
    await postRollCard(actor, {
        title: action.name,
        sections: [makeSection(
            game.i18n.localize(isHit ? 'GRANBLUE.Chat.hitRoll' : 'GRANBLUE.Chat.damageRoll'),
            roll,
            part
        )],
        meta: buildActionMeta(action),
        rolls: [roll]
    });
    return roll;
}

/** Rola a ação inteira (acerto + dano, quando existirem) em um único cartão. */
export async function rollActionFull(actor, action, mods = {}) {
    const sections = [];
    const rolls = [];

    const hitRoll = await evalActionRoll(actor, action, 'hit', mods.hit);
    if (hitRoll) {
        rolls.push(hitRoll);
        sections.push(makeSection(game.i18n.localize('GRANBLUE.Chat.hitRoll'), hitRoll, 'hit'));
    }

    const dmgRoll = await evalActionRoll(actor, action, 'damage', mods.damage);
    if (dmgRoll) {
        rolls.push(dmgRoll);
        sections.push(makeSection(game.i18n.localize('GRANBLUE.Chat.damageRoll'), dmgRoll, 'damage'));
    }

    if (!sections.length) {
        ui.notifications?.warn(game.i18n.localize('GRANBLUE.Chat.noFormula'));
        return null;
    }

    await postRollCard(actor, {
        title: action.name,
        sections,
        meta: buildActionMeta(action),
        rolls
    });
    return rolls;
}

/** Rola o dado de vida de uma classe e devolve o total. */
export async function rollHitDie(actor, dieFormula) {
    const roll = new Roll(dieFormula || '2d6');
    await roll.evaluate();
    await postRollCard(actor, {
        title: game.i18n.localize('GRANBLUE.HitDie'),
        sections: [makeSection(dieFormula, roll, 'die')],
        rolls: [roll]
    });
    return roll.total;
}

/** Linhas de metadados (custo/alcance/etc.) exibidas no cartão de uma ação. */
function buildActionMeta(action) {
    const meta = [];
    if (action.cost) meta.push({ label: game.i18n.localize('GRANBLUE.Action.cost'), value: action.cost });
    if (action.range) meta.push({ label: game.i18n.localize('GRANBLUE.Action.range'), value: action.range });
    if (action.casting) meta.push({ label: game.i18n.localize('GRANBLUE.Action.casting'), value: action.casting });
    if (action.difficulty) meta.push({ label: game.i18n.localize('GRANBLUE.Action.difficulty'), value: action.difficulty });
    if (action.effect) meta.push({ label: game.i18n.localize('GRANBLUE.Action.effect'), value: action.effect });
    return meta;
}

/** Renderiza e publica o cartão de rolagem no chat. */
async function postRollCard(actor, { title, sections, meta = null, rolls = [] }) {
    // Valor sugerido para aplicar dano/cura: o total do dano, senão o da última seção.
    const damageSection = sections.find((s) => s.kind === 'damage');
    const applyAmount = (damageSection ?? sections[sections.length - 1])?.total ?? 0;

    const { renderTemplate } = foundry.applications.handlebars;
    const content = await renderTemplate(CARD_TEMPLATE, { title, sections, meta, applyAmount });

    await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content,
        rolls,
        sound: CONFIG.sounds.dice
    });
}
