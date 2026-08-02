import { GRANBLUE } from '../config.mjs';
import { rollDialog } from '../dice/roll-dialog.mjs';

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/**
 * Ficha base de Ator do Granblue. Concentra os handlers de ação (rolagens,
 * edição de imagem, ações/loot) e a lógica de abas, compartilhados entre
 * Personagem e Adversário.
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
            rollAttribute: GranblueActorSheetBase.#onRollAttribute,
            rollAction: GranblueActorSheetBase.#onRollAction,
            rollActionFull: GranblueActorSheetBase.#onRollActionFull,
            toggleAction: GranblueActorSheetBase.#onToggleAction,
            addAction: GranblueActorSheetBase.#onAddAction,
            deleteAction: GranblueActorSheetBase.#onDeleteAction,
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
     * Estado de UI (não persistido): índices das ações ABERTAS.
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

        // Arrastar uma ação para a barra de macros (hotbar)
        root.querySelectorAll('[data-drag-action]').forEach((el) => {
            el.addEventListener('dragstart', (ev) => {
                const idx = Number(el.dataset.dragAction);
                const action = this.document.system.actions?.[idx];
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

        // Reaplica o estado de colapso das ações (fechadas por padrão)
        root.querySelectorAll('.gb-action').forEach((el) => {
            const idx = Number(el.dataset.actionIndex);
            const open = this._expanded.has(idx);
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
     * magia → vira ação; classe/herança → substitui a existente; demais → padrão.
     */
    async _onDropItem(event, item) {
        if (item.type === 'spell') return this.#dropSpell(item);
        if (item.type === 'class') return this.#replaceEmbedded('class', item);
        if (item.type === 'heritage') return this.#replaceEmbedded('heritage', item);
        return super._onDropItem(event, item);
    }

    /** Magia arrastada → acrescenta uma ação na lista da ficha. */
    async #dropSpell(item) {
        const action = typeof item.system?.toActionData === 'function'
            ? item.system.toActionData()
            : { name: item.name, collapsed: true };
        const actions = foundry.utils.deepClone(this.document.system.actions ?? []);
        actions.push(action);
        await this.document.update({ 'system.actions': actions });
        ui.notifications?.info(`Granblue: ação "${item.name}" adicionada.`);
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
        const index = Number(target.dataset.index);
        const part = target.dataset.part;
        const action = this.document.system.actions?.[index];
        if (!action) return;
        const base = (action[part] ?? '').trim();
        const label = part === 'hit' ? 'Acerto' : 'Dano';
        const mods = await rollDialog({
            title: `${action.name} — ${label}`,
            parts: base ? [{ key: 'main', label, base }] : [],
            consume: GranblueActorSheetBase.#parseCost(action.cost)
        });
        if (!mods) return;
        await this.document.rollAction(index, part, mods.main ?? {});
        await GranblueActorSheetBase.#applyConsume(this.document, mods.consume);
    }

    static async #onRollActionFull(event, target) {
        const index = Number(target.dataset.index);
        const action = this.document.system.actions?.[index];
        if (!action) return;
        const parts = [];
        if ((action.hit ?? '').trim()) parts.push({ key: 'hit', label: 'Acerto', base: action.hit.trim() });
        if ((action.damage ?? '').trim()) parts.push({ key: 'damage', label: 'Dano', base: action.damage.trim() });
        const mods = await rollDialog({ title: action.name, parts, consume: GranblueActorSheetBase.#parseCost(action.cost) });
        if (!mods) return;
        await this.document.rollActionFull(index, { hit: mods.hit, damage: mods.damage });
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
        // Estado de UI apenas — não altera o documento (não dispara re-render).
        const index = Number(target.dataset.index);
        const open = !this._expanded.has(index);
        if (open) this._expanded.add(index);
        else this._expanded.delete(index);

        const el = target.closest('.gb-action');
        if (el) el.classList.toggle('gb-action--collapsed', !open);
        const icon = target.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-chevron-down', open);
            icon.classList.toggle('fa-chevron-right', !open);
        }
    }

    static async #onAddAction(event, target) {
        const actions = foundry.utils.deepClone(this.document.system.actions ?? []);
        actions.push({
            name: game.i18n.localize('GRANBLUE.Action.new'),
            hit: '', damage: '', cost: '', range: '',
            casting: '', difficulty: '', effect: '', description: ''
        });
        await this.document.update({ 'system.actions': actions });
    }

    static async #onDeleteAction(event, target) {
        const index = Number(target.dataset.index);
        const actions = foundry.utils.deepClone(this.document.system.actions ?? []);
        actions.splice(index, 1);
        // Ajusta o estado de colapso: os índices deslocam ao remover uma ação.
        const shifted = new Set();
        for (const i of this._expanded) {
            if (i < index) shifted.add(i);
            else if (i > index) shifted.add(i - 1);
        }
        this._expanded = shifted;
        await this.document.update({ 'system.actions': actions });
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
        const loot = foundry.utils.deepClone(this.document.system.loot ?? []);
        loot.push({ chance: '', item: '' });
        await this.document.update({ 'system.loot': loot });
    }

    static async #onDeleteLoot(event, target) {
        const index = Number(target.dataset.index);
        const loot = foundry.utils.deepClone(this.document.system.loot ?? []);
        loot.splice(index, 1);
        await this.document.update({ 'system.loot': loot });
    }
}
