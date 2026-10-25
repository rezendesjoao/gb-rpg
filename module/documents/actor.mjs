import { rollAttributeTest, rollActionPart, rollActionFull, rollHitDie } from '../dice/roll.mjs';
import { postDescriptionCard } from '../chat.mjs';
import { GRANBLUE } from '../config.mjs';

/**
 * Classe de documento Actor do Granblue.
 * Expõe métodos de rolagem reutilizáveis (ficha e macros).
 */
export class GranblueActor extends Actor {
    /** Define barras e vínculo do token padrão ao criar o ator. */
    async _preCreate(data, options, user) {
        const allowed = await super._preCreate(data, options, user);
        if (allowed === false) return false;
        const proto = {
            prototypeToken: {
                bar1: { attribute: 'resources.hitPoints' },
                bar2: { attribute: 'resources.mana' },
                displayBars: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
            }
        };
        if (this.type === 'character') {
            proto.prototypeToken.actorLink = true;
            proto.prototypeToken.displayName = CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER;
        }
        this.updateSource(proto);
    }

    /**
     * Recalcula Vida e Mana máximas pela fórmula do sistema:
     *   Vida = base (da classe) + Resiliência×3 + dado de vida + vida temp
     *   Mana = Sabedoria×2
     * O máximo é um campo editável; este método apenas aplica a fórmula.
     */
    async recalcMax() {
        const classItem = this.items.find((i) => i.type === 'class');
        const hp = this.system.resources.hitPoints;
        const base = classItem?.system.vidaBase ?? hp.base ?? 0;
        const res = this.system.attributes.resiliencia.total ?? 0;
        const hpMax = base + res * 3 + (hp.die ?? 0) + (hp.temp ?? 0);
        const manaMax = (this.system.attributes.sabedoria.total ?? 0) * 2;
        return this.update({
            'system.resources.hitPoints.base': base,
            'system.resources.hitPoints.max': hpMax,
            'system.resources.mana.max': manaMax
        });
    }

    /**
     * Mescla os dados de rolagem do documento com os atalhos do data model
     * (@forca, @precisao, ...), para que fórmulas de ação e iniciativa funcionem.
     */
    getRollData() {
        const base = super.getRollData();
        const systemData = typeof this.system.getRollData === 'function' ? this.system.getRollData() : {};
        return { ...base, ...systemData };
    }

    /** Rola um teste de atributo (3d6 + atributo). */
    async rollAttribute(attrKey, options = {}) {
        return rollAttributeTest(this, attrKey, options);
    }

    /** Lista de entradas roláveis: ações (padrão) ou magias. */
    actionList(list = 'actions') {
        return (list === 'spells' ? this.system.spells : this.system.actions) ?? [];
    }

    /** Rola a parte de acerto ou dano de uma ação/magia pela sua posição na lista. */
    async rollAction(index, part, mods = {}, list = 'actions') {
        const action = this.actionList(list)[index];
        if (!action) return null;
        return rollActionPart(this, action, part, mods);
    }

    /**
     * Rola a ação/magia inteira (acerto + dano) pela sua posição na lista.
     * Uma habilidade passiva não rola: manda a descrição para o chat.
     */
    async rollActionFull(index, mods = {}, list = 'actions') {
        const action = this.actionList(list)[index];
        if (!action) return null;
        if (action.passive) return this.postActionText(index, list, 'passive');
        return rollActionFull(this, action, mods);
    }

    /**
     * Envia ao chat o texto de uma habilidade/magia: `passive` = a própria
     * habilidade passiva (sua descrição); `attached` = a passiva anexada a uma
     * habilidade ativa (`passiveText`).
     */
    async postActionText(index, list = 'actions', part = 'passive') {
        const action = this.actionList(list)[index];
        if (!action) return null;
        const isSpell = list === 'spells';
        const kind = game.i18n.localize(isSpell ? 'GRANBLUE.Chat.passiveSpell' : 'GRANBLUE.Chat.passiveAbility');
        const sphere = GRANBLUE.normalizeSphere(action.sphere);
        const subtitle = [
            part === 'attached' ? game.i18n.localize('GRANBLUE.Chat.attachedPassive') : kind,
            sphere ? game.i18n.localize(GRANBLUE.spheres[sphere].label) : ''
        ].filter(Boolean).join(' · ');
        return postDescriptionCard(this, {
            title: action.name,
            subtitle,
            icon: 'fa-solid fa-feather',
            kind: 'passive',
            sphere,
            sigil: sphere ? { name: action.name, arcano: action.arcano ?? '', level: action.level ?? 1 } : null,
            text: part === 'attached' ? action.passiveText : action.description
        });
    }

    /**
     * Mostra no chat o que uma habilidade de classe faz (aba Classe & Herança
     * e HUD). Devolve a mensagem, ou null se a habilidade não existe.
     */
    async postClassAbility(index) {
        const classItem = this.items.find((i) => i.type === 'class');
        const ab = classItem?.system.abilities?.[index];
        if (!ab) return null;
        const kind = ab.type === 'ativa' ? 'Habilidade ativa' : 'Habilidade passiva';
        return postDescriptionCard(this, {
            title: ab.name,
            subtitle: `${classItem.name} · ${kind}`,
            icon: 'fa-solid fa-swords',
            kind: 'class',
            text: ab.description
        });
    }

