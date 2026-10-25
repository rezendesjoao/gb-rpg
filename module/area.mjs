import { GRANBLUE } from './config.mjs';

/**
 * Área de ataque das ações/magias com alcance complexo.
 *
 * A área (a × b metros) é posicionada no mapa como uma Região do Foundry v14 —
 * o substituto dos antigos Measured Templates: segue o cursor, gira com a
 * roda do mouse, clique esquerdo confirma e direito cancela. Ao confirmar,
 * todos os tokens dentro dela viram os alvos do usuário, e a rolagem de
 * acerto seguinte confere a CA de cada um (ver dice/roll.mjs).
 */

/** A ação/magia tem uma área a posicionar (alcance complexo com medidas)? */
export function hasArea(action) {
    return action?.rangeType === 'complex' && areaSize(action) != null;
}

/** Largura (a) e comprimento (b) em metros; um lado em branco copia o outro. */
function areaSize(action) {
    const a = Number(action.areaWidth) || 0;
    const b = Number(action.areaLength) || 0;
    if (a <= 0 && b <= 0) return null;
    return { width: a > 0 ? a : b, length: b > 0 ? b : a };
}

/** Rótulo curto da área ("Cone 3 × 6 m"), ou '' quando não há área. */
export function areaLabel(action) {
    if (!hasArea(action)) return '';
    const { width, length } = areaSize(action);
    const shape = game.i18n.localize(GRANBLUE.areaShapes[action.areaShape] ?? GRANBLUE.areaShapes.rect);
    const fmt = (n) => String(n).replace('.', ',');
    return `${shape} ${fmt(width)} × ${fmt(length)} m`;
}

/** Rótulo do alcance de uma ação: a área, a distância em metros ou o texto antigo. */
export function rangeLabel(action) {
    const parts = [];
    if (action?.rangeMeters != null && action.rangeMeters !== '') parts.push(`${String(action.rangeMeters).replace('.', ',')} m`);
    else if (String(action?.range ?? '').trim()) parts.push(String(action.range).trim());
    const area = areaLabel(action);
    if (area) parts.push(area);
    return parts.join(' · ');
}

/**
 * Forma da Região em pixels. O círculo usa a como diâmetro (com a ≠ b vira
 * uma elipse a × b); o cone tem b de alcance e a de abertura no fim; o
 * paralelogramo é um retângulo a × b centrado no cursor, girável.
 */
function buildShape(action) {
    const { width, length } = areaSize(action);
    const px = canvas.dimensions.distancePixels;
    const a = width * px;
    const b = length * px;
    switch (action.areaShape) {
        case 'circle':
            if (Math.abs(a - b) < 1) return { type: 'circle', x: 0, y: 0, radius: a / 2 };
            return { type: 'ellipse', x: 0, y: 0, radiusX: a / 2, radiusY: b / 2, rotation: 0 };
        case 'cone': {
            const angle = Math.min(179, Math.max(1, (2 * Math.atan(a / 2 / b) * 180) / Math.PI));
            return { type: 'cone', x: 0, y: 0, radius: b, angle, rotation: 0 };
        }
        default:
            return { type: 'rectangle', x: 0, y: 0, width: a, height: b, anchorX: 0.5, anchorY: 0.5, rotation: 0 };
    }
}

/**
 * Posiciona a área da ação no mapa e marca como alvo os tokens dentro dela.
 * Devolve a lista de tokens atingidos, ou null se não houve posicionamento
 * (cancelado, sem cena, ou Foundry sem Regiões posicionáveis).
 */
