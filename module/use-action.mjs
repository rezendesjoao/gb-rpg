import { GRANBLUE } from './config.mjs';
import { rollDialog } from './dice/roll-dialog.mjs';
import { promptArea } from './area.mjs';
import { roman } from './sigil.mjs';

/**
 * Fluxo de uso de uma ação/magia, compartilhado pela ficha e pelo HUD:
 * diálogo de bônus situacional → pop-up da área (alcance complexo) →
 * rolagem → consumo do custo escolhido no diálogo.
 */

/** Extrai o número inicial do campo de custo (ex.: "5", "5^n" → 5). */
export function parseCost(cost) {
    const n = Number.parseInt(String(cost ?? ''), 10);
    return Number.isFinite(n) ? n : 0;
}

/** Consome o recurso escolhido no diálogo, se houver. */
export async function applyConsume(actor, consume) {
    if (consume && consume.resource !== 'none' && consume.amount > 0) {
        await actor.spendResource(consume.resource, consume.amount);
    }
}

/**
 * Tipo de ação (GRANBLUE.actionTypes) gasto por uma ação/magia no HUD: o
 * escolhido na linha; senão o da Conjuração; senão a ação normal. Passivas
 * só entram no HUD com um tipo escolhido à mão (ex.: uma reação).
 */
export function rowActionType(row) {
    if (GRANBLUE.actionTypes[row?.actionType]) return row.actionType;
    if (row?.passive) return '';
    return GRANBLUE.actionTypeFromCasting(row?.casting) || 'normal';
}

/**
 * Cabeçalho do diálogo de bônus: a magia leva o selo e a esfera, com esfera,
 * arcano e nível no sobretítulo; a técnica, o ícone e o nome do tipo de ação.
 */
export function rollHeader(action) {
    const sphere = GRANBLUE.normalizeSphere(action?.sphere);
    if (sphere) {
        return {
            sphere,
            sigil: { name: action.name, arcano: action.arcano ?? '', level: action.level ?? 1 },
            kicker: [game.i18n.localize(GRANBLUE.spheres[sphere].label), action.arcano, `${game.i18n.localize('GRANBLUE.Spell.level')} ${roman(action.level)}`]
                .filter(Boolean).join(' · ')
        };
    }
    const type = GRANBLUE.actionTypes[rowActionType(action)];
    return { icon: type?.icon ?? 'fa-solid fa-hand-fist', kicker: type ? game.i18n.localize(type.label) : '' };
}

/**
 * Rola a ação/magia inteira (acerto + dano). Passivas vão para o chat.
 * Devolve true quando a ação foi de fato usada (false = cancelada).
 */
export async function useAction(actor, list, index) {
    const action = actor.actionList(list)[index];
    if (!action) return false;
    if (action.passive) {
        await actor.postActionText(index, list, 'passive');
        return true;
    }
    const parts = [];
    if ((action.hit ?? '').trim()) parts.push({ key: 'hit', label: 'Acerto', base: action.hit.trim() });
    if ((action.damage ?? '').trim()) parts.push({ key: 'damage', label: 'Dano', base: action.damage.trim() });
    const mods = await rollDialog({ title: action.name, parts, consume: parseCost(action.cost), header: rollHeader(action) });
    if (!mods) return false;
    if (!(await promptArea(actor, action))) return false;
    // Sem nada para rolar nem mostrar, a ação não conta como usada.
    const result = await actor.rollActionFull(index, { hit: mods.hit, damage: mods.damage }, list);
    if (!result) return false;
    await applyConsume(actor, mods.consume);
    return true;
}

/** Rola só o acerto ou só o dano (botões da linha expandida na ficha). */
export async function useActionPart(actor, list, index, part) {
    const action = actor.actionList(list)[index];
    if (!action) return false;
    const base = (action[part] ?? '').trim();
    const label = part === 'hit' ? 'Acerto' : 'Dano';
    const mods = await rollDialog({
        title: `${action.name} — ${label}`,
        parts: base ? [{ key: part === 'hit' ? 'hit' : 'damage', label, base }] : [],
        consume: parseCost(action.cost),
        header: rollHeader(action)
    });
    if (!mods) return false;
    // A área só importa para o acerto: é ele que confere a CA dos alvos.
    if (part === 'hit' && !(await promptArea(actor, action))) return false;
    const result = await actor.rollAction(index, part, mods[part === 'hit' ? 'hit' : 'damage'] ?? {}, list);
    if (!result) return false;
    await applyConsume(actor, mods.consume);
    return true;
}
