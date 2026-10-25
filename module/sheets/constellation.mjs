/**
 * Constelação de atributos: o gráfico de nove pontas da aba de atributos.
 * Cada eixo é um atributo — os da Mente ficam num setor azulado — e o
 * polígono dourado mostra a forma da build. A escala acompanha o maior total
 * (de 5 em 5), para uma ficha recém-criada não virar um pontinho.
 *
 * Recebe os atributos já preparados pela ficha ({ abbr, total, group }) e
 * devolve o `<svg>` como texto, sem ids, pintado por styles/sheet.css.
 */

const R = 70;

/** Ponto no raio `r` do eixo `i` de `count` (eixo 0 no topo, sentido horário). */
function axisPoint(r, i, count) {
    const t = ((i * 360) / count - 90) * (Math.PI / 180);
    return [Math.round(r * Math.cos(t) * 100) / 100, Math.round(r * Math.sin(t) * 100) / 100];
}

const pts = (list) => list.map(([x, y]) => `${x},${y}`).join(' ');

export function constellationSVG(attributes) {
    const count = attributes.length;
    if (!count) return '';
    const highest = Math.max(...attributes.map((a) => Number(a.total) || 0));
    const top = Math.max(5, Math.ceil(highest / 5) * 5);

    // Grade: três anéis de nove lados e os eixos.
    let grid = '';
    for (const f of [1 / 3, 2 / 3, 1]) {
        grid += `<polygon class="gb-cst-ring" points="${pts(attributes.map((_, i) => axisPoint(R * f, i, count)))}"/>`;
    }
    let axes = '';
    attributes.forEach((_, i) => {
        const [x, y] = axisPoint(R, i, count);
        axes += `M0 0L${x} ${y}`;
    });

    // Setor da Mente: a fatia que cobre os atributos mágicos.
    const mind = attributes.map((a, i) => (a.group === 'mente' ? i : -1)).filter((i) => i >= 0);
    let sector = '';
    if (mind.length) {
        const from = mind[0] - 0.5;
        const to = mind[mind.length - 1] + 0.5;
        const edge = [];
        for (let s = from; s <= to + 1e-6; s += 0.25) edge.push(axisPoint(R + 4, s, count));
        sector = `<polygon class="gb-cst-mind" points="0,0 ${pts(edge)}"/>`;
    }

    // Forma da build e as estrelas de cada atributo.
    const shape = attributes.map((a, i) => {
        const v = Math.min(top, Math.max(0, Number(a.total) || 0));
        return axisPoint(Math.max(3, (R * v) / top), i, count);
    });
    let stars = '';
    let labels = '';
    attributes.forEach((a, i) => {
        const [x, y] = shape[i];
        stars += `<circle class="gb-cst-star gb-cst-star--${a.group}" cx="${x}" cy="${y}" r="3.2"/>`;
        const [lx, ly] = axisPoint(R + 17, i, count);
        const anchor = Math.abs(lx) < 8 ? 'middle' : lx > 0 ? 'start' : 'end';
        labels += `<text class="gb-cst-label gb-cst-label--${a.group}" x="${lx}" y="${ly - 3}" text-anchor="${anchor}">`
            + `<tspan class="gb-cst-abbr">${a.abbr}</tspan>`
            + `<tspan class="gb-cst-value" x="${lx}" dy="12">${a.total}</tspan></text>`;
    });

    return '<svg class="gb-cst" viewBox="-118 -104 236 212" aria-hidden="true" focusable="false">'
        + `${sector}${grid}<path class="gb-cst-axis" d="${axes}"/>`
        + `<polygon class="gb-cst-shape" points="${pts(shape)}"/>${stars}${labels}</svg>`;
}
