import { GRANBLUE } from './config.mjs';
import { useAction, rowActionType } from './use-action.mjs';
import { isActionAvailable, spendAction, resetActions } from './economy.mjs';
import { describeStatusEffect } from './effects.mjs';
import { rangeLabel } from './area.mjs';
import { sigilSVG } from './sigil.mjs';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * HUD de ações do Granblue, exibido só durante um combate: um painel fixo
 * acima da barra de macros com o token controlado. O destaque é a linha do
 * tempo do turno (movimentação → rápida → normal → bônus → reação, com a
 * conjunta e a total à parte, como exceções) e os atalhos de habilidades por
 * tipo de ação; abaixo, compactos, vida (com a vida temporária ajustável),
 * mana, CA, RD, deslocamento e visão.
 *
 * Mostra o token que o usuário controla e do qual é dono: o mestre troca de
 * HUD clicando nos tokens; o jogador só vê os seus. Sem token controlado, o
 * jogador vê o personagem atribuído a ele.
 *
 * O retrato leva dois anéis — vida por fora, mana por dentro — e as magias da
 * lista aparecem com o selo procedural (module/sigil.mjs).
 */
export class GranblueHUD extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: 'granblue-hud',
        tag: 'section',
        classes: ['granblue', 'gb-hud'],
        window: { frame: false, positioned: false },
        actions: {
            toggleType: GranblueHUD.#onToggleType,
            useEntry: GranblueHUD.#onUseEntry,
            spendOnly: GranblueHUD.#onSpendOnly,
            basicAttack: GranblueHUD.#onBasicAttack,
            resetTurn: GranblueHUD.#onResetTurn,
            manaPlus: GranblueHUD.#onManaPlus,
            step: GranblueHUD.#onStep,
            collapse: GranblueHUD.#onCollapse,
            openSheet: GranblueHUD.#onOpenSheet
        }
    };

    static PARTS = {
        main: { template: 'systems/granblue/templates/hud/action-hud.hbs' }
    };

    /** Ator exibido (do token controlado, ou o personagem do jogador). */
    actor = null;

    /** Token exibido (pode ser null quando é o personagem sem token na cena). */
    token = null;

    /** Tipo de ação com a lista de habilidades aberta (null = fechada). */
    openType = null;

    /** Painel recolhido: só o cabeçalho e os marcadores de ação. */
    collapsed = false;

    /* ---------------------------------- */
    /*  Quem aparece no HUD               */
    /* ---------------------------------- */

    /** O HUD está ligado nas configurações do cliente? */
    static get enabled() {
        return game.settings.get('granblue', 'showHud');
    }

    /** Atores que o HUD sabe mostrar. */
    static #supported(actor) {
        return !!actor && ['character', 'adversary'].includes(actor.type) && actor.isOwner;
    }

    /**
     * Escolhe o token/ator do HUD: o último token controlado do qual o usuário
     * é dono; para jogadores, sem nenhum, o personagem atribuído (e o token
     * dele na cena, se houver).
     */
    #pickSubject() {
        const controlled = (canvas.tokens?.controlled ?? []).filter((t) => GranblueHUD.#supported(t.actor));
        if (controlled.length) {
            const token = controlled[controlled.length - 1];
            return { token, actor: token.actor };
        }
        if (game.user.isGM) return { token: null, actor: null };
        const actor = game.user.character;
        if (!GranblueHUD.#supported(actor)) return { token: null, actor: null };
        const token = actor.getActiveTokens?.(true)?.[0] ?? null;
        return { token, actor: token?.actor ?? actor };
    }

    /** Há um combate em andamento (já iniciado) na cena vista? */
    static get inCombat() {
        return !!game.combat?.started;
    }

    /**
     * Atualiza o sujeito do HUD e redesenha — ou fecha, fora de combate ou
     * sem ninguém para mostrar.
     */
    refresh() {
        if (!GranblueHUD.enabled || !GranblueHUD.inCombat) {
            if (this.rendered) this.close();
            return;
        }
        const { token, actor } = this.#pickSubject();
        if (actor !== this.actor) this.openType = null;
        this.token = token;
        this.actor = actor;
        if (!actor) {
            if (this.rendered) this.close();
            return;
        }
        this.render({ force: true });
    }

    /** Redesenha só se o documento alterado é o do HUD. */
    refreshIfShowing(actor) {
        if (!this.rendered || !this.actor || !actor) return;
        if (actor === this.actor || actor.uuid === this.actor.uuid) this.render();
    }

    /* ---------------------------------- */
    /*  Posição no DOM                    */
    /* ---------------------------------- */

    /** Fica dentro de #ui-bottom, logo acima da barra de macros. */
    _insertElement(element) {
        const existing = document.getElementById(element.id);
        if (existing) return existing.replaceWith(element);
        const bottom = document.getElementById('ui-bottom');
        const hotbar = document.getElementById('hotbar');
        if (bottom && hotbar?.parentElement === bottom) bottom.insertBefore(element, hotbar);
        else (bottom ?? document.body).append(element);
    }

    /* ---------------------------------- */
    /*  Contexto                          */
    /* ---------------------------------- */

    async _prepareContext(options) {
        const actor = this.actor;
        if (!actor) return { empty: true };
        const sys = actor.system;
        const src = sys._source;
        const hp = sys.resources.hitPoints;
        const mana = sys.resources.mana;
        const classItem = actor.items.find((i) => i.type === 'class');

        const groups = this.#entriesByType();
        const economy = Object.entries(GRANBLUE.actionTypes).map(([key, cfg]) => ({
            key,
            label: game.i18n.localize(cfg.label),
            short: game.i18n.localize(cfg.short ?? cfg.label),
            icon: cfg.icon,
            available: isActionAvailable(actor, key),
            count: GranblueHUD.#segmentsFor(groups, key).reduce((n, seg) => n + seg.entries.length, 0),
            open: this.openType === key,
            composite: !!cfg.consumes
        }));
        // Linha do tempo do turno (ações simples, na ordem) e, à parte, as
        // exceções compostas (conjunta e total).
        const timeline = economy.filter((e) => !e.composite).map((e, i) => ({ ...e, step: i + 1 }));
        const specials = economy.filter((e) => e.composite);

        let open = null;
        if (this.openType) {
            open = {
                key: this.openType,
                label: game.i18n.localize(GRANBLUE.actionTypes[this.openType].label),
                icon: GRANBLUE.actionTypes[this.openType].icon,
                segments: GranblueHUD.#segmentsFor(groups, this.openType)
            };
        }

        const vision = String(sys.vision ?? '').trim();
        return {
            name: this.token?.name ?? actor.name,
            img: this.token?.document?.texture?.src || actor.img,
            subtitle: this.#subtitle(actor, classItem),
            collapsed: this.collapsed,
            // A vida em si muda pelo dano e pela cura das habilidades; o HUD só
            // ajusta a vida temporária.
            hp: {
                value: hp.value,
                max: hp.max,
                temp: src.resources.hitPoints.temp ?? 0,
                pct: GranblueHUD.#percent(hp.value, hp.max),
                low: hp.max > 0 && hp.value <= hp.max * 0.25
            },
            mana: {
                value: mana.value,
                max: mana.max,
                pct: GranblueHUD.#percent(mana.value, mana.max),
                condition: classItem?.system.manaCondition ?? ''
            },
            ca: { total: sys.defenses.ca, bonus: src.defenses.caBonus },
            rd: {
                physical: { total: sys.defenses.rd.physical.total, bonus: src.defenses.rd.physical.bonus },
                magical: { total: sys.defenses.rd.magical.total, bonus: src.defenses.rd.magical.bonus }
            },
            movement: {
                total: sys.movementTotal ?? (String(sys.movement ?? '').trim() || '—'),
                numeric: sys.movementTotal != null,
                bonus: src.movementBonus ?? 0
            },
            vision: vision ? (/^\d+([.,]\d+)?$/.test(vision) ? `${vision} m` : vision) : '—',
            timeline,
            specials,
            open,
            basic: this.#basicAttack()
        };
    }

    /**
     * Segmentos da lista de um tipo de ação, incluindo os tipos menores que ele
     * abrange (`includes`: a ação normal também mostra as ações rápidas). Cada
     * entrada de um tipo incluído ganha a etiqueta do tipo de origem.
     */
    static #segmentsFor(groups, type) {
        const own = groups[type] ?? [];
        const extra = GRANBLUE.actionTypes[type]?.includes ?? [];
        if (!extra.length) return own;
        const merged = own.map((seg) => ({ ...seg, entries: [...seg.entries] }));
        for (const sub of extra) {
            const via = game.i18n.localize(GRANBLUE.actionTypes[sub].label);
            for (const seg of groups[sub] ?? []) {
                let target = merged.find((s) => s.key === seg.key);
                if (!target) {
                    target = { ...seg, entries: [] };
                    merged.push(target);
                }
                target.entries.push(...seg.entries.map((e) => ({ ...e, via })));
            }
        }
        const order = ['actions', 'spells', 'class', 'heritage', 'inventory'];
        return merged.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
    }

    /** Percentual de 0 a 100 dos anéis de vida e mana. */
    static #percent(value, max) {
        if (!(max > 0)) return 0;
        return Math.max(0, Math.min(100, Math.round((value / max) * 100)));
    }

    /** Linha de baixo do nome: classe/herança ou o tipo de adversário. */
    #subtitle(actor, classItem) {
        const heritage = actor.items.find((i) => i.type === 'heritage');
        const parts = [classItem?.name, heritage?.name].filter(Boolean);
        if (!parts.length && actor.type === 'adversary') {
            parts.push(game.i18n.localize(GRANBLUE.adversaryKinds[actor.system.kind] ?? ''));
        }
        return parts.join(' · ');
    }

    /** O ataque básico marcado com a estrela, com o custo mínimo de uma ação normal. */
    #basicAttack() {
        for (const list of ['actions', 'spells']) {
            const rows = this.actor.system[list] ?? [];
            const index = rows.findIndex((r) => r.basicAttack && !r.passive);
            if (index < 0) continue;
            const own = rowActionType(rows[index]);
            const type = ['conjunta', 'total'].includes(own) ? own : 'normal';
            return {
                list,
                index,
                type,
                name: rows[index].name,
                typeLabel: game.i18n.localize(GRANBLUE.actionTypes[type].label),
                available: isActionAvailable(this.actor, type)
            };
        }
        return null;
    }

    /**
     * Todas as habilidades do ator agrupadas por tipo de ação e, dentro de
     * cada tipo, pelos segmentos do HUD (ações, magias, classe, herança,
     * inventário). Segmentos vazios não aparecem.
     */
    #entriesByType() {
        const actor = this.actor;
        const sys = actor.system;
        const out = {};
        const push = (type, segment, entry) => {
            if (!GRANBLUE.actionTypes[type]) return;
            out[type] ??= [];
            let seg = out[type].find((s) => s.key === segment);
            if (!seg) {
                seg = { key: segment, label: game.i18n.localize(`GRANBLUE.HUD.segment.${segment}`), entries: [] };
                out[type].push(seg);
            }
            seg.entries.push(entry);
        };

        for (const list of ['actions', 'spells']) {
            (sys[list] ?? []).forEach((row, index) => {
                push(rowActionType(row), list, GranblueHUD.#rowEntry(row, list, index));
            });
        }

        const classItem = actor.items.find((i) => i.type === 'class');
        (classItem?.system.abilities ?? []).forEach((ab, index) => {
            const type = ab.actionType
                || (ab.type === 'ativa' ? GRANBLUE.inferActionType(ab.description) || 'normal' : '');
            push(type, 'class', {
                source: 'class', index, name: ab.name, chips: [],
                icon: 'fa-solid fa-swords', useIcon: 'fa-comment',
                summary: GranblueHUD.#excerpt(ab.description)
            });
        });

        const heritage = actor.items.find((i) => i.type === 'heritage');
        if (heritage) {
            const traitText = GranblueHUD.#plainText(heritage.system.sharedTrait);
            const traitType = GRANBLUE.inferActionType(traitText);
            if (traitType) {
                push(traitType, 'heritage', {
                    source: 'heritage', feature: 'trait', index: 0,
                    name: game.i18n.localize('GRANBLUE.HUD.sharedTrait'), chips: [],
                    icon: 'fa-solid fa-dna', useIcon: 'fa-comment',
                    summary: GranblueHUD.#excerpt(traitText)
                });
            }
            (heritage.system.progress ?? []).forEach((p, index) => {
                const type = p.actionType || GRANBLUE.inferActionType(p.description);
                push(type, 'heritage', {
                    source: 'heritage', feature: 'progress', index, name: p.name,
                    chips: p.requirement ? [{ icon: 'fa-solid fa-lock-open', label: 'Requisito', value: p.requirement }] : [],
                    icon: 'fa-solid fa-dna', useIcon: 'fa-comment',
                    summary: GranblueHUD.#excerpt(p.description)
                });
            });
        }

        (sys.inventory ?? []).forEach((item, index) => {
            if (!item.actionType) return;
            push(item.actionType, 'inventory', {
                source: 'inventory', index, name: item.name,
                chips: [{ icon: 'fa-solid fa-hashtag', label: 'Quantidade', value: `×${item.quantity}` }],
                icon: GRANBLUE.itemCategoryIcons[item.category] ?? 'fa-solid fa-box-open', useIcon: 'fa-hand-sparkles',
                summary: GranblueHUD.#excerpt(item.description)
            });
        });

        // Ordem fixa dos segmentos
        const order = ['actions', 'spells', 'class', 'heritage', 'inventory'];
        for (const segs of Object.values(out)) segs.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
        return out;
    }

    /**
     * Entrada do HUD para uma ação/magia: custo, alcance, efeito, CD, acerto e
     * dano. A magia leva o selo procedural e a cor da esfera; a técnica, o
     * ícone do tipo de ação.
     */
    static #rowEntry(row, list, index) {
        const spell = list === 'spells';
        const chips = [];
        const add = (icon, label, value, cls = '') => {
            if (String(value ?? '').trim()) chips.push({ icon, label, value: String(value).trim(), cls });
        };
        add(spell ? 'fa-solid fa-droplet' : 'fa-solid fa-flask', 'Custo', row.cost, spell ? 'is-mana' : '');
        add('fa-solid fa-ruler', 'Alcance', rangeLabel(row));
        const status = describeStatusEffect(row.statusEffect);
        if (status) chips.push({ icon: 'fa-solid fa-wand-sparkles', label: 'Efeito aplicado', value: status.label, cls: 'is-fx' });
        const diff = String(row.difficulty ?? '').trim();
        add('fa-solid fa-bullseye', 'Dificuldade', /^\d+$/.test(diff) ? `CD ${diff}` : diff);
        add('fa-solid fa-crosshairs', 'Acerto', GRANBLUE.prettyFormula(row.hit));
        add('fa-solid fa-burst', spell ? 'Dano / Cura' : 'Dano', GRANBLUE.prettyFormula(row.damage), 'is-dmg');
        const sphere = spell ? GRANBLUE.normalizeSphere(row.sphere) : '';
        return {
            source: list,
            index,
            name: row.name,
            basic: !!row.basicAttack,
            passive: !!row.passive,
            sphere,
            sigil: sphere ? sigilSVG({ name: row.name, sphere, arcano: row.arcano, level: row.level, detail: 0 }) : '',
            icon: row.passive ? 'fa-solid fa-feather' : GRANBLUE.actionTypes[rowActionType(row)]?.icon ?? 'fa-solid fa-hand-fist',
            useIcon: row.passive ? 'fa-comment' : spell ? 'fa-wand-sparkles' : 'fa-dice-d20',
            chips,
            summary: GranblueHUD.#excerpt(row.effect || row.description)
        };
    }

    /** Texto puro de um campo HTML. */
    static #plainText(html) {
        if (!html) return '';
        return new DOMParser().parseFromString(String(html), 'text/html').body.textContent ?? '';
    }

    /** Primeiras palavras de um texto, para o resumo de uma entrada. */
    static #excerpt(text, max = 160) {
        const clean = String(text ?? '').replace(/\s+/g, ' ').trim();
        return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
    }

    /* ---------------------------------- */
    /*  Campos editáveis                  */
    /* ---------------------------------- */

    _onRender(context, options) {
        super._onRender?.(context, options);
        // Bônus digitados direto no campo (CA, RD, deslocamento)
        this.element.querySelectorAll('input[data-hud-field]').forEach((input) => {
            input.addEventListener('change', async () => {
                const value = Number(input.value);
                if (!Number.isFinite(value)) return;
                await this.actor?.update({ [input.dataset.hudField]: Math.trunc(value) });
            });
        });
    }

    /* ---------------------------------- */
    /*  Handlers                          */
    /* ---------------------------------- */

    /** Abre/fecha a lista de habilidades de um tipo de ação (só se disponível). */
    static #onToggleType(event, target) {
        const type = target.dataset.type;
        if (this.openType === type) this.openType = null;
        else if (isActionAvailable(this.actor, type)) this.openType = type;
        else return ui.notifications?.warn(game.i18n.format('GRANBLUE.HUD.unavailable', {
            type: game.i18n.localize(GRANBLUE.actionTypes[type]?.label ?? type)
        }));
        this.render();
    }

    /** Usa uma habilidade da lista aberta e gasta a ação do turno. */
    static async #onUseEntry(event, target) {
        const actor = this.actor;
        const type = this.openType;
        if (!actor || !type) return;
        const index = Number(target.dataset.index);
        let used = false;
        switch (target.dataset.source) {
            case 'actions':
            case 'spells':
                used = await useAction(actor, target.dataset.source, index);
                break;
            case 'class':
                used = !!(await actor.postClassAbility(index));
                break;
            case 'heritage':
                used = !!(await actor.postHeritageFeature(target.dataset.feature, index));
                break;
            case 'inventory':
                used = !!(await actor.postInventoryItem(index));
                break;
        }
        if (!used) return;
        this.openType = null;
        await spendAction(actor, type);
    }

    /** Gasta a ação aberta sem usar nenhuma habilidade (mover, esquivar…). */
    static async #onSpendOnly() {
        const type = this.openType;
        if (!this.actor || !type) return;
        this.openType = null;
        await spendAction(this.actor, type);
    }

    /** Rola o ataque básico (estrela) ao custo de uma ação normal. */
    static async #onBasicAttack() {
        const basic = this.#basicAttack();
        if (!basic) return;
        if (!basic.available) {
            return ui.notifications?.warn(game.i18n.format('GRANBLUE.HUD.unavailable', { type: basic.typeLabel }));
        }
        if (await useAction(this.actor, basic.list, basic.index)) await spendAction(this.actor, basic.type);
    }

    /** Libera todas as ações do turno. */
    static async #onResetTurn() {
        this.openType = null;
        await resetActions(this.actor);
        this.render();
    }

    /** +1 de Mana (condição de ganho de Mana da classe cumprida), até o máximo. */
    static async #onManaPlus() {
        const mana = this.actor?.system.resources.mana;
        if (!mana) return;
        if (mana.max > 0 && mana.value >= mana.max) {
            return ui.notifications?.info(game.i18n.localize('GRANBLUE.HUD.manaFull'));
        }
        await this.actor.update({ 'system.resources.mana.value': mana.value + 1 });
    }

    /** Botões −/+ da vida temporária e dos bônus (CA, RD física/mágica, deslocamento). */
    static async #onStep(event, target) {
        const path = target.dataset.field;
        const current = Number(foundry.utils.getProperty(this.actor?._source ?? {}, path)) || 0;
        await this.actor?.update({ [path]: current + (Number(target.dataset.delta) || 0) });
    }

    static #onCollapse() {
        this.collapsed = !this.collapsed;
        this.render();
    }

    static #onOpenSheet() {
        this.actor?.sheet?.render(true);
    }
}