export async function placeArea(actor, action) {
    if (!hasArea(action)) return null;
    if (!canvas?.ready || !canvas.scene) {
        ui.notifications?.warn(game.i18n.localize('GRANBLUE.Area.noScene'));
        return null;
    }
    if (typeof canvas.regions?.placeRegion !== 'function') {
        ui.notifications?.warn(game.i18n.localize('GRANBLUE.Area.unsupported'));
        return null;
    }

    // Quem não pode criar Regiões ainda posiciona a área e marca os alvos;
    // ela só não fica desenhada no mapa para os outros.
    const create = CONFIG.Region.documentClass.canUserCreate(game.user) && !(game.paused && !game.user.isGM);
    const data = {
        name: `${action.name} — ${areaLabel(action)}`,
        color: game.user.color?.css ?? game.user.color,
        shapes: [buildShape(action)],
        levels: [],
        visibility: CONST.REGION_VISIBILITY.ALWAYS,
        highlightMode: 'coverage',
        displayMeasurements: true,
        ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE, [game.user.id]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER },
        flags: { granblue: { area: true, actor: actor?.uuid ?? null } }
    };

    ui.notifications?.info(game.i18n.localize('GRANBLUE.Area.placeHint'));
    let region = null;
    // O HUD fica transparente e deixa o clique passar enquanto a área é posicionada.
    document.body.classList.add('gb-placing-area');
    try {
        region = await canvas.regions.placeRegion(data, { create });
    } catch (err) {
        console.error('Granblue | Falha ao posicionar a área:', err);
        ui.notifications?.error(game.i18n.localize('GRANBLUE.Area.failed'));
    } finally {
        document.body.classList.remove('gb-placing-area');
        // A colocação pode ter ativado a camada de Regiões: volta para os tokens.
        if (!canvas.tokens.active) canvas.tokens.activate();
    }
    if (!region) return null;

    const tokens = tokensInRegion(region);
    canvas.tokens.setTargets(tokens.map((t) => t.id), { mode: 'replace' });
    ui.notifications?.info(tokens.length
        ? game.i18n.format('GRANBLUE.Area.targeted', { count: tokens.length, names: tokens.map((t) => t.name).join(', ') })
        : game.i18n.localize('GRANBLUE.Area.noTokens'));
    return tokens;
}

/** Tokens visíveis da cena atual que estão dentro da Região. */
function tokensInRegion(region) {
    return canvas.tokens.placeables.filter((token) => {
        if (!token.visible && !game.user.isGM) return false;
        try {
            return token.document.testInsideRegion(region);
        } catch (err) {
            console.warn('Granblue | Não foi possível testar o token na área:', token.name, err);
            return false;
        }
    });
}

/**
 * Pop-up depois do diálogo de bônus: posicionar a área no mapa antes de
 * rolar (marca os alvos) ou rolar sem área. Devolve false se o usuário
 * cancelou a ação inteira.
 */
export async function promptArea(actor, action) {
    if (!hasArea(action)) return true;
    const { DialogV2 } = foundry.applications.api;
    const esc = foundry.utils.escapeHTML;
    const choice = await DialogV2.wait({
        window: { title: `${action.name} — ${game.i18n.localize('GRANBLUE.Area.title')}`, icon: 'fa-solid fa-draw-polygon' },
        classes: ['granblue', 'themed', 'theme-light', 'gb-dialog'],
        position: { width: 460 },
        content: `<div class="granblue gb-roll-dialog">
            <p class="gb-area-prompt"><i class="fa-solid fa-draw-polygon"></i> <strong>${esc(areaLabel(action))}</strong></p>
            <p class="gb-rd-hint">${esc(game.i18n.localize('GRANBLUE.Area.promptHint'))}</p>
        </div>`,
        buttons: [
            { action: 'place', label: game.i18n.localize('GRANBLUE.Area.place'), icon: 'fa-solid fa-location-crosshairs', default: true },
            { action: 'skip', label: game.i18n.localize('GRANBLUE.Area.skip'), icon: 'fa-solid fa-dice-d20' },
            { action: 'cancel', label: game.i18n.localize('Cancel'), icon: 'fa-solid fa-xmark' }
        ],
        rejectClose: false
    });
    if (!choice || choice === 'cancel') return false;
    if (choice === 'place') await placeArea(actor, action);
    return true;
}
