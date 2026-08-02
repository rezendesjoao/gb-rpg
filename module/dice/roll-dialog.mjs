/**
 * Diálogo de rolagem: coleta bônus situacionais (e dados extras) antes de rolar.
 * Usado por testes de atributo e por ações (acerto e/ou dano).
 *
 * @param {object} cfg
 * @param {string} cfg.title
 * @param {Array<{key:string,label:string,base:string}>} cfg.parts  seções (ex.: acerto/dano)
 * @param {boolean} [cfg.mana]  exibe a opção "Teste de Mana"
 * @returns {Promise<object|null>}  { [key]:{bonus,dice}, mana } ou null (cancelado)
 */
export async function rollDialog({ title, parts = [], mana = false }) {
    // Sem seções (ação sem fórmula) → segue direto, sem diálogo.
    if (!parts.length) return {};

    const { DialogV2 } = foundry.applications.api;

    const rows = parts.map((p) => `
        <div class="gb-rd-part">
            <div class="gb-rd-head">
                <span class="gb-rd-name">${p.label}</span>
                <code class="gb-rd-base">${p.base}</code>
            </div>
            <div class="gb-rd-fields">
                <label class="gb-rd-field">
                    <span>Bônus situacional</span>
                    <input type="number" name="${p.key}.bonus" value="0" step="1" autofocus>
                </label>
                <label class="gb-rd-field">
                    <span>Dados extras</span>
                    <input type="text" name="${p.key}.dice" placeholder="ex.: 1d6">
                </label>
            </div>
        </div>`).join('');

    const manaRow = mana
        ? `<label class="gb-rd-check"><input type="checkbox" name="mana"> <i class="fa-solid fa-droplet"></i> Teste de Mana (+5 na DC)</label>`
        : '';

    const content = `
        <div class="granblue gb-roll-dialog">
            ${rows}
            ${manaRow}
            <p class="gb-rd-hint">Deixe 0 / em branco para rolar sem modificadores. Pressione <strong>Enter</strong> para rolar.</p>
        </div>`;

    const result = await DialogV2.wait({
        window: { title, icon: 'fa-solid fa-dice-d20' },
        classes: ['granblue', 'gb-dialog'],
        position: { width: 400 },
        content,
        buttons: [
            {
                action: 'roll',
                label: 'Rolar',
                icon: 'fa-solid fa-dice-d20',
                default: true,
                callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object
            },
            { action: 'cancel', label: 'Cancelar', icon: 'fa-solid fa-xmark' }
        ],
        rejectClose: false
    });

    // Cancelado / fechado.
    if (!result || typeof result !== 'object') return null;

    const data = foundry.utils.expandObject(result);
    const out = { mana: !!data.mana };
    for (const p of parts) {
        out[p.key] = {
            bonus: Number(data[p.key]?.bonus) || 0,
            dice: String(data[p.key]?.dice ?? '').trim()
        };
    }
    return out;
}
