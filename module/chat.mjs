import { applyStatusToTokens } from './effects.mjs';
import { hydrateCard } from './sigil.mjs';

/**
 * Cartões de chat do Granblue: botões de aplicar dano/cura/efeito (com a
 * Redução de Dano do alvo), informação restrita ao dono do alvo e os cartões
 * de descrição (habilidades passivas, traços de classe e herança).
 */

const DESCRIPTION_TEMPLATE = 'systems/granblue/templates/chat/description-card.hbs';

/* -------------------------------------------- */
/*  Cartões de descrição                        */
/* -------------------------------------------- */

/** Texto puro → HTML seguro, mantendo parágrafos e quebras de linha. */
export function textToHtml(text) {
    return String(text ?? '')
        .trim()
        .split(/\n{2,}/)
        .filter((p) => p.trim())
        .map((p) => `<p>${foundry.utils.escapeHTML(p.trim()).replace(/\n/g, '<br>')}</p>`)
        .join('');
}

/**
 * Publica um cartão de descrição no chat (habilidade passiva, habilidade de
 * classe, traço/progresso de herança). Use `text` para texto puro ou `html`
 * para conteúdo que já é HTML (campos de herança). `kind` dá a cor do cartão
 * (passive, class, heritage, item, advantage, disadvantage); a passiva de uma
 * magia passa a `sphere` e os dados do `sigil` dela ({ name, arcano, level }).
 */
export async function postDescriptionCard(actor, { title, subtitle = '', icon = '', text = '', html = '', kind = '', sphere = '', sigil = null }) {
    const body = html || textToHtml(text);
    const { renderTemplate } = foundry.applications.handlebars;
    const content = await renderTemplate(DESCRIPTION_TEMPLATE, { title, subtitle, icon, body, kind, sphere, sigil });
    return ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content });
}

/* -------------------------------------------- */
/*  Renderização dos cartões                    */
/* -------------------------------------------- */

/**
 * Hook renderChatMessageHTML: desenha os dados e o selo do cartão, esconde
 * dados restritos e liga os botões.
 */
export function onRenderChatMessage(message, html) {
    const root = html instanceof HTMLElement ? html : html?.[0];
    if (!root) return;
    if (root.querySelector('.gb-card')) hydrateCard(root);
    hideRestrictedInfo(root);
    root.querySelectorAll('[data-gb-apply]').forEach((btn) => {
        btn.addEventListener('click', (ev) => onApplyClick(ev, btn, message));
    });
}

/**
 * A CA de cada alvo e os botões de aplicar direto nele só aparecem para o
 * mestre e para quem é dono do alvo — o resultado (acertou/errou) todos veem.
 */
function hideRestrictedInfo(root) {
    if (game.user.isGM) return;
    root.querySelectorAll('[data-gb-target]').forEach((row) => {
        const actor = fromUuidSync(row.dataset.gbTarget)?.actor;
        if (actor?.isOwner) return;
        row.querySelectorAll('[data-gb-owner-only]').forEach((el) => el.remove());
    });
}

/* -------------------------------------------- */
/*  Aplicar dano / cura / efeito                */
/* -------------------------------------------- */

/**
 * Quem recebe o botão de um cartão: os tokens selecionados; sem seleção, os
 * alvos guardados na rolagem — para dano e efeito, só os que foram atingidos.
 */
function resolveRecipients(message, { onlyHit }) {
    const controlled = canvas.tokens?.controlled ?? [];
    if (controlled.length) return controlled.map((t) => t.document);
    const targets = message?.getFlag('granblue', 'targets') ?? [];
    return targets
        .filter((t) => !onlyHit || t.hit !== false)
        .map((t) => fromUuidSync(t.uuid))
        .filter((t) => t?.actor);
}

async function onApplyClick(event, btn, message) {
    event.preventDefault();
    const kind = btn.dataset.gbApply;

    // Botão de um alvo específico (linha do alvo) ou geral (rodapé do cartão)
    let tokens;
    if (btn.dataset.target) {
        const token = fromUuidSync(btn.dataset.target);
        tokens = token?.actor ? [token] : [];
    } else {
        tokens = resolveRecipients(message, { onlyHit: kind !== 'heal' });
    }

    if (kind === 'effect') {
        await applyStatusToTokens(btn.dataset.effect, tokens);
        return;
    }
    if (!tokens.length) {
        ui.notifications?.warn(game.i18n.localize('GRANBLUE.Chat.noTokensApply'));
        return;
    }
    const amount = Number(btn.dataset.amount) || 0;
    if (kind === 'damage') {
        await applyDamageTo(tokens, amount, { ignoreRD: event.shiftKey, type: btn.dataset.damageType || 'fisico' });
    }
    else await applyHealingTo(tokens, amount);
}

/**
 * Aplica dano em cada token abatendo a RD dele do tipo do dano (física ou
 * mágica — ver GranblueActor#applyDamage). `ignoreRD` (Shift+clique) aplica
 * como dano verdadeiro.
 */
export async function applyDamageTo(tokens, amount, { ignoreRD = false, type = 'fisico' } = {}) {
    const lines = [];
    for (const token of tokens) {
        const actor = token.actor;
        // Sem permissão (jogador num monstro): pula, sem o erro cru do Foundry.
        if (typeof actor?.applyDamage !== 'function' || !actor.isOwner) continue;
        try {
            const r = await actor.applyDamage(amount, { ignoreRD, type });
            const rdLabel = game.i18n.localize(r.type === 'magico' ? 'GRANBLUE.RD.magicalShort' : 'GRANBLUE.RD.physicalShort');
            lines.push(r.rd
                ? game.i18n.format('GRANBLUE.Chat.damageLineRD', { name: token.name, taken: r.taken, raw: r.raw, rd: r.rd, rdLabel })
                : game.i18n.format('GRANBLUE.Chat.damageLine', { name: token.name, taken: r.taken }));
        } catch (err) {
            console.warn('Granblue | Sem permissão para alterar', actor?.name, err);
        }
    }
    reportApplied(lines, ignoreRD ? 'GRANBLUE.Chat.trueDamageApplied' : 'GRANBLUE.Chat.damageApplied');
}

/** Cura cada token até a vida máxima. */
export async function applyHealingTo(tokens, amount) {
    const lines = [];
    for (const token of tokens) {
        const actor = token.actor;
        if (typeof actor?.applyHealing !== 'function' || !actor.isOwner) continue;
        try {
            const r = await actor.applyHealing(amount);
            lines.push(game.i18n.format('GRANBLUE.Chat.healLine', { name: token.name, healed: r.healed }));
        } catch (err) {
            console.warn('Granblue | Sem permissão para alterar', actor?.name, err);
        }
    }
    reportApplied(lines, 'GRANBLUE.Chat.healApplied');
}

function reportApplied(lines, key) {
    if (!lines.length) {
        ui.notifications?.warn(game.i18n.localize('GRANBLUE.Chat.noEligibleTokens'));
        return;
    }
    ui.notifications?.info(`${game.i18n.localize(key)} ${lines.join(' · ')}`);
}
