/**
 * Selos de magia procedurais.
 *
 * Cada magia ganha um selo — um círculo mágico — desenhado a partir do nome,
 * da esfera, do arcano e do nível: o mesmo feitiço gera sempre o mesmo selo,
 * na ficha, no chat e no HUD. A esfera define a gramática geométrica (o
 * hexagrama da Energia, a estrela pontiaguda da Destruição, as pétalas da
 * Criação, a treliça da Matéria, o olho da Persona, as órbitas do Cosmo e o
 * heptagrama torto da Proibida); o arcano, o glifo do centro; o nível, a
 * complexidade — anéis, marcas, satélites e a faixa de runas. O nome só
 * embaralha as variações dentro dessas regras.
 *
 * O SVG sai sem ids e sem cores: os traços usam as classes l1–l3 (forte,
 * médio, sutil), `f` (preenchido), `fv` (vazio escuro) e `acc` (cor de
 * destaque), pintadas em styles/granblue.css com a cor da esfera. Assim
 * vários selos convivem na mesma página e mudam de cor só pelo CSS.
 */

/* -------------------------------------------- */
/*  Números e sementes                          */
/* -------------------------------------------- */

/** Texto sem acento, minúsculo e sem espaços nas pontas. */
export function plainKey(value) {
    return String(value ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

/** Hash de 32 bits de um texto (cyrb53 reduzido). */
function hash(text) {
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    for (let i = 0; i < text.length; i++) {
        const ch = text.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h1 ^ h2) >>> 0;
}

/** Gerador pseudoaleatório determinístico (mulberry32) com atalhos. */
function prng(seed) {
    let a = seed >>> 0;
    const next = () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return {
        next,
        range: (min, max) => min + next() * (max - min),
        int: (min, max) => min + Math.floor(next() * (max - min + 1)),
        pick: (list) => list[Math.floor(next() * list.length)],
        chance: (p) => next() < p
    };
}

/** Número curto para o SVG (duas casas, sem "-0"). */
function n(value) {
    const r = Math.round(value * 100) / 100;
    return Object.is(r, -0) ? 0 : r;
}

/** Ponto no raio `r` e no ângulo `deg` (graus; 0 = topo, sentido horário). */
function polar(r, deg) {
    const t = ((deg - 90) * Math.PI) / 180;
    return [n(r * Math.cos(t)), n(r * Math.sin(t))];
}

function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
}

/* -------------------------------------------- */
/*  Primitivas                                  */
/* -------------------------------------------- */

const pts = (list) => list.map(([x, y]) => `${x},${y}`).join(' ');
const circle = (r, cls = 'l1', [x, y] = [0, 0]) => `<circle class="${cls}" cx="${x}" cy="${y}" r="${n(r)}"/>`;
const poly = (list, cls = 'l1') => `<polygon class="${cls}" points="${pts(list)}"/>`;
const path = (d, cls = 'l1', extra = '') => `<path class="${cls}" d="${d}"${extra}/>`;
const seg = ([x1, y1], [x2, y2]) => `M${x1} ${y1}L${x2} ${y2}`;
const ellipse = (rx, ry, rot, cls = 'l2') =>
    `<ellipse class="${cls}" rx="${n(rx)}" ry="${n(ry)}" transform="rotate(${n(rot)})"/>`;

/** Vértices de um polígono regular. */
function regular(sides, r, rot = 0) {
    return Array.from({ length: sides }, (_, i) => polar(r, rot + (i * 360) / sides));
}

/** Estrela {n/k}: liga cada vértice ao k-ésimo seguinte (pode virar mais de um polígono). */
function starPolygons(points, k, r, rot = 0) {
    const verts = regular(points, r, rot);
    const out = [];
    for (let s = 0; s < gcd(points, k); s++) {
        const list = [];
        let i = s;
        do {
            list.push(verts[i]);
            i = (i + k) % points;
        } while (i !== s);
        out.push(list);
    }
    return out;
}

/** Estrela pontiaguda: `points` pontas alternando o raio externo e o interno. */
function spikes(points, rOut, rIn, rot = 0) {
    return Array.from({ length: points * 2 }, (_, i) => polar(i % 2 ? rIn : rOut, rot + (i * 180) / points));
}

/** Arco de circunferência de `a0` a `a1` graus (sentido horário). */
function arc(r, a0, a1) {
    const [x0, y0] = polar(r, a0);
    const [x1, y1] = polar(r, a1);
    const span = (((a1 - a0) % 360) + 360) % 360;
    return `M${x0} ${y0}A${n(r)} ${n(r)} 0 ${span > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}

/** Círculo partido em `count` arcos, com intervalos sorteados. */
function brokenRing(rng, r, count, rot = 0, gap = [8, 22]) {
    const step = 360 / count;
    let d = '';
    for (let i = 0; i < count; i++) {
        const start = rot + i * step + rng.range(gap[0], gap[1]) / 2;
        const end = rot + (i + 1) * step - rng.range(gap[0], gap[1]) / 2;
        if (end > start) d += arc(r, start, end);
    }
    return d;
}

/** Marcas radiais entre `r1` e `r2`; a cada `every`, uma marca longa até `rLong`. */
function ticks(count, r1, r2, rot = 0, every = 0, rLong = r2) {
    let short = '';
    let long = '';
    for (let i = 0; i < count; i++) {
        const a = rot + (i * 360) / count;
        if (every && i % every === 0) long += seg(polar(r1 - 0.6, a), polar(rLong, a));
        else short += seg(polar(r1, a), polar(r2, a));
    }
    return (short ? path(short, 'l3') : '') + (long ? path(long, 'l2') : '');
}

/** Pétala (vesica) do raio `r0` ao `r1` no ângulo `a`, abrindo `w` graus. */
function petal(r0, r1, a, w) {
    const [x0, y0] = polar(r0, a);
    const [x1, y1] = polar(r1, a);
    const rm = (r0 + r1) / 2;
    const [c1x, c1y] = polar(rm, a - w);
    const [c2x, c2y] = polar(rm, a + w);
    return `M${x0} ${y0}Q${c1x} ${c1y} ${x1} ${y1}Q${c2x} ${c2y} ${x0} ${y0}Z`;
}

/** Circunferência ondulada: `waves` ondas de amplitude `amp` em volta do raio `r`. */
function waveRing(r, amp, waves, rot = 0) {
    const steps = waves * 2;
    let [x, y] = polar(r, rot);
    let d = `M${x} ${y}`;
    for (let i = 0; i < steps; i++) {
        const mid = rot + ((i + 0.5) * 360) / steps;
        const end = rot + ((i + 1) * 360) / steps;
        const [cx, cy] = polar(r + (i % 2 ? -amp : amp) * 2, mid);
        [x, y] = polar(r, end);
        d += `Q${cx} ${cy} ${x} ${y}`;
    }
    return `${d}Z`;
}

/** Espiral de Arquimedes de `r0` a `r1`, com `turns` voltas. */
function spiral(r0, r1, turns, rot = 0, dir = 1) {
    const steps = Math.max(12, Math.round(turns * 28));
    let d = '';
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const [x, y] = polar(r0 + (r1 - r0) * t, rot + dir * t * turns * 360);
        d += `${i ? 'L' : 'M'}${x} ${y}`;
    }
    return d;
}

/** Brilho de quatro pontas (lados côncavos) no ponto `[x, y]`. */
function sparkle([x, y], size, rot = 0) {
    const tip = regular(4, size, rot).map(([px, py]) => [n(px + x), n(py + y)]);
    const inner = regular(4, size * 0.2, rot + 45).map(([px, py]) => [n(px + x), n(py + y)]);
    let d = `M${tip[0][0]} ${tip[0][1]}`;
    for (let i = 0; i < 4; i++) {
        const c = inner[i];
        const t = tip[(i + 1) % 4];
        d += `Q${c[0]} ${c[1]} ${t[0]} ${t[1]}`;
    }
    return `${d}Z`;
}

/** Losango pequeno centrado num ponto (enfeite de satélite e de ponta). */
function diamondAt([x, y], size, rot = 0) {
    return regular(4, size, rot).map(([px, py]) => [n(px + x), n(py + y)]);
}

/** Runa miúda de 2–3 traços numa grade 2×3, girada para a tangente do anel. */
function rune(rng, r, a, h) {
    const w = h * 0.62;
    const grid = [
        [-w / 2, -h / 2], [w / 2, -h / 2], [0, -h / 2],
        [-w / 2, 0], [w / 2, 0], [0, 0],
        [-w / 2, h / 2], [w / 2, h / 2], [0, h / 2]
    ].map(([x, y]) => [n(x), n(y)]);
    let d = rng.chance(0.65) ? seg(grid[2], grid[8]) : '';
    const strokes = rng.int(1, 2) + (d ? 0 : 1);
    for (let i = 0; i < strokes; i++) {
        const p = rng.pick(grid);
        let q = rng.pick(grid);
        if (p === q) q = grid[(grid.indexOf(p) + 4) % grid.length];
        d += seg(p, q);
    }
    const [x, y] = polar(r, a);
    return path(d, 'l2', ` transform="translate(${x} ${y}) rotate(${n(a)})"`);
}

/* -------------------------------------------- */
/*  Glifos do centro (arcanos e esferas)        */
/* -------------------------------------------- */

/**
 * Glifos de cada arcano, desenhados num quadrado de ±11 em volta do centro.
 * Os da Proibida e os elementais seguem os símbolos alquímicos quando há um.
 */
const GLYPHS = {
    // Energia
    arcana: () => poly(regular(3, 10.5), 'l1') + circle(3.4, 'l1') + circle(1.2, 'f'),
    barreira: () => poly(regular(6, 10.5, 30), 'l1') + poly(regular(6, 5.6, 30), 'l2') + circle(1.2, 'f'),
    cura: () =>
        poly([[-2.6, -10], [2.6, -10], [2.6, -2.6], [10, -2.6], [10, 2.6], [2.6, 2.6], [2.6, 10],
            [-2.6, 10], [-2.6, 2.6], [-10, 2.6], [-10, -2.6], [-2.6, -2.6]], 'l1') + circle(1.1, 'f'),
    // Destruição
    eletricidade: () => poly([[2.5, -11.5], [-6.5, 1.2], [-0.6, 1.2], [-3.2, 11.5], [6.6, -2], [0.8, -2]], 'l1'),
    calor: () =>
        path('M0 -11.5C5.5 -5.5 9 -0.5 6.5 5.5C4.6 10 -4.6 10 -6.5 5.5C-8.6 0.5 -4 -3 0 -11.5Z', 'l1')
        + path('M0.4 -2C3.2 1.3 3.9 4.2 2.2 6.6C1 8.1 -2 8.1 -3 6.2C-4 4 -1.6 1.6 0.4 -2Z', 'l2'),
    frio: () => {
        let d = '';
        for (const a of [0, 60, 120, 180, 240, 300]) {
            d += seg([0, 0], polar(11, a));
            d += seg(polar(6, a), polar(9.4, a - 30)) + seg(polar(6, a), polar(9.4, a + 30));
        }
        return path(d, 'l1');
    },
    // Criação (símbolos alquímicos do ar e da terra; ondas da água)
    ceu: () => poly(regular(3, 10.5), 'l1') + path('M-9.5 1.2L9.5 1.2', 'l1'),
    terra: () => poly(regular(3, 10.5, 180), 'l1') + path('M-9.5 -1.2L9.5 -1.2', 'l1'),
    agua: () =>
        path('M-10 -5Q-7.5 -8 -5 -5T0 -5T5 -5T10 -5M-10 0.5Q-7.5 -2.5 -5 0.5T0 0.5T5 0.5T10 0.5'
            + 'M-10 6Q-7.5 3 -5 6T0 6T5 6T10 6', 'l1'),
    // Matéria
    planta: () =>
        `<g transform="rotate(35)">${path('M0 11Q-8.5 0 0 -11Q8.5 0 0 11Z', 'l1')}`
        + `${path('M0 10L0 -8M0 3L-3.6 -0.8M0 -1.5L3.6 -5', 'l2')}</g>`,
    areia: () =>
        path('M-11 5.5Q-5.5 -0.5 0 5.5Q5.5 11.5 11 5.5', 'l1')
        + [[-5, -7], [0, -9], [5, -6.5], [-2, -3.5], [3, -2.2]].map((p) => circle(1.25, 'f', p)).join(''),
    metal: () =>
        poly([[0, -11], [8, 0], [0, 11], [-8, 0]], 'l1') + poly([[0, -5], [3.6, 0], [0, 5], [-3.6, 0]], 'l2')
        + path('M0 -11L0 -5M8 0L3.6 0M0 11L0 5M-8 0L-3.6 0', 'l3'),
    // Persona
    espirito: () =>
        path('M0 11C-7.5 7 -7.8 -1 -2 -4.5C1.5 -6.6 1.3 -9.6 -0.6 -11.6C5.6 -9.6 8.6 -2.4 5.2 3.6'
            + 'C3.4 6.8 1.4 8.6 0 11Z', 'l1') + circle(2.3, 'l2', [0, 4]),
    psiquica: () => path('M-11 0Q0 -9.5 11 0Q0 9.5 -11 0Z', 'l1') + circle(4, 'l1') + circle(1.6, 'f'),
    ki: () =>
        circle(10, 'l1') + path('M0 -10A5 5 0 0 1 0 0A5 5 0 0 0 0 10', 'l1')
        + circle(1.6, 'f', [0, -5]) + circle(1.6, 'l1', [0, 5]),
    // Cosmo
    sol: () => {
        let d = '';
        for (let i = 0; i < 12; i++) d += seg(polar(7, i * 30), polar(i % 2 ? 9.4 : 11.4, i * 30));
        return circle(4.8, 'l1') + path(d, 'l1');
    },
    estrela: () => path(sparkle([0, 0], 11), 'l1') + path(sparkle([0, 0], 5, 45), 'l2'),
    lua: () => path('M3.6 -9.6A10.2 10.2 0 1 0 3.6 9.6A8 8 0 1 1 3.6 -9.6Z', 'l1'),
    // Proibida
    tempo: () =>
        path('M-8 -10.5L8 -10.5M-8 10.5L8 10.5', 'l1')
        + path('M-6.4 -10.5L0 0L6.4 -10.5M-6.4 10.5L0 0L6.4 10.5', 'l1') + circle(1.2, 'f', [0, 7.6]),
    espaco: () =>
        poly([[-9, -9], [9, -9], [9, 9], [-9, 9]], 'l1') + poly([[-4, -4], [4, -4], [4, 4], [-4, 4]], 'l2')
        + path('M-9 -9L-4 -4M9 -9L4 -4M9 9L4 4M-9 9L-4 4', 'l3'),
    trevas: () => circle(10.5, 'l2') + circle(7.8, 'fv') + circle(7.8, 'acc') + path(arc(9.2, 205, 325), 'l1'),

    // Emblemas das esferas (Roda das Esferas)
    'sphere:energia': () => path(sparkle([0, 0], 11), 'l1') + circle(3.2, 'l2'),
    'sphere:destruicao': () => poly(spikes(8, 11, 4.4), 'l1') + circle(1.4, 'f'),
    'sphere:criacao': () =>
        path('M0 11L0 -3', 'l1') + path('M0 3Q-9 2 -9 -7Q-1 -7 0 3Z', 'l1') + path('M0 -1Q8 -2 8.5 -10Q1 -9 0 -1Z', 'l1'),
    'sphere:materia': () =>
        poly(regular(6, 10.5), 'l1') + path(`${seg([0, 0], polar(10.5, 120))}${seg([0, 0], polar(10.5, 240))}`
            + `${seg([0, 0], [0, 10.5])}`, 'l1'),
    'sphere:persona': () => circle(6.6, 'l1', [-3.4, 0]) + circle(6.6, 'l1', [3.4, 0]) + circle(1.3, 'f'),
    'sphere:cosmo': () => circle(5.2, 'l1') + ellipse(11.5, 3.6, -22, 'l1') + circle(1, 'f', polar(11, 300)),
    'sphere:proibida': () => poly(regular(3, 10.5, 180), 'acc') + circle(4.2, 'fv') + circle(4.2, 'l1')
};

/** Glifo procedural para um arcano que não está na lista: traços numa grade 3×3. */
function proceduralGlyph(rng) {
    const grid = [-8, 0, 8];
    let [cx, cy] = [rng.int(0, 2), rng.int(0, 2)];
    const seen = new Set([`${cx},${cy}`]);
    let d = `M${grid[cx]} ${grid[cy]}`;
    const steps = rng.int(3, 5);
    for (let i = 0; i < steps; i++) {
        const options = [];
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
            const x = cx + dx;
            const y = cy + dy;
            if (x >= 0 && x <= 2 && y >= 0 && y <= 2 && !seen.has(`${x},${y}`)) options.push([x, y]);
        }
        if (!options.length) break;
        [cx, cy] = rng.pick(options);
        seen.add(`${cx},${cy}`);
        d += `L${grid[cx]} ${grid[cy]}`;
    }
    return path(d, 'l1') + circle(1.8, 'f', [grid[cx], grid[cy]]);
}

/* -------------------------------------------- */
/*  Gramáticas das esferas                      */
/* -------------------------------------------- */

/**
 * Cada esfera desenha o seu miolo entre o anel do glifo e o raio `R`.
 * Devolve `{ core, anchors }`: o SVG e os pontos onde ficam os satélites
 * (os enfeites dos níveis mais altos).
 */
const GRAMMARS = {
    /** Energia pura: hexagramas, harmonia perfeita. */
    energia(rng, R, lvl) {
        const rot = rng.pick([0, 30]);
        const inner = rng.pick(['hexagon', 'circle', 'triangles']);
        let core = starPolygons(6, 2, R, rot).map((p) => poly(p, 'l1')).join('');
        if (inner === 'hexagon') core += poly(regular(6, R * 0.5, rot + 30), 'l2');
        else if (inner === 'circle') core += circle(R * 0.5, 'l2');
        else core += starPolygons(6, 2, R * 0.5, rot + 30).map((p) => poly(p, 'l2')).join('');
        let spokes = '';
        for (let i = 0; i < 6; i++) {
            const a = rot + 30 + i * 60;
            spokes += seg(polar(16, a), polar(R * (inner === 'circle' ? 0.5 : 0.58), a));
        }
        core += path(spokes, 'l3');
        if (lvl >= 4) core += poly(regular(6, R, rot), 'l3');
        if (lvl >= 9) core += starPolygons(6, 2, R * 0.82, rot + 30).map((p) => poly(p, 'l3')).join('');
        return { core, anchors: regular(6, R, rot) };
    },

    /** Destruição: estrelas pontiagudas, anéis quebrados, estilhaços. */
    destruicao(rng, R, lvl) {
        const points = rng.pick([5, 7, 8, 9]);
        const rot = rng.range(0, 360 / points);
        let core = poly(spikes(points, R, R * rng.range(0.38, 0.47), rot), 'l1');
        core += poly(spikes(points, R * 0.56, R * 0.31, rot + 180 / points), 'l3');
        core += path(brokenRing(rng, R * 0.68, points, rot + 90 / points, [10, 26]), 'l2');
        if (lvl >= 4) {
            let shards = '';
            for (let i = 0; i < points; i++) {
                const a = rot + (i * 360) / points;
                shards += seg(polar(R * 1.04, a - 4), polar(R * 1.14, a)) + seg(polar(R * 1.14, a), polar(R * 1.04, a + 4));
            }
            core += path(shards, 'l2');
        }
        return { core, anchors: regular(points, R * 0.47, rot + 180 / points) };
    },

    /** Criação: pétalas, ondas, a semente da vida. */
    criacao(rng, R, lvl) {
        const count = rng.pick([5, 6, 8]);
        const rot = rng.range(0, 360 / count);
        const width = (360 / count) * rng.range(0.44, 0.54);
        let outer = '';
        let inner = '';
        for (let i = 0; i < count; i++) {
            outer += petal(14.5, R * 0.96, rot + (i * 360) / count, width);
            if (lvl >= 3) inner += petal(14.5, R * 0.6, rot + ((i + 0.5) * 360) / count, width * 0.9);
        }
        // As pétalas brotam de um mesmo anel, já no primeiro nível.
        let core = circle(14.5, 'l2') + path(outer, 'l1') + (inner ? path(inner, 'l2') : '');
        core += path(waveRing(R + 2.4, 0.9, count * 2, rot), 'l2');
        if (lvl >= 5) {
            for (let i = 0; i < count; i++) core += circle(R * 0.21, 'l3', polar(R * 0.42, rot + (i * 360) / count));
        }
        return { core, anchors: regular(count, R * 0.96, rot) };
    },

    /** Matéria: quadrados entrelaçados, facetas de cristal. */
    materia(rng, R, lvl) {
        const rot = rng.pick([0, 22.5]);
        const k = rng.pick([2, 3]);
        let core = starPolygons(8, k, R, rot).map((p) => poly(p, 'l1')).join('');
        core += poly(regular(4, R * 0.55, rot + 45), 'l2');
        let facets = '';
        for (let i = 0; i < 8; i++) {
            const a = rot + i * 45;
            facets += seg(polar(16, a), polar(R * (k === 2 ? 0.74 : 0.58), a));
        }
        core += path(facets, 'l3');
        if (lvl >= 4) core += poly(regular(8, R * 0.8, rot + 22.5), 'l3');
        if (lvl >= 7) core += poly(regular(4, R * 0.55, rot), 'l3');
        return { core, anchors: regular(8, R, rot) };
    },

    /** Persona: o olho, o trevo da alma, as espirais do ki. */
    persona(rng, R, lvl) {
        const form = rng.pick(['eye', 'triskele', 'quatrefoil']);
        const rot = rng.pick([0, 90]);
        let core = '';
        let anchors;
        if (form === 'eye') {
            const h = R * 0.55;
            const rr = (R * R + h * h) / (2 * h);
            core += `<g transform="rotate(${rot})">${path(`M${n(-R)} 0A${n(rr)} ${n(rr)} 0 0 1 ${n(R)} 0`
                + `A${n(rr)} ${n(rr)} 0 0 1 ${n(-R)} 0Z`, 'l1')}`;
            let lashes = '';
            for (const a of [-50, -25, 0, 25, 50]) {
                lashes += seg(polar(h + 3, a), polar(h + (a ? 7 : 9), a));
                lashes += seg(polar(h + 3, 180 + a), polar(h + (a ? 7 : 9), 180 + a));
            }
            core += `${path(lashes, 'l2')}</g>`;
            core += circle(R * 0.36, 'l2');
            anchors = [polar(R, rot + 90), polar(R, rot + 270)];
        } else if (form === 'triskele') {
            const dir = rng.pick([1, -1]);
            const base = rng.range(0, 120);
            for (let i = 0; i < 3; i++) core += path(spiral(15.5, R, 0.62, base + i * 120, dir), 'l1');
            core += circle(R * 0.72, 'l3');
            anchors = regular(3, R, base);
        } else {
            const h = R * 0.5;
            for (const a of [rot, rot + 90]) {
                core += `<g transform="rotate(${a})">${path(`M${n(-R)} 0Q0 ${n(-h * 1.6)} ${n(R)} 0Q0 ${n(h * 1.6)} ${n(-R)} 0Z`, 'l1')}</g>`;
            }
            core += circle(R * 0.5, 'l3');
            anchors = regular(4, R, rot + 45).map(([x, y]) => [n(x * 0.62), n(y * 0.62)]);
        }
        if (lvl >= 5) core += path(spiral(R * 0.7, R * 0.98, 1.1, rng.range(0, 360), rng.pick([1, -1])), 'l3');
        return { core, anchors };
    },

    /** Cosmo: órbitas, planetas e estrelas. */
    cosmo(rng, R, lvl) {
        const orbits = lvl >= 4 ? 3 : 2;
        const rot = rng.range(0, 180);
        const ratio = rng.range(0.3, 0.42);
        let core = '';
        const anchors = [];
        for (let i = 0; i < orbits; i++) {
            const a = rot + (i * 180) / orbits;
            core += ellipse(R, R * ratio, a, 'l2');
            const t = rng.range(0, 360) * (Math.PI / 180);
            const [x, y] = [R * Math.cos(t), R * ratio * Math.sin(t)];
            const ra = (a * Math.PI) / 180;
            const p = [n(x * Math.cos(ra) - y * Math.sin(ra)), n(x * Math.sin(ra) + y * Math.cos(ra))];
            core += circle(2.2, 'f', p);
            anchors.push(p);
        }
        let stars = '';
        for (let i = rng.int(3, 5); i > 0; i--) {
            stars += sparkle(polar(rng.range(R * 0.55, R * 0.95), rng.range(0, 360)), rng.range(2.4, 3.8), rng.pick([0, 45]));
        }
        core += path(stars, 'l1');
        let dust = '';
        for (let i = 0; i < 28; i++) dust += circle(0.55, 'f', polar(R + 2.2, i * (360 / 28)));
        core += dust;
        return { core, anchors };
    },

    /** Proibida: o heptagrama torto, o círculo partido, o vazio. */
    proibida(rng, R, lvl) {
        const skew = rng.range(7, 19) * rng.pick([1, -1]);
        const k = rng.pick([2, 3]);
        let core = starPolygons(7, k, R, skew).map((p) => poly(p, 'l1')).join('');
        core += path(brokenRing(rng, R * 0.74, rng.int(4, 6), skew * 2, [14, 40]), 'l2');
        core += poly(regular(3, R * 0.62, 180 + skew / 2), 'acc');
        if (lvl >= 4) {
            for (let i = 0; i < 14; i++) core += circle(1.5, 'l3', polar(R + 2.6, skew + i * (360 / 14)));
        }
        return { core, anchors: regular(7, R, skew) };
    }
};

/* -------------------------------------------- */
/*  Selo                                        */
/* -------------------------------------------- */

/** Esferas conhecidas (as chaves de GRANBLUE.spheres). */
export const SIGIL_SPHERES = Object.keys(GRAMMARS);

const cache = new Map();

/**
 * Desenha o selo de uma magia. `detail` (0–2) corta enfeites nos tamanhos
 * pequenos: 0 para ícones de lista, 1 para a ficha, 2 para o chat e a ficha
 * da magia. Devolve o `<svg>` como texto.
 */
export function sigilSVG({ name = '', sphere = '', arcano = '', level = 1, detail = 2, glyph = '' } = {}) {
    const sp = SIGIL_SPHERES.includes(plainKey(sphere)) ? plainKey(sphere) : 'energia';
    const arc = plainKey(arcano);
    const lvl = Math.min(9, Math.max(1, Math.round(Number(level) || 1)));
    const key = `${sp}|${arc}|${plainKey(name)}|${lvl}|${detail}|${glyph}`;
    if (cache.has(key)) return cache.get(key);

    const rng = prng(hash(`${sp}|${arc}|${plainKey(name)}`));
    const R = lvl >= 6 ? 31 : lvl >= 3 ? 37 : 40;

    // Anéis externos: o contorno, o segundo anel com marcas e a faixa de runas.
    let ring = circle(46, 'l1');
    if (lvl >= 3) {
        ring += circle(42.4, 'l2');
        if (detail >= 1) {
            const count = rng.pick([24, 36, 48]);
            ring += ticks(count, 43.4, 45, rng.range(0, 360 / count), rng.pick([3, 4, 6]), 46);
        }
    }
    if (lvl >= 6 && detail >= 1) {
        ring += circle(33.6, 'l2');
        const count = 10 + lvl;
        const offset = rng.range(0, 360 / count);
        if (detail >= 2) {
            for (let i = 0; i < count; i++) ring += rune(rng, 37.9, offset + (i * 360) / count, 5);
        } else {
            ring += ticks(count * 2, 36.2, 39.6, offset);
        }
    }
    if (lvl >= 8 && detail >= 1) {
        const rot = rng.pick([0, 45]);
        ring += regular(4, 49.6, rot).map((p) => poly(diamondAt(p, 2.4, rot), 'f')).join('');
        if (lvl >= 9) ring += regular(4, 49.2, rot + 45).map((p) => circle(1.1, 'f', p)).join('');
    }

    // Miolo da esfera e satélites nos vértices.
    const { core, anchors } = GRAMMARS[sp](rng, R, lvl);
    let sats = '';
    if (lvl >= 5 && detail >= 1) {
        const shape = rng.pick(['ring', 'dot', 'diamond']);
        for (const p of anchors) {
            if (shape === 'ring') sats += circle(2.5, 'l2', p) + circle(0.9, 'f', p);
            else if (shape === 'dot') sats += circle(1.7, 'f', p);
            else sats += poly(diamondAt(p, 2.6), 'l2');
        }
    }

    // Glifo do arcano no centro (o da esfera, nos emblemas).
    const drawGlyph = GLYPHS[glyph] ?? GLYPHS[arc] ?? null;
    const scale = lvl >= 6 ? 0.82 : 1;
    let center = '';
    if (sp === 'proibida') center += circle(14 * scale, 'fv');
    if (lvl >= 2 || sp === 'proibida') center += circle(14.6 * scale, sp === 'proibida' ? 'acc' : 'l2');
    if (lvl >= 7 && detail >= 1) center += circle(16.4 * scale, 'l3');
    const mark = drawGlyph ? drawGlyph() : proceduralGlyph(rng);
    center += scale === 1 ? mark : `<g transform="scale(${scale})">${mark}</g>`;

    const svg = '<svg class="gb-sigil-svg" viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">'
        + `<g class="gb-sg-ring">${ring}</g>`
        + `<g class="gb-sg-core">${core}${sats}</g>`
        + `<g class="gb-sg-glyph">${center}</g></svg>`;
    cache.set(key, svg);
    return svg;
}

/** Emblema de uma esfera (Roda das Esferas e cabeçalhos do Grimório). */
export function sphereEmblemSVG(sphere, { detail = 1 } = {}) {
    const sp = SIGIL_SPHERES.includes(plainKey(sphere)) ? plainKey(sphere) : 'energia';
    return sigilSVG({ name: `esfera ${sp}`, sphere: sp, level: 5, detail, glyph: `sphere:${sp}` });
}

/** Algarismos romanos do nível da magia (1–9 → I–IX). */
export function roman(value) {
    const num = Math.round(Number(value) || 0);
    if (num < 1 || num > 39) return String(value ?? '');
    const table = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    let rest = num;
    let out = '';
    for (const [v, s] of table) {
        while (rest >= v) {
            out += s;
            rest -= v;
        }
    }
    return out;
}

/* -------------------------------------------- */
/*  Faces de dado (cartões de chat)             */
/* -------------------------------------------- */

/** Pips do d6 numa face 32×32. */
const PIPS = {
    1: [[16, 16]],
    2: [[9.5, 9.5], [22.5, 22.5]],
    3: [[9.5, 9.5], [16, 16], [22.5, 22.5]],
    4: [[9.5, 9.5], [22.5, 9.5], [9.5, 22.5], [22.5, 22.5]],
    5: [[9.5, 9.5], [22.5, 9.5], [16, 16], [9.5, 22.5], [22.5, 22.5]],
    6: [[9.5, 8.5], [22.5, 8.5], [9.5, 16], [22.5, 16], [9.5, 23.5], [22.5, 23.5]]
};

/** Silhueta de cada dado (coordenadas 0–32). */
function dieBody(faces) {
    switch (faces) {
        case 4: return '<polygon class="gb-die-body" points="16,3 29.5,27.5 2.5,27.5"/>';
        case 8: return '<polygon class="gb-die-body" points="16,1.5 30.5,16 16,30.5 1.5,16"/>';
        case 10: return '<polygon class="gb-die-body" points="16,1.5 30,12.5 16,30.5 2,12.5"/>';
        case 12: return `<polygon class="gb-die-body" points="${pts(regular(5, 15, 0).map(([x, y]) => [n(x + 16), n(y + 17)]))}"/>`;
        case 20:
            return `<polygon class="gb-die-body" points="${pts(regular(6, 15.4, 0).map(([x, y]) => [n(x + 16), n(y + 16)]))}"/>`
                + '<polygon class="gb-die-edge" points="16,6.5 25,21.5 7,21.5"/>';
        case 6: return '<rect class="gb-die-body" x="2.5" y="2.5" width="27" height="27" rx="6"/>';
        default: return '<circle class="gb-die-body" cx="16" cy="16" r="14"/>';
    }
}

/** Face de um dado rolado em SVG: o d6 com pips; os outros com a silhueta e o número. */
export function dieFaceSVG(faces, value) {
    const f = Number(faces) || 0;
    const v = Number(value);
    let inner = dieBody(f);
    if (f === 6 && PIPS[v]) {
        inner += PIPS[v].map(([x, y]) => `<circle class="gb-die-pip" cx="${x}" cy="${y}" r="2.7"/>`).join('');
    } else {
        const y = f === 4 ? 21 : f === 10 ? 15 : f === 12 ? 17.5 : 16.5;
        const size = String(v).length > 2 ? 9 : String(v).length > 1 ? 11.5 : 13;
        inner += `<text class="gb-die-num" x="16" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="middle">${v}</text>`;
    }
    return `<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">${inner}</svg>`;
}

/**
 * Marcação de um dado no cartão de chat. O Foundry limpa o HTML das
 * mensagens e tira os `<svg>`, então o cartão guarda só as faces e o valor (e
 * o número, como texto de reserva); a face é desenhada ao exibir a mensagem
 * (ver hydrateCard). O dado no máximo ganha a classe `is-max`; o 1, `is-min`.
 */
export function dieFaceHTML(faces, value) {
    const f = Number(faces) || 0;
    const v = Number(value);
    const flags = `${v === f ? ' is-max' : ''}${v === 1 ? ' is-min' : ''}`;
    return `<span class="gb-die gb-die--d${f}${flags}" data-faces="${f}" data-value="${v}" title="d${f}: ${v}">${v}</span>`;
}

/**
 * Desenha, num cartão de chat já na tela, as faces dos dados e os selos que
 * a mensagem guardou como dados (`data-faces`/`data-value` e `data-gb-sigil`).
 */
export function hydrateCard(root) {
    root.querySelectorAll('.gb-die[data-faces]').forEach((el) => {
        if (!el.querySelector('svg')) el.innerHTML = dieFaceSVG(el.dataset.faces, el.dataset.value);
    });
    root.querySelectorAll('[data-gb-sigil]').forEach((el) => {
        if (el.querySelector('svg')) return;
        el.innerHTML = sigilSVG({
            name: el.dataset.sigilName,
            sphere: el.dataset.sphere,
            arcano: el.dataset.sigilArcano,
            level: el.dataset.sigilLevel,
            detail: 2
        });
    });
}
