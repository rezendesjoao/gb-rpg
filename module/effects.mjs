import { GRANBLUE } from './config.mjs';

/**
 * Aplicação de status effects do Granblue nos tokens selecionados.
 * Compartilhado pelo botão da caixa de ação (ficha) e pelo botão do cartão de
 * chat, para que os dois se comportem igual.
 */

/** Dados de exibição de um status effect: { id, img, label } ou null. */
export function describeStatusEffect(statusId) {
    const effect = GRANBLUE.statusEffectById(statusId);
    if (!effect) return null;
    return { id: effect.id, img: effect.img, label: game.i18n.localize(effect.name) };
}

/**
 * Liga o status effect nos tokens selecionados. Aplicar um efeito que o alvo
 * já possui não faz nada (é idempotente, não desliga).
 * Devolve o número de atores afetados.
 */
export async function applyStatusToSelectedTokens(statusId) {
    const effect = describeStatusEffect(statusId);
    if (!effect) {
        ui.notifications?.warn(game.i18n.localize('GRANBLUE.Chat.noStatusEffect'));
        return 0;
    }

    const tokens = canvas.tokens?.controlled ?? [];
    if (!tokens.length) {
        ui.notifications?.warn(game.i18n.localize('GRANBLUE.Chat.noTokensEffect'));
        return 0;
    }

    const affected = [];
    for (const token of tokens) {
        const actor = token.actor;
        if (!actor) continue;
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
