import { GRANBLUE } from '../config.mjs';
import { rollDialog } from '../dice/roll-dialog.mjs';
import { applyStatusToSelectedTokens } from '../effects.mjs';
import { sendLootDialog } from '../loot.mjs';
import { useAction, useActionPart } from '../use-action.mjs';
import { placeArea } from '../area.mjs';
import { GranblueItem } from '../documents/item.mjs';

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/** Listas do system gravadas pelo formulário (ver _processFormData). */
const FORM_LISTS = ['actions', 'spells', 'inventory', 'loot', 'advantages', 'disadvantages'];

/** Partial da linha de ação/magia, usado pelas fichas de personagem e adversário. */
export const ACTION_ROW_PARTIAL = 'systems/granblue/templates/actor/parts/action-row.hbs';

/** Partials compartilhados pelas fichas de personagem e adversário. */
export const SHEET_PARTIALS = [
    ACTION_ROW_PARTIAL,
    'systems/granblue/templates/actor/parts/range-fields.hbs',
    'systems/granblue/templates/actor/parts/defense-row.hbs',
    'systems/granblue/templates/actor/parts/magic-tab.hbs',
    'systems/granblue/templates/actor/parts/identity-tab.hbs',
    'systems/granblue/templates/actor/parts/class-heritage-select.hbs'
];

/** Monta os grupos de classe (optgroups) marcando a classe atual. */
function buildClassGroups(current) {
    const groups = {};
    for (const [key, cfg] of Object.entries(GRANBLUE.classes)) {
        const g = cfg.grupo;
        groups[g] ??= { key: g, label: game.i18n.localize(GRANBLUE.classGroups[g]), options: [] };
        groups[g].options.push({ value: key, label: cfg.label, selected: key === current });
    }
    return Object.values(groups);
}

