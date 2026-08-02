import { GRANBLUE } from '../config.mjs';

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

/** Modelos de linha padrão para cada lista editável. */
const ROW_DEFAULTS = {
    abilities: { name: 'Habilidade', type: 'passiva', description: '' },
    progress: { name: 'Progresso', requirement: '', description: '' }
};

/**
 * Ficha base dos itens do Granblue (Classe e Herança).
 */
export class GranblueItemSheetBase extends HandlebarsApplicationMixin(ItemSheetV2) {
    static DEFAULT_OPTIONS = {
        classes: ['granblue', 'sheet', 'item'],
        position: { width: 560, height: 660 },
        window: { resizable: true },
        form: { submitOnChange: true },
        actions: {
            editImage: GranblueItemSheetBase.#onEditImage,
            addRow: GranblueItemSheetBase.#onAddRow,
            deleteRow: GranblueItemSheetBase.#onDeleteRow
        }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        Object.assign(context, {
            item: this.document,
            system: this.document.system,
            config: GRANBLUE,
            editable: this.isEditable
        });
        return context;
    }

    static async #onEditImage(event, target) {
        if (!this.isEditable) return;
        const attr = target.dataset.edit ?? 'img';
        const current = foundry.utils.getProperty(this.document, attr);
        const FP = foundry.applications.apps.FilePicker?.implementation ?? globalThis.FilePicker;
        const fp = new FP({ type: 'image', current, callback: (path) => this.document.update({ [attr]: path }) });
        return fp.browse();
    }

    static async #onAddRow(event, target) {
        const path = target.dataset.array;          // ex.: "system.abilities"
        const kind = target.dataset.kind;           // ex.: "abilities"
        const list = foundry.utils.deepClone(foundry.utils.getProperty(this.document, path) ?? []);
        list.push(foundry.utils.deepClone(ROW_DEFAULTS[kind] ?? {}));
        await this.document.update({ [path]: list });
    }

    static async #onDeleteRow(event, target) {
        const path = target.dataset.array;
        const index = Number(target.dataset.index);
        const list = foundry.utils.deepClone(foundry.utils.getProperty(this.document, path) ?? []);
        list.splice(index, 1);
        await this.document.update({ [path]: list });
    }
}