/* -------------------------------------------- */
/*  Ligação com o Foundry                       */
/* -------------------------------------------- */

/** Instância única do HUD. */
let hud = null;

/** Configuração do cliente para ligar/desligar o HUD. */
export function registerHudSettings() {
    game.settings.register('granblue', 'showHud', {
        name: 'GRANBLUE.Settings.showHud.name',
        hint: 'GRANBLUE.Settings.showHud.hint',
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: () => hud?.refresh()
    });
}

/** Cria o HUD e liga os hooks que o mantêm em dia. */
export function initHud() {
    hud = new GranblueHUD();
    game.granblue.hud = hud;

    // Vários eventos chegam juntos (ex.: trocar de token = release + control).
    const refresh = foundry.utils.debounce(() => hud.refresh(), 30);
    Hooks.on('controlToken', refresh);
    Hooks.on('canvasReady', refresh);
    Hooks.on('deleteToken', refresh);

    const rerender = foundry.utils.debounce((actor) => hud.refreshIfShowing(actor), 30);
    Hooks.on('updateActor', (actor) => rerender(actor));
    Hooks.on('updateToken', (tokenDoc) => rerender(tokenDoc.actor));
    for (const hook of ['createActiveEffect', 'updateActiveEffect', 'deleteActiveEffect', 'createItem', 'updateItem', 'deleteItem']) {
        Hooks.on(hook, (doc) => rerender(doc.parent instanceof Actor ? doc.parent : doc.parent?.parent));
    }
    Hooks.on('updateUser', (user) => {
        if (user.isSelf) refresh();
    });
    // Só aparece durante o combate
    for (const hook of ['createCombat', 'updateCombat', 'deleteCombat', 'combatStart']) Hooks.on(hook, refresh);
    refresh();
}