/**
 * Ficha base de Ator do Granblue. Concentra os handlers de ação (rolagens,
 * edição de imagem, listas editáveis), a lógica de abas e o que personagem e
 * adversário compartilham (magias por esfera, classe e herança, RD).
 *
 * As listas editáveis (`system.actions`, `system.spells`, `system.inventory`)
 * usam os mesmos handlers: o botão informa a lista em `data-list`
 * (ausente = `actions`).
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
            postActionText: GranblueActorSheetBase.#onPostActionText,
            applyStatusEffect: GranblueActorSheetBase.#onApplyStatusEffect,
            toggleBasicAttack: GranblueActorSheetBase.#onToggleBasicAttack,
            placeArea: GranblueActorSheetBase.#onPlaceArea,
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
            deleteLoot: GranblueActorSheetBase.#onDeleteLoot,
            sendLoot: GranblueActorSheetBase.#onSendLoot,
            openEmbedded: GranblueActorSheetBase.#onOpenEmbedded,
            removeEmbedded: GranblueActorSheetBase.#onRemoveEmbedded,
            postFeature: GranblueActorSheetBase.#onPostFeature
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
    /*  Visão reduzida (jogador sem posse) */
    /* ---------------------------------- */

    /**
     * Quem não é mestre nem dono do ator vê apenas o cartão de identificação:
     * retrato grande, nome, classe, herança, rank e nível. É o que permite
     * liberar a ficha de um NPC/inimigo para os jogadores sem expor atributos,
     * ataques, magias, inventário, loot e anotações.
     */
    get isRestricted() {
        return !game.user.isGM && !this.document.isOwner;
    }

    /** Mesma checagem, no construtor — lá `this.document` ainda não existe. */
    static isRestrictedFor(document) {
        return !!document && !game.user.isGM && !document.isOwner;
    }

    /** @inheritDoc */
    _initializeApplicationOptions(options) {
        const opts = super._initializeApplicationOptions(options);
        if (!this.constructor.isRestrictedFor(options.document)) return opts;
        // Janela pequena e fixa: o cartão tem pouco conteúdo.
        opts.classes = [...opts.classes, 'gb-limited'];
        opts.position = { ...opts.position, width: 460, height: 'auto' };
        opts.window = { ...opts.window, resizable: false };
        return opts;
    }

    /** @inheritDoc */
    _configureRenderParts(options) {
        if (!this.isRestricted) return super._configureRenderParts(options);
        return { limited: { template: 'systems/granblue/templates/actor/limited.hbs', templates: [] } };
    }

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
            // Lista de status effects para o seletor "Efeito aplicado" das ações/magias
            statusEffectOptions: GRANBLUE.statusEffectOptions(),
            hp: sys.resources.hitPoints,
            hpSource: src.resources.hitPoints,
            mana: sys.resources.mana,
            ca: sys.defenses.ca,
            caBonus: src.defenses.caBonus,
            // RD física e mágica: os campos editam o valor guardado; o total já
            // inclui Active Effects
            rd: GranblueActorSheetBase.#rdContext(sys, src),
            movementTotal: sys.movementTotal,
            isGM: game.user.isGM,
            classItem,
            heritageItem,
            hasClass: !!classItem,
            // Cartão reduzido (limited.hbs): rótulos prontos para exibição
            restricted: this.isRestricted,
            classLabel: classItem?.name ?? '',
            heritageLabel: heritageItem?.name ?? '',
            // O personagem guarda a chave do rank ("d1"); o adversário, texto livre
            rankLabel: GRANBLUE.ranks[sys.rank]?.label ?? (sys.rank ?? ''),
            pointBuy: sys.pointBuy,
            // Seletores das linhas de ação/magia (ação no HUD, área, tipo de dano)
            ...GRANBLUE.rowSelectOptions()
        });

        // Classe e herança (personagem e adversário antagonista)
        const classOrigin = classItem?.system.origin ?? '';
        const heritageOrigin = heritageItem?.system.origin ?? '';
        Object.assign(context, {
            classBlankSelected: !classOrigin,
            classGroups: buildClassGroups(classOrigin),
            heritageBlankSelected: !heritageOrigin,
            heritageOptions: Object.entries(GRANBLUE.heritages).map(([key, cfg]) => ({
                value: key, label: cfg.label, selected: key === heritageOrigin
            })),
            classAbilities: classItem?.system.abilities ?? [],
            heritageProgress: heritageItem?.system.progress ?? []
        });

        // Esferas de magia: cada uma leva junto as suas magias (com o índice real
        // na lista `system.spells`, que é o que os handlers usam).
        if (Array.isArray(sys.spells)) {
            const spells = sys.spells.map((spell, index) => ({
                ...spell,
                index,
                sphereKey: GRANBLUE.normalizeSphere(spell.sphere)
            }));
            context.spheres = Object.entries(GRANBLUE.spheres).map(([key, cfg]) => ({
                key,
                label: game.i18n.localize(cfg.label),
                custo: cfg.custo,
                value: sys.spheres?.[key] ?? 0,
                unlocked: (sys.spheres?.[key] ?? 0) > 0,
                spells: spells.filter((s) => s.sphereKey === key)
            }));
            // Magias com esfera irreconhecível não somem da ficha: caem num grupo à parte.
            context.orphanSpells = spells.filter((s) => !s.sphereKey);
            context.sphereOptions = Object.entries(GRANBLUE.spheres).map(([key, cfg]) => ({
                value: key,
                label: game.i18n.localize(cfg.label)
            }));
            context.spherePoints = sys.spherePoints;
        }

        // Percentuais das barras de vida/mana (para o preenchimento visual)
        const hpMax = sys.resources.hitPoints.max || 0;
        const manaMax = sys.resources.mana.max || 0;
        context.hpPct = hpMax > 0 ? Math.max(0, Math.min(100, Math.round((sys.resources.hitPoints.value / hpMax) * 100))) : 0;
        context.manaPct = manaMax > 0 ? Math.max(0, Math.min(100, Math.round((sys.resources.mana.value / manaMax) * 100))) : 0;
        return context;
    }

    /**
     * RD física e mágica para a ficha: os campos fixa/bônus/temporária com o
     * valor guardado, o total preparado (com Active Effects) e se um efeito
     * está mexendo nela.
     */
    static #rdContext(sys, src) {
        const out = {};
        for (const key of ['physical', 'magical']) {
            const s = src.defenses.rd[key];
            const p = sys.defenses.rd[key];
            out[key] = {
                key,
                label: game.i18n.localize(key === 'physical' ? 'GRANBLUE.RD.physical' : 'GRANBLUE.RD.magical'),
                short: game.i18n.localize(key === 'physical' ? 'GRANBLUE.RD.physicalShort' : 'GRANBLUE.RD.magicalShort'),
                fixed: s.fixed,
                bonus: s.bonus,
                temp: s.temp,
                total: p.total,
                fromEffects: (p.fixed + p.bonus + p.temp) !== (s.fixed + s.bonus + s.temp)
            };
        }
        return out;
    }

    /**
     * O Foundry grava as listas (ações, magias, inventário, loot) inteiras a
     * partir do formulário: um campo que não está na tela voltaria ao valor
     * padrão. Aqui cada linha enviada é mesclada sobre a linha atual, então
     * campos escondidos — o acerto/dano de uma habilidade que virou passiva, os
     * detalhes de uma magia sem esfera — continuam guardados.
     */
    _processFormData(event, form, formData) {
        const data = super._processFormData(event, form, formData);
        const src = this.document.system._source;
        for (const list of FORM_LISTS) {
            const submitted = data.system?.[list];
            if (!submitted || typeof submitted !== 'object' || Array.isArray(submitted)) continue;
            const rows = foundry.utils.deepClone(src[list] ?? []);
            for (const [key, row] of Object.entries(submitted)) {
                const index = Number(key);
                if (!Number.isInteger(index) || index < 0) continue;
                // Listas de texto (vantagens) trocam o valor; as de objeto mesclam.
                if (row !== null && typeof row === 'object') {
                    if (rows[index]) Object.assign(rows[index], row);
                } else {
                    rows[index] = row;
                }
            }
            data.system[list] = rows;
        }
        return data;
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
            // Uma aba que sumiu (ex.: antagonista virou monstro) volta à padrão.
            if (!root.querySelector(`[data-tab-content="${tab}"]`)) tab = this.constructor.DEFAULT_TAB;
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

        // Seletores de classe / herança (criam o item a partir do preset)
        root.querySelectorAll('[data-gb-chooser]').forEach((sel) => {
            sel.addEventListener('change', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                const kind = sel.dataset.gbChooser;
                if (kind === 'class') this.#setClass(sel.value);
                else if (kind === 'heritage') this.#setHeritage(sel.value);
            });
        });

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
    /*  Classe e herança                  */
    /* ---------------------------------- */

    /** Substitui o item de Classe do ator pelo preset escolhido. */
    async #setClass(origin) {
        const existing = this.document.items.filter((i) => i.type === 'class').map((i) => i.id);
        if (existing.length) await this.document.deleteEmbeddedDocuments('Item', existing);
        if (origin) {
            const data = GranblueItem.presetClassData(origin);
            if (data) await this.document.createEmbeddedDocuments('Item', [data]);
        }
        await this.document.recalcMax();
    }

    /** Substitui o item de Herança do ator pelo preset escolhido. */
    async #setHeritage(origin) {
        const existing = this.document.items.filter((i) => i.type === 'heritage').map((i) => i.id);
        if (existing.length) await this.document.deleteEmbeddedDocuments('Item', existing);
        if (origin) {
            const data = GranblueItem.presetHeritageData(origin);
            if (data) await this.document.createEmbeddedDocuments('Item', [data]);
        }
    }

    /* ---------------------------------- */
    /*  Drop de itens (mecanismo nativo)   */
    /* ---------------------------------- */

    /**
     * Sobrescreve o drop de item do ActorSheetV2 (chamado uma única vez pelo core):
     * magia → aba Magia; classe/herança → substitui a existente; demais → padrão.
     */
    async _onDropItem(event, item) {
        if (item.type === 'spell') return this.#dropSpell(item);
        if (item.type === 'class') return this.#replaceEmbedded('class', item);
        if (item.type === 'heritage') return this.#replaceEmbedded('heritage', item);
        return super._onDropItem(event, item);
    }

    /**
     * Magia arrastada → entra na lista de magias, na esfera dela.
     * Atores sem a lista de magias continuam recebendo uma ação.
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

    /** Rola só o acerto ou só o dano (botões da linha expandida). */
    static async #onRollAction(event, target) {
        const list = GranblueActorSheetBase.#listOf(target);
        await useActionPart(this.document, list, Number(target.dataset.index), target.dataset.part);
    }

    /** Rola a ação/magia inteira: bônus, área (alcance complexo), acerto e dano. */
    static async #onRollActionFull(event, target) {
        const list = GranblueActorSheetBase.#listOf(target);
        await useAction(this.document, list, Number(target.dataset.index));
    }

    /** Envia ao chat a passiva (a própria habilidade passiva ou a anexada). */
    static async #onPostActionText(event, target) {
        const list = GranblueActorSheetBase.#listOf(target);
        await this.document.postActionText(Number(target.dataset.index), list, target.dataset.part || 'passive');
    }

    /** Aplica o status effect da ação/magia nos tokens selecionados (ou nos alvos). */
    static async #onApplyStatusEffect(event, target) {
        const list = GranblueActorSheetBase.#listOf(target);
        const index = Number(target.dataset.index);
        const action = (this.document.system[list] ?? [])[index];
        if (!action) return;
        await applyStatusToSelectedTokens(action.statusEffect);
    }

    /**
     * Marca/desmarca o ataque básico. Só um por ator: marcar uma ação desmarca
     * a anterior (nas ações e nas magias).
     */
    static async #onToggleBasicAttack(event, target) {
        const list = GranblueActorSheetBase.#listOf(target);
        const index = Number(target.dataset.index);
        const turnOn = !this.document.system[list]?.[index]?.basicAttack;
        const update = {};
        for (const name of ['actions', 'spells']) {
            if (!Array.isArray(this.document.system[name])) continue;
            const rows = this.#rows(name);
            rows.forEach((row, i) => { row.basicAttack = turnOn && name === list && i === index; });
            update[`system.${name}`] = rows;
        }
        await this.document.update(update);
    }

    /** Posiciona a área da ação no mapa e marca os tokens dentro dela como alvos. */
    static async #onPlaceArea(event, target) {
        const list = GranblueActorSheetBase.#listOf(target);
        const action = this.document.system[list]?.[Number(target.dataset.index)];
        if (!action) return;
        // Minimiza a ficha para liberar o mapa enquanto a área é posicionada.
        const wasMinimized = this.minimized;
        if (!wasMinimized) await this.minimize();
        try {
            await placeArea(this.document, action);
        } finally {
            if (!wasMinimized) await this.maximize();
        }
    }

    static #onToggleAction(event, target) {
        this.#toggleRow(GranblueActorSheetBase.#listOf(target), target);
    }

    static #onToggleInventory(event, target) {
        this.#toggleRow('inventory', target);
    }

    /** Cria uma ação; com `data-passive` no botão, já cria uma habilidade passiva. */
    static async #onAddAction(event, target) {
        const list = GranblueActorSheetBase.#listOf(target);
        const passive = target.dataset.passive === 'true';
        const rows = this.#rows(list);
        rows.push({
            name: game.i18n.localize(passive ? 'GRANBLUE.Action.newPassive' : 'GRANBLUE.Action.new'),
            hit: '', damage: '', cost: '', range: '', rangeMeters: null,
            casting: '', difficulty: '', statusEffect: '', effect: '', description: '',
            passive, hasPassive: false, passiveText: ''
        });
        // A passiva nova já abre, com o campo de texto à mostra.
        if (passive) this._expanded.add(`${list}:${rows.length - 1}`);
        await this.#saveRows(list, rows);
    }

    /** Cria uma magia já dentro da esfera do botão que foi clicado. */
    static async #onAddSpell(event, target) {
        const sphere = GRANBLUE.normalizeSphere(target.dataset.sphere) || 'energia';
        const rows = this.#rows('spells');
        rows.push({
            name: game.i18n.localize('GRANBLUE.Spell.new'),
            hit: '3d6 + @disciplina', damage: '', cost: '', range: '', rangeMeters: null,
            casting: '', difficulty: '', statusEffect: '', effect: '', description: '',
            passive: false, hasPassive: false, passiveText: '',
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
            weight: '', value: '', equipped: false, actionType: '', description: ''
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
        loot.push({ chance: '', item: '', quantity: '1', quality: 'normal' });
        await this.#saveRows('loot', loot);
    }

    static async #onDeleteLoot(event, target) {
        const index = Number(target.dataset.index);
        const loot = this.#rows('loot');
        loot.splice(index, 1);
        await this.#saveRows('loot', loot);
    }

    /** Mestre: envia o pop-up de rolagem de loot deste adversário aos jogadores. */
    static async #onSendLoot(event, target) {
        await sendLootDialog(this.document);
    }

    static async #onOpenEmbedded(event, target) {
        const id = target.dataset.itemId;
        this.document.items.get(id)?.sheet?.render(true);
    }

    static async #onRemoveEmbedded(event, target) {
        const id = target.dataset.itemId;
        if (id) await this.document.deleteEmbeddedDocuments('Item', [id]);
    }

    /**
     * Mostra no chat o que uma habilidade de classe, um traço de herança ou uma
     * vantagem/desvantagem do adversário faz (botões de chat da ficha).
     */
    static async #onPostFeature(event, target) {
        const actor = this.document;
        const index = Number(target.dataset.index) || 0;
        switch (target.dataset.feature) {
            case 'ability': return actor.postClassAbility(index);
            case 'trait':
            case 'weakness':
            case 'progress': return actor.postHeritageFeature(target.dataset.feature, index);
            case 'advantages':
            case 'disadvantages': return actor.postAdvantage(target.dataset.feature, index);
        }
    }
}
