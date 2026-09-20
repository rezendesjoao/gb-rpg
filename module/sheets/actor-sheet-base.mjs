import { GRANBLUE } from '../config.mjs';
import { rollDialog } from '../dice/roll-dialog.mjs';

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/**
 * Ficha base de Ator do Granblue. Concentra os handlers de ação (rolagens,
 * edição de imagem, listas editáveis) e a lógica de abas, compartilhados entre
 * Personagem e Adversário.
 *
 * As listas editáveis (`system.actions`, `system.spells`, `system.inventory`)
 * usam os mesmos handlers: o botão informa a lista em `data-list`
 * (ausente = `actions`, que é o caso da ficha de adversário).
 */
export class GranblueActorSheetBase extends HandlebarsApplicationMixin(ActorSheetV2) {
    static DEFAULT_OPTIONS = {
        classes: ['granblue', 'sheet', 'actor'],
        position: { width: 820, height: 860 },
        window: { resizable: true },
        form: { submitOnChange: true },
        dragDrop: [{ dragSelector: null, dropSelector: null }],
        actions: {
            editImage: GranblueActorSheetBase.#onEditImage,
            showArtwork: GranblueActorSheetBase.#onShowArtwork,
            rollAttribute: GranblueActorSheetBase.#onRollAttribute,
            rollAction: GranblueActorSheetBase.#onRollAction,
            rollActionFull: GranblueActorSheetBase.#onRollActionFull,
            toggleAction: GranblueActorSheetBase.#onToggleAction,
            addAction: GranblueActorSheetBase.#onAddAction,
            deleteAction: GranblueActorSheetBase.#onDeleteAction,
            moveAction: GranblueActorSheetBase.#onMoveAction,
            addSpell: GranblueActorSheetBase.#onAddSpell,
            addInventory: GranblueActorSheetBase.#onAddInventory,
            toggleInventory: GranblueActorSheetBase.#onToggleInventory,
            deleteInventory: GranblueActorSheetBase.#onDeleteInventory,
            moveInventory: GranblueActorSheetBase.#onMoveInventory,
            rollHitDie: GranblueActorSheetBase.#onRollHitDie,
            recalcMax: GranblueActorSheetBase.#onRecalcMax,
            addLoot: GranblueActorSheetBase.#onAddLoot,
            deleteLoot: GranblueActorSheetBase.#onDeleteLoot
        }
    };

    /** Aba ativa padrão (sobrescrita por subclasses se necessário). */
    static DEFAULT_TAB = 'principal';

    /** Guarda a aba ativa entre re-renderizações. */
    _tab = this.constructor.DEFAULT_TAB;

    /**
     * Estado de UI (não persistido): chaves `lista:índice` das linhas ABERTAS.
     * Padrão vazio = todas fechadas; alternar não dispara update do documento,
     * então editar outros campos não altera o estado de colapso.
     */
    _expanded = new Set();

    /* ---------------------------------- */
    /*  Contexto compartilhado            */
    /* ---------------------------------- */

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const actor = this.document;
        const sys = actor.system;
        // Dados armazenados (pré-Active Effects) para os campos editáveis,
        // enquanto os totais/derivados usam o valor preparado (pós-efeitos).
        const src = sys._source;

        const classItem = actor.items?.find((i) => i.type === 'class') ?? null;
        const heritageItem = actor.items?.find((i) => i.type === 'heritage') ?? null;

        Object.assign(context, {
            actor,
            system: sys,
            config: GRANBLUE,
            editable: this.isEditable,
            tab: this._tab,
            attributes: Object.entries(GRANBLUE.attributes).map(([key, cfg]) => ({
                key,
                label: game.i18n.localize(cfg.label),
                abbr: game.i18n.localize(cfg.abbr),
                func: game.i18n.localize(cfg.func),
                value: src.attributes[key].value,
                bonus: src.attributes[key].bonus,
                total: sys.attributes[key].total,
                effect: (sys.attributes[key].bonus ?? 0) - (src.attributes[key].bonus ?? 0)
            })),
            actions: sys.actions ?? [],
            hp: sys.resources.hitPoints,
            hpSource: src.resources.hitPoints,
            mana: sys.resources.mana,
            ca: sys.defenses.ca,
            caBonus: src.defenses.caBonus,
            classItem,
            heritageItem,
            hasClass: !!classItem
        });

