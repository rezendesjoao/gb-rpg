import { rollAttributeTest, rollActionPart, rollActionFull, rollHitDie } from '../dice/roll.mjs';
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

    /** Rola a parte de acerto ou dano de uma ação pela sua posição na lista. */
    async rollAction(index, part, mods = {}) {
        const action = this.system.actions?.[index];
        if (!action) return null;
        return rollActionPart(this, action, part, mods);
    }

    /** Rola a ação inteira (acerto + dano) pela sua posição na lista. */
    async rollActionFull(index, mods = {}) {
        const action = this.system.actions?.[index];
        if (!action) return null;
        return rollActionFull(this, action, mods);
    }

    /** Rola a ação inteira pelo nome (usado por macros da barra de atalhos). */
    async rollActionByName(name) {
        const index = this.system.actions?.findIndex((a) => a.name === name);
        if (index == null || index < 0) {
            ui.notifications?.warn(`${game.i18n.localize('GRANBLUE.Chat.actionNotFound')}: ${name}`);
            return null;
        }
        return this.rollActionFull(index);
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
