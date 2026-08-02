import { GRANBLUE } from '../config.mjs';

const CARD_TEMPLATE = 'systems/granblue/templates/chat/roll-card.hbs';

/**
 * Rola um teste de atributo: 3d6 + (atributo + bônus).
 * @param {Actor} actor
 * @param {string} attrKey   chave do atributo (forca, precisao, ...)
 * @param {object} [options]
 * @param {boolean} [options.mana]  se verdadeiro, a escada de DC exibe +5 (teste de Mana)
 */
export async function rollAttributeTest(actor, attrKey, options = {}) {
    const attr = actor.system.attributes?.[attrKey];
    if (!attr) return null;
    const mod = attr.total ?? ((attr.value ?? 0) + (attr.bonus ?? 0));
    const roll = new Roll('3d6 + @mod', { mod });
    await roll.evaluate();

    await postRollCard(actor, roll, {
        title: game.i18n.localize(GRANBLUE.attributes[attrKey]?.label ?? attrKey),
        subtitle: options.mana
            ? game.i18n.localize('GRANBLUE.Chat.manaTest')
            : game.i18n.localize('GRANBLUE.Chat.attributeTest'),
        showLadder: true,
        ladderShift: options.mana ? GRANBLUE.manaTestPenalty : 0
    });
    return roll;
}

/**
 * Rola uma parte de uma ação (acerto ou dano) usando a fórmula digitada na ficha.
 * @param {Actor} actor
 * @param {object} action  o objeto de ação
 * @param {'hit'|'damage'} part
 */
export async function rollActionPart(actor, action, part) {
    const formula = (action?.[part] ?? '').trim();
    if (!formula) {
        ui.notifications?.warn(game.i18n.localize('GRANBLUE.Chat.noFormula'));
        return null;
    }
    let roll;
    try {
        roll = new Roll(formula, actor.getRollData());
        await roll.evaluate();
    } catch (err) {
        ui.notifications?.error(`${game.i18n.localize('GRANBLUE.Chat.badFormula')}: ${formula}`);
        console.error('Granblue | Erro ao avaliar fórmula:', formula, err);
        return null;
    }

    const isHit = part === 'hit';
    await postRollCard(actor, roll, {
        title: action.name,
        subtitle: game.i18n.localize(isHit ? 'GRANBLUE.Chat.hitRoll' : 'GRANBLUE.Chat.damageRoll'),
        showLadder: isHit,
        meta: buildActionMeta(action)
    });
    return roll;
}

/** Rola o dado de vida de uma classe e devolve o total (para preencher o campo). */
export async function rollHitDie(actor, dieFormula) {
    const roll = new Roll(dieFormula || '2d6');
    await roll.evaluate();
    await postRollCard(actor, roll, {
        title: game.i18n.localize('GRANBLUE.HitDie'),
        subtitle: dieFormula,
        showLadder: false
    });
    return roll.total;
}

/** Monta as linhas de metadados (custo/alcance/etc.) exibidas no cartão de uma ação. */
function buildActionMeta(action) {
    const meta = [];
    if (action.cost) meta.push({ label: game.i18n.localize('GRANBLUE.Action.cost'), value: action.cost });
    if (action.range) meta.push({ label: game.i18n.localize('GRANBLUE.Action.range'), value: action.range });
    if (action.casting) meta.push({ label: game.i18n.localize('GRANBLUE.Action.casting'), value: action.casting });
    if (action.difficulty) meta.push({ label: game.i18n.localize('GRANBLUE.Action.difficulty'), value: action.difficulty });
    if (action.effect) meta.push({ label: game.i18n.localize('GRANBLUE.Action.effect'), value: action.effect });
    return meta;
}

/**
 * Renderiza e publica o cartão de rolagem no chat.
 */
async function postRollCard(actor, roll, { title, subtitle, showLadder, ladderShift = 0, meta = null }) {
    const rollHTML = await roll.render();

    let difficulties = null;
    if (showLadder) {
        difficulties = Object.values(GRANBLUE.difficulties).map((d) => {
            const value = d.value + ladderShift;
            return { label: game.i18n.localize(d.label), value, success: roll.total >= value };
        });
    }

    const { renderTemplate } = foundry.applications.handlebars;
    const content = await renderTemplate(CARD_TEMPLATE, {
        title,
        subtitle,
        rollHTML,
        total: roll.total,
        difficulties,
        meta
    });

    await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content,
        rolls: [roll],
        sound: CONFIG.sounds.dice
    });
}