        // Percentuais das barras de vida/mana (para o preenchimento visual)
        const hpMax = sys.resources.hitPoints.max || 0;
        const manaMax = sys.resources.mana.max || 0;
        context.hpPct = hpMax > 0 ? Math.max(0, Math.min(100, Math.round((sys.resources.hitPoints.value / hpMax) * 100))) : 0;
        context.manaPct = manaMax > 0 ? Math.max(0, Math.min(100, Math.round((sys.resources.mana.value / manaMax) * 100))) : 0;
        return context;
    }

    /** Constrói lista de opções [{value,label,selected}] a partir de um objeto de escolhas. */
    static buildOptions(choices, current, { localize = false } = {}) {
        return Object.entries(choices).map(([value, label]) => ({
            value,
            label: localize ? game.i18n.localize(label) : label,
            selected: value === current
        }));
    }

    /* ---------------------------------- */
    /*  Render / Abas                     */
    /* ---------------------------------- */

    _onRender(context, options) {
        super._onRender?.(context, options);
        const root = this.element;
        if (!root) return;

        const applyTab = (tab) => {
            this._tab = tab;
            root.querySelectorAll('[data-tab-nav]').forEach((a) =>
                a.classList.toggle('active', a.dataset.tabNav === tab));
            root.querySelectorAll('[data-tab-content]').forEach((s) =>
                s.classList.toggle('active', s.dataset.tabContent === tab));
        };

        root.querySelectorAll('[data-tab-nav]').forEach((a) => {
            a.addEventListener('click', (ev) => {
                ev.preventDefault();
                applyTab(a.dataset.tabNav);
            });
        });
        applyTab(this._tab);

        // Arrastar uma ação/magia para a barra de macros (hotbar)
        root.querySelectorAll('[data-drag-action]').forEach((el) => {
            el.addEventListener('dragstart', (ev) => {
                const idx = Number(el.dataset.dragAction);
                const action = this.#rows(el.dataset.list ?? 'actions')[idx];
                if (!action) return;
                const data = {
                    type: 'granblueAction',
                    actorUuid: this.document.uuid,
                    actionName: action.name
                };
                ev.dataTransfer.setData('text/plain', JSON.stringify(data));
                ev.dataTransfer.effectAllowed = 'copy';
            });
        });

        // Reaplica o estado de colapso das linhas (fechadas por padrão)
        root.querySelectorAll('.gb-action').forEach((el) => {
            const key = `${el.dataset.list ?? 'actions'}:${Number(el.dataset.actionIndex)}`;
            const open = this._expanded.has(key);
            el.classList.toggle('gb-action--collapsed', !open);
            const icon = el.querySelector('.gb-collapse-toggle i');
            if (icon) {
                icon.classList.toggle('fa-chevron-down', open);
                icon.classList.toggle('fa-chevron-right', !open);
            }
        });
    }

    /* ---------------------------------- */
    /*  Drop de itens (mecanismo nativo)   */
    /* ---------------------------------- */

    /**
     * Sobrescreve o drop de item do ActorSheetV2 (chamado uma única vez pelo core):
     * magia → aba Magia (ou ação, no adversário); classe/herança → substitui a
     * existente; demais → padrão.
     */
    async _onDropItem(event, item) {
        if (item.type === 'spell') return this.#dropSpell(item);
        if (item.type === 'class') return this.#replaceEmbedded('class', item);
        if (item.type === 'heritage') return this.#replaceEmbedded('heritage', item);
        return super._onDropItem(event, item);
    }

    /**
     * Magia arrastada → entra na lista de magias, na esfera dela (personagem).
     * Atores sem a lista de magias (adversário) continuam recebendo uma ação.
     */
    async #dropSpell(item) {
        const sys = item.system ?? {};
        const base = typeof sys.toActionData === 'function' ? sys.toActionData() : { name: item.name };

        if (!Array.isArray(this.document.system.spells)) {
            const actions = this.#rows('actions');
            actions.push(base);
            await this.#saveRows('actions', actions);
            ui.notifications?.info(`Granblue: ação "${item.name}" adicionada.`);
            return;
        }

        const spells = this.#rows('spells');
        const sphere = GRANBLUE.normalizeSphere(sys.sphere) || 'energia';
        spells.push({
            ...base,
            sphere,
            arcano: String(sys.arcano ?? ''),
            level: Number(sys.level) || 1
        });
        await this.#saveRows('spells', spells);
        const sphereLabel = game.i18n.localize(GRANBLUE.spheres[sphere].label);
        ui.notifications?.info(`Granblue: magia "${item.name}" adicionada à esfera ${sphereLabel}.`);
    }

    /** Classe/Herança arrastada → substitui a existente e cria o item embutido. */
    async #replaceEmbedded(type, item) {
        const existing = this.document.items.filter((i) => i.type === type).map((i) => i.id);
        if (existing.length) await this.document.deleteEmbeddedDocuments('Item', existing);
        await this.document.createEmbeddedDocuments('Item', [item.toObject()]);
        if (type === 'class' && typeof this.document.recalcMax === 'function') {
            await this.document.recalcMax();
        }
    }

    /* ---------------------------------- */
    /*  Listas editáveis                  */
    /* ---------------------------------- */

    /** Nome da lista a que um botão pertence (`actions` quando não informado). */
    static #listOf(target) {
        return target.dataset.list ?? 'actions';
    }

    /** Cópia editável de uma das listas do system. */
    #rows(list) {
        return foundry.utils.deepClone(this.document.system[list] ?? []);
    }

    /** Grava a lista de volta no documento. */
    async #saveRows(list, rows) {
        return this.document.update({ [`system.${list}`]: rows });
    }

    /** Alterna o colapso de uma linha (estado de UI apenas, sem update). */
    #toggleRow(list, target) {
        const key = `${list}:${Number(target.dataset.index)}`;
        const open = !this._expanded.has(key);
        if (open) this._expanded.add(key);
        else this._expanded.delete(key);

        const el = target.closest('.gb-action');
        if (el) el.classList.toggle('gb-action--collapsed', !open);
        const icon = target.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-chevron-down', open);
            icon.classList.toggle('fa-chevron-right', !open);
        }
    }

    /** Remove uma linha, reindexando o estado de colapso da mesma lista. */
    async #deleteRow(list, index) {
        const rows = this.#rows(list);
        if (!(index >= 0 && index < rows.length)) return;
        rows.splice(index, 1);
        this.#remapExpanded(list, (i) => (i === index ? null : i > index ? i - 1 : i));
        await this.#saveRows(list, rows);
    }

    /** Move uma linha para cima/baixo, levando junto o estado de colapso. */
    async #moveRow(list, index, dir) {
        const rows = this.#rows(list);
        const dest = index + (dir === 'up' ? -1 : 1);
        if (dest < 0 || dest >= rows.length) return;
        [rows[index], rows[dest]] = [rows[dest], rows[index]];
        this.#remapExpanded(list, (i) => (i === index ? dest : i === dest ? index : i));
        await this.#saveRows(list, rows);
    }

    /** Reindexa as chaves de colapso de uma lista (null = descarta a chave). */
    #remapExpanded(list, fn) {
        const next = new Set();
        for (const key of this._expanded) {
            const sep = key.indexOf(':');
            if (key.slice(0, sep) !== list) {
                next.add(key);
                continue;
            }
            const mapped = fn(Number(key.slice(sep + 1)));
            if (mapped != null) next.add(`${list}:${mapped}`);
        }
        this._expanded = next;
    }

    /* ---------------------------------- */
    /*  Handlers de ação                  */
    /* ---------------------------------- */

    static async #onEditImage(event, target) {
        if (!this.isEditable) return;
        const attr = target.dataset.edit ?? 'img';
        const current = foundry.utils.getProperty(this.document, attr);
        const FP = foundry.applications.apps.FilePicker?.implementation ?? globalThis.FilePicker;
        const fp = new FP({
            type: 'image',
            current,
            callback: (path) => this.document.update({ [attr]: path })
        });
        return fp.browse();
    }

    /** Abre a arte do ator em tamanho real. */
    static #onShowArtwork() {
        const src = this.document.img;
        if (!src) return;
        const IP = foundry.applications.apps.ImagePopout ?? globalThis.ImagePopout;
        if (!IP) return;
        new IP({ src, uuid: this.document.uuid, window: { title: this.document.name } }).render(true);
    }

    static async #onRollAttribute(event, target) {
        const key = target.dataset.attribute;
        const attr = this.document.system.attributes[key];
        const label = game.i18n.localize(GRANBLUE.attributes[key]?.label ?? key);
        const mods = await rollDialog({
            title: `Teste — ${label}`,
            parts: [{ key: 'main', label: 'Teste', base: `3d6 + ${attr.total}` }],
            mana: true
        });
        if (!mods) return;
        await this.document.rollAttribute(key, { mana: mods.mana, bonus: mods.main.bonus, dice: mods.main.dice });
    }

    static async #onRollAction(event, target) {
        const list = GranblueActorSheetBase.#listOf(target);
        const index = Number(target.dataset.index);
        const part = target.dataset.part;
        const action = (this.document.system[list] ?? [])[index];
        if (!action) return;
        const base = (action[part] ?? '').trim();
        const label = part === 'hit' ? 'Acerto' : 'Dano';
        const mods = await rollDialog({
            title: `${action.name} — ${label}`,
            parts: base ? [{ key: 'main', label, base }] : [],
            consume: GranblueActorSheetBase.#parseCost(action.cost)
        });
        if (!mods) return;
        await this.document.rollAction(index, part, mods.main ?? {}, list);
        await GranblueActorSheetBase.#applyConsume(this.document, mods.consume);
    }

    static async #onRollActionFull(event, target) {
        const list = GranblueActorSheetBase.#listOf(target);
        const index = Number(target.dataset.index);
        const action = (this.document.system[list] ?? [])[index];
        if (!action) return;
        const parts = [];
        if ((action.hit ?? '').trim()) parts.push({ key: 'hit', label: 'Acerto', base: action.hit.trim() });
        if ((action.damage ?? '').trim()) parts.push({ key: 'damage', label: 'Dano', base: action.damage.trim() });
        const mods = await rollDialog({ title: action.name, parts, consume: GranblueActorSheetBase.#parseCost(action.cost) });
        if (!mods) return;
        await this.document.rollActionFull(index, { hit: mods.hit, damage: mods.damage }, list);
        await GranblueActorSheetBase.#applyConsume(this.document, mods.consume);
    }

    /** Extrai o número inicial do campo de custo (ex.: "5", "5^n" → 5). */
    static #parseCost(cost) {
        const n = Number.parseInt(String(cost ?? ''), 10);
        return Number.isFinite(n) ? n : 0;
    }

    /** Consome o recurso escolhido no diálogo, se houver. */
    static async #applyConsume(actor, consume) {
        if (consume && consume.resource !== 'none' && consume.amount > 0) {
            await actor.spendResource(consume.resource, consume.amount);
        }
    }

    static #onToggleAction(event, target) {
        this.#toggleRow(GranblueActorSheetBase.#listOf(target), target);
    }

    static #onToggleInventory(event, target) {
        this.#toggleRow('inventory', target);
    }

    static async #onAddAction(event, target) {
        const list = GranblueActorSheetBase.#listOf(target);
        const rows = this.#rows(list);
        rows.push({
            name: game.i18n.localize('GRANBLUE.Action.new'),
            hit: '', damage: '', cost: '', range: '',
            casting: '', difficulty: '', effect: '', description: ''
        });
        await this.#saveRows(list, rows);
    }

    /** Cria uma magia já dentro da esfera do botão que foi clicado. */
    static async #onAddSpell(event, target) {
        const sphere = GRANBLUE.normalizeSphere(target.dataset.sphere) || 'energia';
        const rows = this.#rows('spells');
        rows.push({
            name: game.i18n.localize('GRANBLUE.Spell.new'),
            hit: '3d6 + @disciplina', damage: '', cost: '', range: '',
            casting: '', difficulty: '', effect: '', description: '',
            sphere, arcano: '', level: 1
        });
        await this.#saveRows('spells', rows);
    }

    /** Cria um item já dentro da categoria do botão que foi clicado. */
    static async #onAddInventory(event, target) {
        const category = target.dataset.category || 'outros';
        const rows = this.#rows('inventory');
        rows.push({
            name: game.i18n.localize('GRANBLUE.Inventory.new'),
            category, quantity: 1, tier: '', quality: '',
            weight: '', value: '', equipped: false, description: ''
        });
        await this.#saveRows('inventory', rows);
    }

    static async #onMoveAction(event, target) {
        await this.#moveRow(GranblueActorSheetBase.#listOf(target), Number(target.dataset.index), target.dataset.dir);
    }

    static async #onMoveInventory(event, target) {
        await this.#moveRow('inventory', Number(target.dataset.index), target.dataset.dir);
    }

    static async #onDeleteAction(event, target) {
        await this.#deleteRow(GranblueActorSheetBase.#listOf(target), Number(target.dataset.index));
    }

    static async #onDeleteInventory(event, target) {
        await this.#deleteRow('inventory', Number(target.dataset.index));
    }

    static async #onRollHitDie(event, target) {
        if (typeof this.document.rollAndSetHitDie === 'function') {
            await this.document.rollAndSetHitDie();
        }
    }

    static async #onRecalcMax(event, target) {
        if (typeof this.document.recalcMax === 'function') {
            await this.document.recalcMax();
        }
    }

    static async #onAddLoot(event, target) {
        const loot = this.#rows('loot');
        loot.push({ chance: '', item: '' });
        await this.#saveRows('loot', loot);
    }

    static async #onDeleteLoot(event, target) {
        const index = Number(target.dataset.index);
        const loot = this.#rows('loot');
        loot.splice(index, 1);
        await this.#saveRows('loot', loot);
    }
}
