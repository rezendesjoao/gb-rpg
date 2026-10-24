import { GRANBLUE } from './config.mjs';

/**
 * Aplicação de status effects do Granblue nos tokens.
 * Compartilhado pelo botão da caixa de ação (ficha) e pelos botões do cartão
 * de chat, para que todos se comportem igual.
 */

/** Dados de exibição de um status effect: { id, img, label, description } ou null. */
export function describeStatusEffect(statusId) {
    const effect = GRANBLUE.statusEffectById(statusId);
    if (!effect) return null;
    return {
        id: effect.id,
        img: effect.img,
        label: game.i18n.localize(effect.name),
        description: effect.description ? game.i18n.localize(effect.description) : ''
    };
}

/** Tokens selecionados; sem seleção, os tokens marcados como alvo pelo usuário. */
export function selectedOrTargetedTokens() {
    const controlled = canvas.tokens?.controlled ?? [];
    if (controlled.length) return controlled;
    return Array.from(game.user.targets ?? []);
}

/**
 * Liga o status effect nos tokens indicados (Token ou TokenDocument). Aplicar
 * um efeito que o alvo já possui não faz nada (é idempotente, não desliga).
 * Devolve o número de atores afetados.
 */
export async function applyStatusToTokens(statusId, tokens) {
    const effect = describeStatusEffect(statusId);
    if (!effect) {
        ui.notifications?.warn(game.i18n.localize('GRANBLUE.Chat.noStatusEffect'));
        return 0;
    }

    if (!tokens?.length) {
        ui.notifications?.warn(game.i18n.localize('GRANBLUE.Chat.noTokensEffect'));
        return 0;
    }

    const affected = [];
    for (const token of tokens) {
        const actor = token.actor;
        if (!actor?.isOwner) continue;
        try {
            await actor.toggleStatusEffect(effect.id, { active: true });
            affected.push(actor.name);
        } catch (err) {
            console.warn('Granblue | Sem permissão para aplicar o efeito em', actor?.name, err);
        }
    }

    if (!affected.length) {
        ui.notifications?.warn(game.i18n.localize('GRANBLUE.Chat.noEligibleTokens'));
        return 0;
    }
    ui.notifications?.info(
        game.i18n.format('GRANBLUE.Chat.effectApplied', { effect: effect.label, targets: affected.join(', ') })
    );
    return affected.length;
}

/** Botão da ficha: aplica nos tokens selecionados (ou, sem seleção, nos alvos). */
export async function applyStatusToSelectedTokens(statusId) {
    return applyStatusToTokens(statusId, selectedOrTargetedTokens());
}
