import { GRANBLUE } from './config.mjs';

/**
 * Economia de ações do turno (marcadores do HUD).
 *
 * As ações gastas ficam numa flag do ator (`flags.granblue.economy.used`, a
 * lista das ações simples já usadas). Num token não vinculado a flag vai para
 * o próprio token, então cada monstro tem os seus marcadores. A lista é
 * zerada no começo do turno do combatente (pelo mestre ativo) ou pelo botão
 * de reiniciar do HUD.
 */

const FLAG = 'economy';

/** Ações simples já gastas neste turno. */
export function usedActions(actor) {
    return new Set(actor?.getFlag('granblue', FLAG)?.used ?? []);
}

/** O tipo de ação ainda está disponível (todas as ações que ele gasta estão livres)? */
export function isActionAvailable(actor, type) {
    const used = usedActions(actor);
    const bases = GRANBLUE.baseActionTypes(type);
    return bases.length > 0 && bases.every((b) => !used.has(b));
}

/** Marca o tipo de ação como gasto (um composto gasta todas as suas partes). */
export async function spendAction(actor, type) {
    const bases = GRANBLUE.baseActionTypes(type);
    if (!actor || !bases.length) return;
    const used = usedActions(actor);
    bases.forEach((b) => used.add(b));
    await actor.setFlag('granblue', FLAG, { used: [...used] });
}

/** Libera todas as ações do turno. */
export async function resetActions(actor) {
    if (!actor?.getFlag('granblue', FLAG)) return;
    await actor.unsetFlag('granblue', FLAG);
}

/**
 * Hook updateCombat: quando o turno passa para outro combatente, o mestre
 * ativo libera as ações dele.
 */
export async function onUpdateCombat(combat, changed) {
    if (!game.user.isActiveGM) return;
    if (!('turn' in changed) && !('round' in changed)) return;
    const actor = combat.combatant?.actor;
    if (actor) await resetActions(actor);
}
