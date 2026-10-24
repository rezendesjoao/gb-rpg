import { GRANBLUE } from './config.mjs';
import { describeRoll } from './dice/roll.mjs';

/**
 * Rolagem de loot dos adversários.
 *
 * O mestre clica em "Enviar rolagem de loot" na ficha do adversário, escolhe os
 * jogadores e o bônus de drop; cada jogador recebe (via socket) um pop-up com a
 * CHANCE de cada espólio — sem o nome — e um botão de girar o d100. Tirar igual
 * ou menos que a chance consegue o item: abre um segundo pop-up, agora com o
 * nome, para girar a quantidade (fórmula do espólio) e a qualidade (d100 na
 * tabela de GRANBLUE.qualityChances, limitada à qualidade máxima do espólio).
 */

const { ApplicationV2, HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api;

export const SOCKET = 'system.granblue';
const LOOT_CARD = 'systems/granblue/templates/chat/loot-card.hbs';

/* -------------------------------------------- */
/*  Mestre: diálogo de envio                    */
/* -------------------------------------------- */

/** Espólios do ator com a chance já lida (null = chance inválida). */
function readLoot(actor) {
    return (actor.system.loot ?? []).map((l, index) => ({
        index,
        item: String(l.item ?? '').trim() || game.i18n.localize('GRANBLUE.Loot.unnamed'),
        chance: GRANBLUE.parseChance(l.chance),
        rawChance: String(l.chance ?? ''),
        quantity: String(l.quantity ?? '').trim() || '1',
        quality: l.quality in GRANBLUE.qualityChances ? l.quality : 'normal'
    }));
}

/** Rótulo do intervalo de qualidades de um espólio ("Normal → Rara"). */
export function qualityRangeLabel(maxQuality) {
    const normal = game.i18n.localize(GRANBLUE.itemQualities.normal);
    if (!maxQuality || maxQuality === 'normal') return normal;
    return `${normal} → ${game.i18n.localize(GRANBLUE.itemQualities[maxQuality])}`;
}

/**
 * Abre o diálogo do mestre para enviar a rolagem de loot de um adversário.
 * Bônus de drop padrão = o da dificuldade do encontro (GRANBLUE.dropBonus).
 */
export async function sendLootDialog(actor) {
    if (!game.user.isGM) return;
    const esc = foundry.utils.escapeHTML;
    const loot = readLoot(actor);
    const valid = loot.filter((l) => l.chance != null);
    if (!valid.length) {
        ui.notifications?.warn(game.i18n.localize('GRANBLUE.Loot.noLoot'));
        return;
    }

    const difficulty = actor.system.difficulty;
    const bonus = GRANBLUE.dropBonus[difficulty] ?? 0;
    const difficultyLabel = game.i18n.localize(GRANBLUE.adversaryDifficulties[difficulty] ?? difficulty);
    const players = game.users.filter((u) => !u.isGM && u.active);

    const preview = loot.map((l) => `
        <li class="${l.chance == null ? 'gb-loot-preview--invalid' : ''}">
            <strong>${l.chance == null ? '?' : `${l.chance}%`}</strong>
            <span>${esc(l.item)}</span>
            <em>${esc(l.quantity)} · ${esc(qualityRangeLabel(l.quality))}</em>
            ${l.chance == null ? `<small>${esc(game.i18n.localize('GRANBLUE.Loot.invalidChance'))}: "${esc(l.rawChance)}"</small>` : ''}
        </li>`).join('');

    const userRows = players.length
        ? players.map((u) => `
            <label class="gb-rd-check gb-loot-user">
                <input type="checkbox" name="users" value="${u.id}" checked>
                <span>${esc(u.name)}${u.character ? ` <em>(${esc(u.character.name)})</em>` : ''}</span>
            </label>`).join('')
        : `<p class="gb-rd-hint">${esc(game.i18n.localize('GRANBLUE.Loot.noPlayers'))}</p>`;

    const content = `
        <div class="granblue gb-roll-dialog gb-loot-send">
            <p class="gb-rd-hint">${esc(game.i18n.localize('GRANBLUE.Loot.sendHint'))}</p>
            <ul class="gb-loot-preview">${preview}</ul>
            <label class="gb-rd-field">
                <span>${esc(game.i18n.format('GRANBLUE.Loot.bonusLabel', { difficulty: difficultyLabel }))}</span>
                <input type="number" name="bonus" value="${bonus}" step="1">
            </label>
            <div class="gb-loot-users">
                <span class="gb-rd-name">${esc(game.i18n.localize('GRANBLUE.Loot.sendTo'))}</span>
                ${userRows}
                <label class="gb-rd-check gb-loot-user gb-loot-user--self">
                    <input type="checkbox" name="self" ${players.length ? '' : 'checked'}>
                    <span>${esc(game.i18n.localize('GRANBLUE.Loot.openForMe'))}</span>
                </label>
            </div>
        </div>`;

    const result = await DialogV2.wait({
        window: { title: game.i18n.format('GRANBLUE.Loot.sendTitle', { name: actor.name }), icon: 'fa-solid fa-sack-dollar' },
        classes: ['granblue', 'gb-dialog'],
        position: { width: 440 },
        content,
        buttons: [
            {
                action: 'send',
                label: game.i18n.localize('GRANBLUE.Loot.send'),
                icon: 'fa-solid fa-paper-plane',
                default: true,
                callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object
            },
            { action: 'cancel', label: game.i18n.localize('GRANBLUE.Loot.cancel'), icon: 'fa-solid fa-xmark' }
        ],
        rejectClose: false
    });
    if (!result || typeof result !== 'object') return;

    const users = [].concat(result.users ?? []).filter(Boolean);
    const extra = Number(result.bonus) || 0;
    if (!users.length && !result.self) {
        ui.notifications?.warn(game.i18n.localize('GRANBLUE.Loot.noRecipients'));
        return;
    }

    const payload = {
        id: foundry.utils.randomID(),
        source: actor.token?.name ?? actor.name,
        img: actor.img,
        bonus: extra,
        entries: valid.map((l) => ({
            item: l.item,
            chance: Math.min(100, Math.max(0, l.chance + extra)),
            baseChance: l.chance,
            quantity: l.quantity,
            quality: l.quality
        }))
    };
    if (users.length) game.socket.emit(SOCKET, { action: 'lootRoll', users, payload });
    if (result.self) openLootRoll(payload);
    if (users.length) {
        ui.notifications?.info(game.i18n.format('GRANBLUE.Loot.sent', { count: users.length, name: payload.source }));
    }
}

/* -------------------------------------------- */
/*  Socket                                      */
/* -------------------------------------------- */

/** Mensagens do socket do sistema: abre o pop-up de loot para os destinatários. */
export function onSocketMessage(data) {
    if (data?.action !== 'lootRoll') return;
    if (!data.users?.includes(game.user.id)) return;
    openLootRoll(data.payload);
}

/** Abre o pop-up de rolagem de loot (o mesmo pacote não abre duas vezes). */
export function openLootRoll(payload) {
    if (!payload?.entries?.length) return;
    const existing = foundry.applications.instances.get(`gb-loot-${payload.id}`);
    if (existing) return existing.bringToFront();
    new LootRollApp(payload).render({ force: true });
}

/* -------------------------------------------- */
/*  Cartões de chat                             */
/* -------------------------------------------- */

/** Publica uma rolagem de loot no chat, com o dado animado (Dice So Nice). */
async function postLootCard(roll, { title, subtitle = '', rollLabel = '', verdict = '', verdictLabel = '' }) {
    const { renderTemplate } = foundry.applications.handlebars;
    const content = await renderTemplate(LOOT_CARD, {
        title, subtitle, rollLabel, verdict, verdictLabel, roll: describeRoll(roll)
    });
    const actor = game.user.character;
    await ChatMessage.create({
        speaker: actor ? ChatMessage.getSpeaker({ actor }) : ChatMessage.getSpeaker(),
        content,
        rolls: [roll],
        sound: CONFIG.sounds.dice
    });
}

/* -------------------------------------------- */
/*  Jogador: pop-up das chances                 */
/* -------------------------------------------- */

class LootRollApp extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        classes: ['granblue', 'gb-loot-app'],
        window: { icon: 'fa-solid fa-sack-dollar', resizable: false },
        position: { width: 400, height: 'auto' },
        actions: { rollChance: LootRollApp.#onRollChance }
    };

    static PARTS = {
        main: { template: 'systems/granblue/templates/apps/loot-roll.hbs' }
    };

    constructor(payload, options = {}) {
        super({ ...options, id: `gb-loot-${payload.id}` });
        this.payload = payload;
        /** Resultado de cada espólio: { total, success } (null = ainda não rolado). */
        this.results = payload.entries.map(() => null);
    }

    get title() {
        return game.i18n.format('GRANBLUE.Loot.rollTitle', { name: this.payload.source });
    }

    async _prepareContext(options) {
        return {
            source: this.payload.source,
            img: this.payload.img,
            entries: this.payload.entries.map((e, index) => {
                const r = this.results[index];
                return {
                    index,
                    number: index + 1,
                    chance: e.chance,
                    result: r && !r.pending ? {
                        total: r.total,
                        verdict: r.success ? 'success' : 'failure',
                        label: game.i18n.localize(r.success ? 'GRANBLUE.Loot.success' : 'GRANBLUE.Loot.failure')
                    } : null,
                    pending: !!r?.pending
                };
            })
        };
    }

    static async #onRollChance(event, target) {
        const index = Number(target.dataset.index);
        const entry = this.payload.entries[index];
        if (!entry || this.results[index]) return;
        this.results[index] = { pending: true };

        const roll = await new Roll('1d100').evaluate();
        const success = roll.total <= entry.chance;
        this.results[index] = { total: roll.total, success };
        this.render();

        await postLootCard(roll, {
            title: game.i18n.format('GRANBLUE.Loot.cardTitle', { name: this.payload.source }),
            rollLabel: game.i18n.format('GRANBLUE.Loot.chanceRoll', { number: index + 1, chance: entry.chance }),
            verdict: success ? 'success' : 'failure',
            verdictLabel: success
                ? game.i18n.format('GRANBLUE.Loot.successItem', { item: entry.item })
                : game.i18n.localize('GRANBLUE.Loot.failure')
        });

        if (success) {
            new LootClaimApp(entry, this.payload.source, { position: claimPosition(this) }).render({ force: true });
        }
    }
}

