import { GRANBLUE } from '../config.mjs';

/**
 * Documento Item do Granblue.
 * Para itens de Classe e Herança, mantém um Active Effect auto-gerado que
 * aplica automaticamente os bônus no ator dono (transfer: true).
 */
export class GranblueItem extends Item {
    /* ------------------------------------------------ */
    /*  Sincronização automática de Active Effects       */
    /* ------------------------------------------------ */

    async _onCreate(data, options, userId) {
        await super._onCreate(data, options, userId);
        if (game.user.id !== userId) return;
        if (this.type === 'class' || this.type === 'heritage') await this.syncAutoEffect();
    }

    async _onUpdate(changed, options, userId) {
        await super._onUpdate(changed, options, userId);
        if (game.user.id !== userId) return;
        const touchedHeritage = this.type === 'heritage' && foundry.utils.hasProperty(changed, 'system.bonuses');
        const touchedClass = this.type === 'class' && foundry.utils.hasProperty(changed, 'system.vidaBase');
        if (touchedHeritage || touchedClass) await this.syncAutoEffect();
    }

    /** Constrói a lista de `changes` do Active Effect a partir dos dados do item. */
    buildAutoChanges() {
        const MODES = CONST.ACTIVE_EFFECT_MODES;
        if (this.type === 'heritage') {
            return Object.entries(this.system.bonuses ?? {})
                .filter(([, value]) => Number(value) !== 0)
                .map(([key, value]) => ({
                    key: `system.attributes.${key}.bonus`,
                    mode: MODES.ADD,
                    value: String(value)
                }));
        }
        if (this.type === 'class') {
            return [{
                key: 'system.resources.hitPoints.base',
                mode: MODES.OVERRIDE,
                value: String(this.system.vidaBase ?? 40)
            }];
        }
        return [];
    }

    /** Cria ou atualiza o Active Effect auto-gerenciado deste item. */
    async syncAutoEffect() {
        const changes = this.buildAutoChanges();
        const existing = this.effects.find((e) => e.getFlag('granblue', 'auto'));

        if (!changes.length) {
            if (existing) await existing.delete();
            return;
        }

        if (existing) {
            await existing.update({ changes });
            return;
        }

        await this.createEmbeddedDocuments('ActiveEffect', [{
            name: this.type === 'heritage'
                ? game.i18n.localize('GRANBLUE.Heritage.effectName')
                : game.i18n.localize('GRANBLUE.Class.effectName'),
            img: this.img,
            changes,
            transfer: true,
            disabled: false,
            flags: { granblue: { auto: true } }
        }]);
    }

    /* ------------------------------------------------ */
    /*  Presets (dados para criar a partir do config)    */
    /* ------------------------------------------------ */

    /** Dados de criação de um item de Classe a partir de uma chave do config. */
    static presetClassData(key) {
        const c = GRANBLUE.classes[key];
        if (!c) return null;
        return {
            name: c.label,
            type: 'class',
            system: {
                origin: key,
                grupo: c.grupo,
                vidaBase: c.vidaBase,
                vidaDado: c.vidaDado,
                danoDado: c.danoDado,
                manaCondition: c.mana ?? '',
                weapons: c.weapons ?? ''
            }
        };
    }

    /** Dados de criação de um item de Herança a partir de uma chave do config. */
    static presetHeritageData(key) {
        const h = GRANBLUE.heritages[key];
        if (!h) return null;
        const bonuses = {};
        for (const [attr, val] of Object.entries(h.bonus ?? {})) bonuses[attr] = val;
        return {
            name: h.label,
            type: 'heritage',
            system: { origin: key, bonuses }
        };
    }
}
