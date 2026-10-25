import { hydrateCard } from '../sigil.mjs';

/**
 * Diálogo de rolagem: coleta bônus situacionais (e dados extras) antes de rolar.
 * Usado por testes de atributo e por ações (acerto e/ou dano).
 *
 * @param {object} cfg
 * @param {string} cfg.title
 * @param {Array<{key:string,label:string,base:string}>} cfg.parts  seções (ex.: acerto/dano)
 * @param {boolean} [cfg.mana]  exibe a opção "Teste de Mana"
 * @param {number|null} [cfg.consume]  se número, exibe a opção de consumir custo (Vida/Mana)
 * @param {object} [cfg.header]  cabeçalho opcional: { kicker, icon, sigil, sphere } — a
 *                               magia mostra o selo ({ name, arcano, level }) na cor da
 *                               esfera; o conteúdo do diálogo é limpo pelo Foundry, então
 *                               o SVG é desenhado depois de abrir (ver hydrateCard)
 * @returns {Promise<object|null>}  { [key]:{bonus,dice}, mana, consume } ou null (cancelado)
 */
export async function rollDialog({ title, parts = [], mana = false, consume = null, header = null }) {
    // Sem seções (ação sem fórmula) e sem consumo → segue direto, sem diálogo.
    if (!parts.length && consume === null) return {};

    const { DialogV2 } = foundry.applications.api;
    const esc = foundry.utils.escapeHTML;
    const PART_ICONS = { hit: 'fa-crosshairs', damage: 'fa-burst', main: 'fa-dice-d6' };

    const head = header ? `
        <header class="gb-rd-head"${header.sphere ? ` data-sphere="${esc(header.sphere)}"` : ''}>
            ${header.sigil
        ? `<span class="gb-sigil gb-sigil--live gb-rd-sigil" data-gb-sigil="1" data-sphere="${esc(header.sphere ?? '')}"
                data-sigil-name="${esc(header.sigil.name ?? '')}" data-sigil-arcano="${esc(header.sigil.arcano ?? '')}"
                data-sigil-level="${esc(String(header.sigil.level ?? 1))}"></span>`
        : `<span class="gb-rd-emblem"><i class="${esc(header.icon ?? 'fa-solid fa-dice-d20')}"></i></span>`}
            <div class="gb-rd-titles">
                ${header.kicker ? `<span class="gb-kicker">${esc(header.kicker)}</span>` : ''}
                <strong>${esc(title)}</strong>
            </div>
        </header>` : '';

    const rows = parts.map((p) => `
        <section class="gb-rd-part gb-rd-part--${esc(p.key)}">
            <div class="gb-rd-part-head">
                <span class="gb-rd-name"><i class="fa-solid ${PART_ICONS[p.key] ?? 'fa-dice-d20'}"></i> ${esc(p.label)}</span>
                <code class="gb-rd-base">${esc(p.base)}</code>
            </div>
            <div class="gb-rd-fields">
                <div class="gb-field">
                    <span>Bônus situacional</span>
                    <div class="gb-rd-stepper">
                        <button type="button" data-gb-step="-1" aria-label="−1"><i class="fa-solid fa-minus"></i></button>
                        <input type="number" name="${esc(p.key)}.bonus" value="0" step="1" autofocus>
                        <button type="button" data-gb-step="1" aria-label="+1"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
                <label class="gb-field">
                    <span>Dados extras</span>
                    <input type="text" name="${esc(p.key)}.dice" placeholder="ex.: 1d6">
                </label>
            </div>
        </section>`).join('');

    const manaRow = mana
        ? `<label class="gb-switch gb-rd-mana"><input type="checkbox" name="mana"><span class="gb-switch-track"></span>
               <i class="fa-solid fa-droplet"></i> Teste de Mana <small>+5 na CD</small></label>`
        : '';

    const consumeRow = consume !== null
        ? `<section class="gb-rd-consume">
                <span class="gb-rd-name"><i class="fa-solid fa-flask"></i> Consumir custo</span>
                <div class="gb-rd-consume-fields">
                    <select name="consume.resource">
                        <option value="none" selected>Não consumir</option>
                        <option value="hitPoints">Vida</option>
                        <option value="mana">Mana</option>
                    </select>
                    <input type="number" name="consume.amount" value="${Number(consume) || 0}" step="1" aria-label="Quantidade a consumir">
                </div>
           </section>`
        : '';

    const content = `
        <div class="granblue gb-roll-dialog">
            ${head}
            ${rows}
            ${consumeRow}
            ${manaRow}
            <p class="gb-rd-hint">Deixe 0 / em branco para rolar sem modificadores. <strong>Enter</strong> rola.</p>
        </div>`;

    const result = await DialogV2.wait({
        window: { title, icon: 'fa-solid fa-dice-d20' },
        classes: ['granblue', 'themed', 'theme-light', 'gb-dialog'],
        position: { width: 420 },
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
        // O selo do cabeçalho e os botões −/+ do bônus situacional
        render: (event, dialog) => {
            hydrateCard(dialog.element);
            dialog.element.querySelectorAll('[data-gb-step]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const input = btn.parentElement.querySelector('input');
                    input.value = (Number(input.value) || 0) + Number(btn.dataset.gbStep);
                });
            });
        },
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
    if (consume !== null) {
        out.consume = {
            resource: data.consume?.resource ?? 'none',
            amount: Number(data.consume?.amount) || 0
        };
    }
    return out;
}