/**
 * Posição do pop-up do item: ao lado do pop-up das chances (à direita, ou à
 * esquerda se não couber), descendo um pouco a cada item já aberto.
 */
function claimPosition(rollApp) {
    const { left, top, width } = rollApp.position;
    const claimWidth = LootClaimApp.DEFAULT_OPTIONS.position.width;
    const open = Array.from(foundry.applications.instances.values()).filter((a) => a instanceof LootClaimApp).length;
    const fitsRight = left + width + 10 + claimWidth <= window.innerWidth;
    return {
        left: fitsRight ? left + width + 10 : Math.max(0, left - claimWidth - 10),
        top: top + open * 28
    };
}

/* -------------------------------------------- */
/*  Jogador: pop-up do item obtido              */
/* -------------------------------------------- */

class LootClaimApp extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        classes: ['granblue', 'gb-loot-app', 'gb-loot-claim'],
        window: { icon: 'fa-solid fa-gem', resizable: false },
        position: { width: 380, height: 'auto' },
        actions: {
            rollQuantity: LootClaimApp.#onRollQuantity,
            rollQuality: LootClaimApp.#onRollQuality,
            storeItem: LootClaimApp.#onStoreItem
        }
    };

    static PARTS = {
        main: { template: 'systems/granblue/templates/apps/loot-claim.hbs' }
    };

    constructor(entry, source, options = {}) {
        super(options);
        this.entry = entry;
        this.source = source;
        this.quantity = null;
        // Espólio que só existe em Normal não precisa do d100 de qualidade.
        this.quality = entry.quality === 'normal' ? { key: 'normal', total: null } : null;
        this.stored = false;
        this.busy = false;
    }

    get title() {
        return game.i18n.localize('GRANBLUE.Loot.claimTitle');
    }

    /** Personagem do jogador que pode receber o item (ou null). */
    get character() {
        const actor = game.user.character;
        return actor?.type === 'character' && actor.isOwner ? actor : null;
    }

    async _prepareContext(options) {
        const quality = this.quality ? {
            ...this.quality,
            label: game.i18n.localize(GRANBLUE.itemQualities[this.quality.key]),
            rolledLabel: this.quality.capped ? game.i18n.localize(GRANBLUE.itemQualities[this.quality.rolled]) : ''
        } : null;
        return {
            source: this.source,
            item: this.entry.item,
            quantityFormula: this.entry.quantity,
            qualityRange: qualityRangeLabel(this.entry.quality),
            onlyNormal: this.entry.quality === 'normal',
            quantity: this.quantity,
            quality,
            done: !!(this.quantity && this.quality),
            stored: this.stored,
            characterName: this.character?.name ?? ''
        };
    }

    static async #onRollQuantity() {
        if (this.quantity || this.busy) return;
        this.busy = true;
        try {
            let roll;
            try {
                roll = await new Roll(this.entry.quantity).evaluate();
            } catch (err) {
                console.warn('Granblue | Fórmula de quantidade inválida:', this.entry.quantity, err);
                ui.notifications?.warn(game.i18n.format('GRANBLUE.Loot.badQuantity', { formula: this.entry.quantity }));
                roll = await new Roll('1').evaluate();
            }
            this.quantity = { total: Math.max(1, Math.floor(roll.total)) };
            this.render();
            await postLootCard(roll, {
                title: game.i18n.format('GRANBLUE.Loot.cardTitle', { name: this.source }),
                rollLabel: game.i18n.format('GRANBLUE.Loot.quantityRoll', { item: this.entry.item, formula: this.entry.quantity }),
                verdict: 'info',
                verdictLabel: `${this.quantity.total}× ${this.entry.item}`
            });
        } finally {
            this.busy = false;
        }
    }

    static async #onRollQuality() {
        if (this.quality || this.busy) return;
        this.busy = true;
        try {
            const roll = await new Roll('1d100').evaluate();
            const q = GRANBLUE.qualityFromRoll(roll.total, this.entry.quality);
            this.quality = { key: q.key, rolled: q.rolled, capped: q.capped, total: roll.total };
            this.render();
            const label = game.i18n.localize(GRANBLUE.itemQualities[q.key]);
            await postLootCard(roll, {
                title: game.i18n.format('GRANBLUE.Loot.cardTitle', { name: this.source }),
                rollLabel: game.i18n.format('GRANBLUE.Loot.qualityRoll', {
                    item: this.entry.item, range: qualityRangeLabel(this.entry.quality)
                }),
                verdict: 'quality',
                verdictLabel: q.capped
                    ? game.i18n.format('GRANBLUE.Loot.qualityCapped', {
                        quality: label, rolled: game.i18n.localize(GRANBLUE.itemQualities[q.rolled])
                    })
                    : label
            });
        } finally {
            this.busy = false;
        }
    }

    /**
     * Guarda o item no inventário do personagem do jogador (categoria
     * Materiais). Se já houver o mesmo item com a mesma qualidade, soma.
     */
    static async #onStoreItem() {
        const actor = this.character;
        if (!actor || this.stored || !this.quantity || !this.quality) return;
        const rows = foundry.utils.deepClone(actor.system._source.inventory ?? []);
        const name = this.entry.item;
        const same = rows.find((r) => r.name.trim().toLowerCase() === name.toLowerCase() && r.quality === this.quality.key);
        if (same) same.quantity = (same.quantity ?? 0) + this.quantity.total;
        else {
            rows.push({
                name,
                category: 'material',
                quantity: this.quantity.total,
                tier: '',
                quality: this.quality.key,
                weight: '',
                value: '',
                equipped: false,
                description: game.i18n.format('GRANBLUE.Loot.itemOrigin', { name: this.source })
            });
        }
        await actor.update({ 'system.inventory': rows });
        this.stored = true;
        this.render();
        ui.notifications?.info(game.i18n.format('GRANBLUE.Loot.stored', {
            quantity: this.quantity.total, item: name, name: actor.name
        }));
    }
}
