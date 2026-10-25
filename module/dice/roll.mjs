import { GRANBLUE } from '../config.mjs';
import { describeStatusEffect } from '../effects.mjs';
import { rangeLabel } from '../area.mjs';
import { rowActionType } from '../use-action.mjs';
import { roman } from '../sigil.mjs';

const CARD_TEMPLATE = 'systems/granblue/templates/chat/roll-card.hbs';

/** Extrai os dados de exibição de um Roll: cada dado, o modificador e o total. */
export function describeRoll(roll) {
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

    const testLabel = game.i18n.localize(options.mana ? 'GRANBLUE.Chat.manaTest' : 'GRANBLUE.Chat.attributeTest');
    await postRollCard(actor, {
        kind: 'attribute',
        icon: GRANBLUE.attributes[attrKey]?.icon ?? 'fa-solid fa-dice-d6',
        kicker: testLabel,
        title: game.i18n.localize(GRANBLUE.attributes[attrKey]?.label ?? attrKey),
        sections: [makeSection(roll.formula, roll, 'attribute')],
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
    await postActionCard(actor, action, {
        sections: [makeSection(isHit ? hitLabel() : damageLabel(action), roll, part)],
        hitTotal: isHit ? roll.total : null,
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
        sections.push(makeSection(hitLabel(), hitRoll, 'hit'));
    }

    const dmgRoll = await evalActionRoll(actor, action, 'damage', mods.damage);
    if (dmgRoll) {
        rolls.push(dmgRoll);
        sections.push(makeSection(damageLabel(action), dmgRoll, 'damage'));
    }

    // Sem fórmula nenhuma: uma magia de efeito (buff, Charged…) ainda publica o
    // cartão com o efeito e o botão de aplicar; sem nada para mostrar, avisa.
    const hasText = action.statusEffect || String(action.effect ?? '').trim() || String(action.description ?? '').trim();
    if (!sections.length && !hasText) {
        ui.notifications?.warn(game.i18n.localize('GRANBLUE.Chat.noFormula'));
        return null;
    }

    await postActionCard(actor, action, { sections, hitTotal: hitRoll?.total ?? null, rolls });
    return rolls;
}

/** Rola o dado de vida de uma classe e devolve o total. */
export async function rollHitDie(actor, dieFormula) {
    const roll = new Roll(dieFormula || '2d6');
    await roll.evaluate();
    const classItem = actor.items?.find((i) => i.type === 'class');
    await postRollCard(actor, {
        kind: 'die',
        icon: 'fa-solid fa-heart-pulse',
        kicker: classItem?.name ?? '',
        title: game.i18n.localize('GRANBLUE.HitDie'),
        sections: [makeSection(dieFormula || '2d6', roll, 'die')],
        rolls: [roll]
    });
    return roll.total;
}

/** Rótulo da rolagem de acerto no cartão. */
function hitLabel() {
    return game.i18n.localize('GRANBLUE.Chat.hitRoll');
}

/** Rótulo da rolagem de dano no cartão (nas magias, dano ou cura). */
function damageLabel(action) {
    return game.i18n.localize(GRANBLUE.normalizeSphere(action?.sphere) ? 'GRANBLUE.Chat.damageRollSpell' : 'GRANBLUE.Chat.damageRoll');
}

/* -------------------------------------------- */
/*  Alvos, CA e CD                              */
/* -------------------------------------------- */

/**
 * Tokens que o usuário marcou como alvo (tecla T ou botão de alvo do HUD) no
 * momento da rolagem, com a CA atual de cada um — já com Active Effects como
 * Frost ou Insight, que mexem na CA.
 */
function collectTargets() {
    return Array.from(game.user.targets ?? []).map((token) => {
        const ca = Number(token.actor?.system?.defenses?.ca);
        return {
            uuid: token.document.uuid,
            name: token.document.name,
            img: token.document.texture?.src || token.actor?.img || '',
            ca: Number.isFinite(ca) ? ca : null
        };
    });
}

/**
 * Confere a rolagem de acerto contra a CA de cada alvo. Empate acerta, a não
 * ser que a configuração "Empate com a CA acerta" esteja desligada.
 * `hit` fica null quando não houve rolagem de acerto (ex.: só dano).
 */
function checkTargets(targets, hitTotal) {
    const tieHits = game.settings.get('granblue', 'hitOnTie');
    return targets.map((t) => {
        let hit = null;
        if (hitTotal != null && t.ca != null) hit = tieHits ? hitTotal >= t.ca : hitTotal > t.ca;
        return { ...t, hit };
    });
}

/**
 * CD de conjuração de uma magia: só quando o campo Dificuldade é um número
 * puro ("14" ou "CD 14"). Textos como "8 + Potência" não são conferidos.
 */
function spellDifficulty(action) {
    if (!GRANBLUE.normalizeSphere(action.sphere)) return null;
    const match = String(action.difficulty ?? '').trim().match(/^(?:CD\s*)?(\d+)$/i);
    return match ? Number(match[1]) : null;
}

/* -------------------------------------------- */
/*  Cartões                                     */
/* -------------------------------------------- */

/** Monta e publica o cartão de uma ação/magia: dados, alvos, CD, efeito e descrição. */
async function postActionCard(actor, action, { sections, hitTotal, rolls }) {
    const targets = checkTargets(collectTargets(), hitTotal);

    let check = null;
    const dc = hitTotal != null ? spellDifficulty(action) : null;
    if (dc != null) {
        const success = hitTotal >= dc;
        check = {
            dc,
            result: success ? 'success' : 'failure',
            label: game.i18n.localize(success ? 'GRANBLUE.Chat.castSuccess' : 'GRANBLUE.Chat.castFailure')
        };
    }

    const sphere = GRANBLUE.normalizeSphere(action.sphere);
    const typeCfg = GRANBLUE.actionTypes[rowActionType(action)];
    const kicker = sphere
        ? [game.i18n.localize(GRANBLUE.spheres[sphere].label), action.arcano, `${game.i18n.localize('GRANBLUE.Spell.level')} ${roman(action.level)}`]
        : [typeCfg ? game.i18n.localize(typeCfg.label) : ''];
    await postRollCard(actor, {
        kind: sphere ? 'spell' : 'action',
        sphere,
        sigil: sphere ? { name: action.name, arcano: action.arcano ?? '', level: action.level ?? 1 } : null,
        icon: typeCfg?.icon ?? 'fa-solid fa-hand-fist',
        kicker: kicker.filter(Boolean).join(' · '),
        chips: buildActionChips(action, { spell: !!sphere, typeCfg }),
        title: action.name,
        description: String(action.description ?? '').trim(),
        effectText: String(action.effect ?? '').trim(),
        sections,
        check,
        targets,
        hitTotal,
        statusEffect: describeStatusEffect(action.statusEffect),
        damageType: damageTypeOf(action),
        rolls
    });
}

/** Natureza do dano de uma ação/magia (magias = as que têm esfera). */
export function damageTypeOf(action) {
    return GRANBLUE.damageNature(action, { spell: !!GRANBLUE.normalizeSphere(action?.sphere) });
}

/**
 * Fichas de informação do cartão de uma ação/magia: custo, alcance, a
 * conjuração e a dificuldade. Esfera, arcano e nível da magia já vão no
 * sobretítulo do cartão; o tipo de ação da técnica, também.
 */
function buildActionChips(action, { spell, typeCfg }) {
    const chips = [];
    const add = (icon, label, value) => {
        const text = String(value ?? '').trim();
        if (text) chips.push({ icon, label, value: text });
    };
    add(spell ? 'fa-solid fa-droplet' : 'fa-solid fa-flask', game.i18n.localize('GRANBLUE.Action.cost'), action.cost);
    add('fa-solid fa-ruler', game.i18n.localize('GRANBLUE.Action.range'), rangeLabel(action));
    if (spell) {
        add(typeCfg?.icon ?? 'fa-solid fa-hourglass-half', game.i18n.localize('GRANBLUE.Action.casting'),
            action.casting || (typeCfg ? game.i18n.localize(typeCfg.label) : ''));
    }
    const diff = String(action.difficulty ?? '').trim();
    add('fa-solid fa-bullseye', game.i18n.localize('GRANBLUE.Action.difficulty'), /^\d+$/.test(diff) ? `CD ${diff}` : diff);
    return chips;
}

/** Resultado de cada alvo pronto para o template (rótulos de acerto/erro e CA). */
function describeTargets(targets) {
    return targets.map((t) => ({
        ...t,
        caLabel: t.ca != null ? `CA ${t.ca}` : '',
        result: t.hit === true ? 'hit' : t.hit === false ? 'miss' : '',
        resultLabel: t.hit === true
            ? game.i18n.localize('GRANBLUE.Chat.targetHit')
            : t.hit === false ? game.i18n.localize('GRANBLUE.Chat.targetMiss') : '',
        canApply: t.hit !== false
    }));
}

/**
 * Renderiza e publica o cartão de rolagem no chat. `kind` (attribute, die,
 * action, spell) escolhe o visual; a magia leva `sphere` e os dados do
 * `sigil` (desenhado ao exibir a mensagem), as demais um ícone (`icon`).
 * `kicker` é o sobretítulo e `chips` as fichas de informação abaixo do título.
 */
async function postRollCard(actor, {
    kind = 'action', icon = '', sigil = null, sphere = '', kicker = '', chips = [],
    title, sections, statusEffect = null, rolls = [],
    description = '', effectText = '', check = null, targets = [], hitTotal = null, damageType = 'fisico'
}) {
    // Valor sugerido para aplicar dano/cura: o total do dano, senão o da última seção.
    const damageSection = sections.find((s) => s.kind === 'damage');
    const applyAmount = (damageSection ?? sections[sections.length - 1])?.total ?? 0;
    // Testes de atributo e o dado de vida não aplicam nada: o cartão fica sem rodapé.
    const appliable = kind === 'action' || kind === 'spell';

    const { renderTemplate } = foundry.applications.handlebars;
    const content = await renderTemplate(CARD_TEMPLATE, {
        kind,
        icon,
        sigil,
        sphere,
        kicker,
        chips,
        title,
        description,
        effectText,
        sections,
        check,
        targets: describeTargets(targets),
        hasDamage: !!damageSection,
        hasRolls: appliable && sections.length > 0,
        hasButtons: appliable && (sections.length > 0 || !!statusEffect),
        damageType,
        damageTypeLabel: game.i18n.localize(GRANBLUE.damageTypes[damageType] ?? GRANBLUE.damageTypes.fisico),
        applyAmount,
        statusEffect
    });

    await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content,
        rolls,
        sound: CONFIG.sounds.dice,
        // Os alvos ficam guardados na mensagem: sem token selecionado, os botões
        // de dano/cura/efeito do cartão usam estes alvos (ver chat.mjs).
        flags: { granblue: { targets, hitTotal } }
    });
}
