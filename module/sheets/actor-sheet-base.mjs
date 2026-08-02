import { GRANBLUE } from '../config.mjs';

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
        actions: {
            editImage: GranblueActorSheetBase.#onEditImage,
            rollAttribute: GranblueActorSheetBase.#onRollAttribute,
            rollAction: GranblueActorSheetBase.#onRollAction,
            rollActionFull: GranblueActorSheetBase.#onRollActionFull,
            toggleAction: GranblueActorSheetBase.#onToggleAction,
            addAction: GranblueActorSheetBase.#onAddAction,
            deleteAction: GranblueActorSheetBase.#onDeleteAction,
            rollHitDie: GranblueActorSheetBase.#onRollHitDie,
            addLoot: GranblueActorSheetBase.#onAddLoot,
            deleteLoot: GranblueActorSheetBase.#onDeleteLoot
        }
    };

    /** Aba ativa padrão (sobrescrita por subclasses se necessário). */
    static DEFAULT_TAB = 'principal';

    /** Guarda a aba ativa entre re-renderizações. */
    _tab = this.constructor.DEFAULT_TAB;

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
        await this.document.rollAttribute(key, { mana: event.shiftKey });
    }

    static async #onRollAction(event, target) {
        const index = Number(target.dataset.index);
        const part = target.dataset.part;
        await this.document.rollAction(index, part);
    }

    static async #onRollActionFull(event, target) {
        const index = Number(target.dataset.index);
        await this.document.rollActionFull(index);
    }

    static async #onToggleAction(event, target) {
        const index = Number(target.dataset.index);
        const actions = foundry.utils.deepClone(this.document.system.actions ?? []);
        if (!actions[index]) return;
        actions[index].collapsed = !actions[index].collapsed;
        await this.document.update({ 'system.actions': actions });
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
        await this.document.update({ 'system.actions': actions });
    }

    static async #onRollHitDie(event, target) {
        if (typeof this.document.rollAndSetHitDie === 'function') {
            await this.document.rollAndSetHitDie();
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
