import { GRANBLUE } from '../config.mjs';

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

/** Modelos de linha padrão para cada lista editável. */
const ROW_DEFAULTS = {
    abilities: { name: 'Habilidade', type: 'passiva', actionType: '', description: '' },
    progress: { name: 'Progresso', requirement: '', actionType: '', description: '' }
};

/**
 * Ficha base dos itens do Granblue (Classe, Herança e Magia). Os campos HTML
 * listados em `HTML_FIELDS` viram editores de texto rico (`<prose-mirror>`)
 * que mostram o texto formatado e abrem o editor no lápis.
 */
export class GranblueItemSheetBase extends HandlebarsApplicationMixin(ItemSheetV2) {
    /** Campos HTML do `system` editados com o editor de texto rico. */
    static HTML_FIELDS = [];

    static DEFAULT_OPTIONS = {
        // O visual é claro: 'theme-light' faz o editor e os menus nativos do Foundry seguirem.
        classes: ['granblue', 'themed', 'theme-light', 'sheet', 'item'],
        position: { width: 580, height: 720 },
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
            editable: this.isEditable,
            // Seletores de "Ação no HUD", forma da área e tipo de dano
            ...GRANBLUE.rowSelectOptions()
        });
        // Texto formatado dos campos HTML (o que o editor mostra fechado)
        const { TextEditor } = foundry.applications.ux;
        context.enriched = {};
        for (const field of this.constructor.HTML_FIELDS) {
            context.enriched[field] = await TextEditor.implementation.enrichHTML(
                foundry.utils.getProperty(this.document.system, field) ?? '',
                { relativeTo: this.document, secrets: this.document.isOwner }
            );
        }
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
