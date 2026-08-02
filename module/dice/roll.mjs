import { GRANBLUE } from '../config.mjs';

const CARD_TEMPLATE = 'systems/granblue/templates/chat/roll-card.hbs';

/** Monta a escada de dificuldades marcando quais o resultado supera. */
function buildLadder(total, shift = 0) {
    return Object.values(GRANBLUE.difficulties).map((d) => {
        const value = d.value + shift;
        return { label: game.i18n.localize(d.label), value, success: total >= value };
    });
}

/**
 * Rola um teste de atributo: 3d6 + (atributo + bônus).
 * @param {boolean} [options.mana]  escada de DC exibe +5 (teste de Mana)
 */
export async function rollAttributeTest(actor, attrKey, options = {}) {
    const attr = actor.system.attributes?.[attrKey];
    if (!attr) return null;
    const mod = attr.total ?? ((attr.value ?? 0) + (attr.bonus ?? 0));
    const roll = new Roll('3d6 + @mod', { mod });
    await roll.evaluate();
    const shift = options.mana ? GRANBLUE.manaTestPenalty : 0;

    await postRollCard(actor, {
        title: game.i18n.localize(GRANBLUE.attributes[attrKey]?.label ?? attrKey),
        sections: [{
            subtitle: options.mana
                ? game.i18n.localize('GRANBLUE.Chat.manaTest')
                : game.i18n.localize('GRANBLUE.Chat.attributeTest'),
            rollHTML: await roll.render(),
            total: roll.total,
            difficulties: buildLadder(roll.total, shift)
        }],
        rolls: [roll]
    });
    return roll;
}

/** Avalia a fórmula de uma parte da ação; devolve o Roll ou null. */
async function evalActionRoll(actor, action, part) {
    const formula = (action?.[part] ?? '').trim();
    if (!formula) return null;
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
export async function rollActionPart(actor, action, part) {
    const hasFormula = !!(action?.[part] ?? '').trim();
    const roll = await evalActionRoll(actor, action, part);
    if (!roll) {
        if (!hasFormula) ui.notifications?.warn(game.i18n.localize('GRANBLUE.Chat.noFormula'));
        return null;
    }
    const isHit = part === 'hit';
    await postRollCard(actor, {
        title: action.name,
        sections: [{
            subtitle: game.i18n.localize(isHit ? 'GRANBLUE.Chat.hitRoll' : 'GRANBLUE.Chat.damageRoll'),
            rollHTML: await roll.render(),
            total: roll.total,
            difficulties: isHit ? buildLadder(roll.total) : null
        }],
        meta: buildActionMeta(action),
        rolls: [roll]
    });
    return roll;
}

/** Rola a ação inteira (acerto + dano, quando existirem) em um único cartão. */
export async function rollActionFull(actor, action) {
    const sections = [];
    const rolls = [];

    const hitRoll = await evalActionRoll(actor, action, 'hit');
    if (hitRoll) {
        rolls.push(hitRoll);
        sections.push({
            subtitle: game.i18n.localize('GRANBLUE.Chat.hitRoll'),
            rollHTML: await hitRoll.render(),
            total: hitRoll.total,
            difficulties: buildLadder(hitRoll.total)
        });
    }

    const dmgRoll = await evalActionRoll(actor, action, 'damage');
    if (dmgRoll) {
        rolls.push(dmgRoll);
        sections.push({
            subtitle: game.i18n.localize('GRANBLUE.Chat.damageRoll'),
            rollHTML: await dmgRoll.render(),
            total: dmgRoll.total,
            difficulties: null
        });
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
        sections: [{ subtitle: dieFormula, rollHTML: await roll.render(), total: roll.total, difficulties: null }],
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
    const { renderTemplate } = foundry.applications.handlebars;
    const content = await renderTemplate(CARD_TEMPLATE, { title, sections, meta });
    await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content,
        rolls,
        sound: CONFIG.sounds.dice
    });
}