    /**
     * Mostra no chat um traço da herança: `trait` (traço compartilhado),
     * `weakness` (debilidade) ou `progress` (o progresso de índice `index`).
     */
    async postHeritageFeature(feature, index = 0) {
        const heritage = this.items.find((i) => i.type === 'heritage');
        if (!heritage) return null;
        if (feature === 'progress') {
            const p = heritage.system.progress?.[index];
            if (!p) return null;
            return postDescriptionCard(this, {
                title: p.name,
                subtitle: [heritage.name, p.requirement].filter(Boolean).join(' · '),
                icon: 'fa-solid fa-dna',
                kind: 'heritage',
                text: p.description
            });
        }
        const isTrait = feature === 'trait';
        const { TextEditor } = foundry.applications.ux;
        const html = await TextEditor.implementation.enrichHTML(
            isTrait ? heritage.system.sharedTrait : heritage.system.weakness,
            { rollData: this.getRollData(), relativeTo: heritage }
        );
        return postDescriptionCard(this, {
            title: isTrait ? 'Traço Compartilhado' : 'Debilidade',
            subtitle: heritage.name,
            icon: isTrait ? 'fa-solid fa-dna' : 'fa-solid fa-heart-crack',
            kind: isTrait ? 'heritage' : 'weakness',
            html
        });
    }

    /** Mostra no chat um item do inventário (uso pelo HUD). */
    async postInventoryItem(index) {
        const item = this.system.inventory?.[index];
        if (!item) return null;
        const category = game.i18n.localize(GRANBLUE.itemCategories[item.category] ?? GRANBLUE.itemCategories.outros);
        return postDescriptionCard(this, {
            title: item.name,
            subtitle: [category, item.quality ? game.i18n.localize(GRANBLUE.itemQualities[item.quality] ?? item.quality) : '']
                .filter(Boolean).join(' · '),
            icon: GRANBLUE.itemCategoryIcons[item.category] ?? 'fa-solid fa-bag-shopping',
            kind: 'item',
            text: item.description
        });
    }

    /**
     * Mostra no chat uma das vantagens (`advantages`) ou desvantagens
     * (`disadvantages`) do adversário, pela caixa `index`.
     */
    async postAdvantage(list, index) {
        const text = String(this.system[list]?.[index] ?? '').trim();
        if (!text) {
            ui.notifications?.warn(game.i18n.localize('GRANBLUE.Adversary.emptyAdvantage'));
            return null;
        }
        const isAdvantage = list === 'advantages';
        return postDescriptionCard(this, {
            title: game.i18n.localize(isAdvantage ? 'GRANBLUE.Adversary.advantage' : 'GRANBLUE.Adversary.disadvantage'),
            subtitle: this.name,
            icon: isAdvantage ? 'fa-solid fa-circle-plus' : 'fa-solid fa-circle-minus',
            kind: isAdvantage ? 'advantage' : 'disadvantage',
            text
        });
    }

    /* ---------------------------------- */
    /*  Dano e cura                        */
    /* ---------------------------------- */

    /**
     * Aplica dano na Energia Vital abatendo a Redução de Dano (RD) do tipo do
     * dano: `type` "magico" usa a RD mágica, qualquer outro a física.
     * `ignoreRD` = dano verdadeiro. Devolve { raw, rd, taken, type }.
     */
    async applyDamage(amount, { ignoreRD = false, type = 'fisico' } = {}) {
        const raw = Math.max(0, Math.floor(Number(amount) || 0));
        const part = type === 'magico' ? 'magical' : 'physical';
        const rd = ignoreRD ? 0 : Math.max(0, Number(this.system.defenses?.rd?.[part]?.total) || 0);
        const taken = Math.max(0, raw - rd);
        const hp = this.system.resources.hitPoints;
        if (taken) await this.update({ 'system.resources.hitPoints.value': hp.value - taken });
        return { raw, rd, taken, type: part === 'magical' ? 'magico' : 'fisico' };
    }

    /** Cura a Energia Vital até o máximo (nunca reduz a vida atual). Devolve { healed }. */
    async applyHealing(amount) {
        const heal = Math.max(0, Math.floor(Number(amount) || 0));
        const hp = this.system.resources.hitPoints;
        const value = Math.max(hp.value, Math.min(hp.max ?? 0, hp.value + heal));
        if (value !== hp.value) await this.update({ 'system.resources.hitPoints.value': value });
        return { healed: value - hp.value };
    }

    /** Consome uma quantidade de um recurso (vida ou mana), sem passar de 0 abaixo. */
    async spendResource(resource, amount) {
        const amt = Number(amount) || 0;
        if (amt <= 0) return;
        const key = resource === 'mana' ? 'mana' : 'hitPoints';
        const current = this.system.resources?.[key]?.value ?? 0;
        await this.update({ [`system.resources.${key}.value`]: current - amt });
    }

    /**
     * Rola a ação/magia inteira pelo nome (usado por macros da barra de atalhos).
     * Procura primeiro nas ações e depois nas magias. Passivas vão para o chat.
     */
    async rollActionByName(name) {
        for (const list of ['actions', 'spells']) {
            const index = this.actionList(list).findIndex((a) => a.name === name);
            if (index >= 0) return this.rollActionFull(index, {}, list);
        }
        ui.notifications?.warn(`${game.i18n.localize('GRANBLUE.Chat.actionNotFound')}: ${name}`);
        return null;
    }

    /**
     * Rola o dado de vida (da classe, se conhecida) e grava o resultado
     * em resources.hitPoints.die.
     */
    async rollAndSetHitDie() {
        const classItem = this.items.find((i) => i.type === 'class');
        const dieFormula = classItem?.system.vidaDado || GRANBLUE.classes[this.system.classe]?.vidaDado || '2d6';
        const total = await rollHitDie(this, dieFormula);
        await this.update({ 'system.resources.hitPoints.die': total });
        await this.recalcMax();
        return total;
    }
}
