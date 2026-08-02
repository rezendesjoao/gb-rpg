import { rollAttributeTest, rollActionPart, rollHitDie } from '../dice/roll.mjs';
import { GRANBLUE } from '../config.mjs';

/**
 * Classe de documento Actor do Granblue.
 * Expõe métodos de rolagem reutilizáveis (ficha e macros).
 */
export class GranblueActor extends Actor {
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
    async rollAction(index, part) {
        const action = this.system.actions?.[index];
        if (!action) return null;
        return rollActionPart(this, action, part);
    }

    /**
     * Rola o dado de vida (da classe, se conhecida) e grava o resultado
     * em resources.hitPoints.die.
     */
    async rollAndSetHitDie() {
        const classKey = this.system.classe;
        const dieFormula = GRANBLUE.classes[classKey]?.vidaDado ?? '2d6';
        const total = await rollHitDie(this, dieFormula);
        await this.update({ 'system.resources.hitPoints.die': total });
        return total;
    }
}
