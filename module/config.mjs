/**
 * Configuração central do sistema Granblue.
 * Todos os dados de referência (atributos, ranks, dificuldades, esferas, classes,
 * status effects) vivem aqui para facilitar manutenção e expansão.
 */

export const GRANBLUE = {};

GRANBLUE.id = 'granblue';

/* -------------------------------------------- */
/*  Atributos                                   */
/* -------------------------------------------- */

/**
 * Os 9 atributos. `func` descreve a função principal (usada em tooltips).
 * A ordem aqui é a ordem de exibição na ficha.
 */
GRANBLUE.attributes = {
    forca: { label: 'GRANBLUE.Attributes.forca.label', abbr: 'GRANBLUE.Attributes.forca.abbr', func: 'GRANBLUE.Attributes.forca.func' },
    precisao: { label: 'GRANBLUE.Attributes.precisao.label', abbr: 'GRANBLUE.Attributes.precisao.abbr', func: 'GRANBLUE.Attributes.precisao.func' },
    reacao: { label: 'GRANBLUE.Attributes.reacao.label', abbr: 'GRANBLUE.Attributes.reacao.abbr', func: 'GRANBLUE.Attributes.reacao.func' },
    resiliencia: { label: 'GRANBLUE.Attributes.resiliencia.label', abbr: 'GRANBLUE.Attributes.resiliencia.abbr', func: 'GRANBLUE.Attributes.resiliencia.func' },
    percepcao: { label: 'GRANBLUE.Attributes.percepcao.label', abbr: 'GRANBLUE.Attributes.percepcao.abbr', func: 'GRANBLUE.Attributes.percepcao.func' },
    carisma: { label: 'GRANBLUE.Attributes.carisma.label', abbr: 'GRANBLUE.Attributes.carisma.abbr', func: 'GRANBLUE.Attributes.carisma.func' },
    sabedoria: { label: 'GRANBLUE.Attributes.sabedoria.label', abbr: 'GRANBLUE.Attributes.sabedoria.abbr', func: 'GRANBLUE.Attributes.sabedoria.func' },
    potencia: { label: 'GRANBLUE.Attributes.potencia.label', abbr: 'GRANBLUE.Attributes.potencia.abbr', func: 'GRANBLUE.Attributes.potencia.func' },
    disciplina: { label: 'GRANBLUE.Attributes.disciplina.label', abbr: 'GRANBLUE.Attributes.disciplina.abbr', func: 'GRANBLUE.Attributes.disciplina.func' }
};

/** Atributos que contam como "físicos" e "mágicos" para o point-buy inicial. */
GRANBLUE.physicalAttributes = ['forca', 'precisao', 'reacao', 'resiliencia', 'percepcao', 'carisma'];
GRANBLUE.magicalAttributes = ['sabedoria', 'potencia', 'disciplina'];

/* -------------------------------------------- */
/*  Ranks de Guerreiro Mágico                   */
/* -------------------------------------------- */

/** Ranks na ordem D1 → S10. `letra` é a classificação exibida. */
GRANBLUE.ranks = {
    d1: { label: 'D1', letra: 'D', ordem: 1, progresso: 8 },
    d2: { label: 'D2', letra: 'D', ordem: 2, progresso: 14 },
    c3: { label: 'C3', letra: 'C', ordem: 3, progresso: 20 },
    c4: { label: 'C4', letra: 'C', ordem: 4, progresso: 26 },
    b5: { label: 'B5', letra: 'B', ordem: 5, progresso: 32 },
    b6: { label: 'B6', letra: 'B', ordem: 6, progresso: 38 },
    a7: { label: 'A7', letra: 'A', ordem: 7, progresso: 44 },
    a8: { label: 'A8', letra: 'A', ordem: 8, progresso: 50 },
    s9: { label: 'S9', letra: 'S', ordem: 9, progresso: 56 },
    s10: { label: 'S10', letra: 'S', ordem: 10, progresso: 62 }
};

/* -------------------------------------------- */
/*  Dificuldades (DC) dos testes                */
/* -------------------------------------------- */

/** Escala de dificuldade. Testes de Mana somam +5 na DC. */
GRANBLUE.difficulties = {
    trivial: { label: 'GRANBLUE.Difficulties.trivial', value: 8 },
    facil: { label: 'GRANBLUE.Difficulties.facil', value: 10 },
    normal: { label: 'GRANBLUE.Difficulties.normal', value: 13 },
    complicado: { label: 'GRANBLUE.Difficulties.complicado', value: 16 },
    dificil: { label: 'GRANBLUE.Difficulties.dificil', value: 21 },
    muitoDificil: { label: 'GRANBLUE.Difficulties.muitoDificil', value: 24 },
    lendario: { label: 'GRANBLUE.Difficulties.lendario', value: 27 }
};

GRANBLUE.manaTestPenalty = 5;

/* -------------------------------------------- */
/*  Esferas de Magia                            */
/* -------------------------------------------- */

/** Esferas de magia. `custo` = pontos para desbloquear (começa com 5). */
GRANBLUE.spheres = {
    energia: { label: 'GRANBLUE.Spheres.energia', custo: 1 },
    destruicao: { label: 'GRANBLUE.Spheres.destruicao', custo: 2 },
    criacao: { label: 'GRANBLUE.Spheres.criacao', custo: 2 },
    materia: { label: 'GRANBLUE.Spheres.materia', custo: 2 },
    persona: { label: 'GRANBLUE.Spheres.persona', custo: 3 },
    cosmo: { label: 'GRANBLUE.Spheres.cosmo', custo: 3 },
    proibida: { label: 'GRANBLUE.Spheres.proibida', custo: 5 }
};

GRANBLUE.spherePointsStart = 5;

/**
 * Normaliza um texto de esfera para a chave correspondente ("Destruição" → "destruicao").
 * O campo `sphere` do item Magia aceita texto livre; isto garante que a magia caia no
 * grupo certo da ficha. Devolve '' quando não reconhece.
 */
GRANBLUE.normalizeSphere = function normalizeSphere(value) {
    const raw = String(value ?? '')
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .trim()
        .toLowerCase();
    return raw in GRANBLUE.spheres ? raw : '';
};

/* -------------------------------------------- */
/*  Inventário                                  */
/* -------------------------------------------- */

/** Categorias de item do inventário (ordem de exibição na aba). */
GRANBLUE.itemCategories = {
    arma: 'GRANBLUE.Inventory.category.arma',
    defesa: 'GRANBLUE.Inventory.category.defesa',
    consumivel: 'GRANBLUE.Inventory.category.consumivel',
    material: 'GRANBLUE.Inventory.category.material',
    tesouro: 'GRANBLUE.Inventory.category.tesouro',
    outros: 'GRANBLUE.Inventory.category.outros'
};

/** Qualidade dos materiais/itens forjados (ver journal "Itens"). */
GRANBLUE.itemQualities = {
    normal: 'GRANBLUE.Inventory.quality.normal',
    boa: 'GRANBLUE.Inventory.quality.boa',
    rara: 'GRANBLUE.Inventory.quality.rara',
    primorosa: 'GRANBLUE.Inventory.quality.primorosa',
    materiaPrima: 'GRANBLUE.Inventory.quality.materiaPrima'
};

/** Tiers de material/equipamento (1 a 8). */
GRANBLUE.itemTiers = [1, 2, 3, 4, 5, 6, 7, 8];

/* -------------------------------------------- */
/*  Classes (Estilos de Guerreiro)              */
/* -------------------------------------------- */

/**
 * As 15 classes, agrupadas. Cada uma define os valores recomendados de vida.
 *   vidaBase  = Energia Vital base
 *   vidaDado  = dado de vida (rolado uma vez)
 *   danoDado  = dado de dano base da classe
 *   grupo     = conjurador | especial | vanguarda
 */
GRANBLUE.classes = {
    // Conjurador
    artista: { label: 'Artista', grupo: 'conjurador', vidaBase: 40, vidaDado: '2d6', danoDado: '2d8', mana: '+1 de Mana cada vez que confere uma melhoria a um aliado.', weapons: 'Adagas / Espadas' },
    ragda: { label: 'Ragda', grupo: 'conjurador', vidaBase: 40, vidaDado: '2d6', danoDado: '2d6', mana: '+1 de Mana quando inflige um efeito negativo com sucesso a um alvo.', weapons: 'Adaga / Cajado / Grimório / Anel' },
    escriba: { label: 'Escriba', grupo: 'conjurador', vidaBase: 40, vidaDado: '2d4', danoDado: '2d6', mana: '+1 de Mana cada vez que é bem-sucedido em um teste de Disciplina.', weapons: 'Pena / Caneta (Alcance 4)' },
    samaritano: { label: 'Samaritano', grupo: 'conjurador', vidaBase: 40, vidaDado: '2d6', danoDado: '2d6', mana: '+1 de Mana quando cura um alvo.', weapons: 'Adaga / Bordão / Cajado / Anel / Grimório' },
    taumaturgo: { label: 'Taumaturgo', grupo: 'conjurador', vidaBase: 40, vidaDado: '2d6', danoDado: '2d6', mana: '+1 de Mana para cada alvo que acertar com uma magia que cause dano.', weapons: 'Cajado / Grimório / Anel' },
    // Especial
    cacador: { label: 'Caçador', grupo: 'especial', vidaBase: 50, vidaDado: '2d6', danoDado: '2d6', mana: '+1 de Mana cada vez que acerta um inimigo já ferido nesta rodada.', weapons: 'Adaga / Machado / Maça / Arco / Pistola / Rifle / Canhoneiro' },
    francoAtirador: { label: 'Franco-Atirador', grupo: 'especial', vidaBase: 40, vidaDado: '2d6', danoDado: '2d8', mana: '+1 de Mana ao acertar um ataque básico em um inimigo.', weapons: 'Arco / Pistola / Rifle / Canhoneiro' },
    mismagier: { label: 'Mismágier', grupo: 'especial', vidaBase: 40, vidaDado: '2d6', danoDado: '2d8', mana: '+1 de Mana quando causar dano com ataques básicos.', weapons: 'Adagas / Espada' },
    wugenji: { label: 'Wugenji', grupo: 'especial', vidaBase: 40, vidaDado: '2d8', danoDado: '2d8', mana: '+1 de Mana quando causa dano com ataques básicos.', weapons: 'Espada (Katana)' },
    pugilista: { label: 'Pugilista', grupo: 'especial', vidaBase: 50, vidaDado: '2d8', danoDado: '2d6', mana: '+1 de Mana quando causa dano com ataques básicos.', weapons: 'Manopla / Bordão' },
    // Vanguarda
    heroi: { label: 'Herói', grupo: 'vanguarda', vidaBase: 40, vidaDado: '2d8', danoDado: '2d8', mana: '+1 de Mana por ação de sua Princesa, máximo de 3 por rodada.', weapons: 'Espada / Adaga / Machado / Martelo / Lança / Manopla' },
    ferrabras: { label: 'Ferrabrás', grupo: 'vanguarda', vidaBase: 50, vidaDado: '2d8', danoDado: '2d6', mana: '+1 de Mana ao Evadir um ataque.', weapons: 'Espada / Adaga / Lança / Bordão' },
    uhlan: { label: 'Uhlan', grupo: 'vanguarda', vidaBase: 50, vidaDado: '2d8', danoDado: '2d6', mana: '+1 de Mana quando recebe dano.', weapons: 'Lança' },
    vingador: { label: 'Vingador', grupo: 'vanguarda', vidaBase: 40, vidaDado: '2d8', danoDado: '2d8', mana: '+1 de Mana quando receber dano.', weapons: 'Espada / Adaga / Machado / Martelo / Lança / Bordão / Maça / Manopla' },
    centuriao: { label: 'Centurião', grupo: 'vanguarda', vidaBase: 60, vidaDado: '2d10', danoDado: '2d4', mana: '+1 de Mana quando receber dano.', weapons: 'Espada / Lança / Machado / Martelo / Bordão / Maça / Escudo' }
};

GRANBLUE.classGroups = {
    conjurador: 'GRANBLUE.ClassGroups.conjurador',
    especial: 'GRANBLUE.ClassGroups.especial',
    vanguarda: 'GRANBLUE.ClassGroups.vanguarda'
};

/* -------------------------------------------- */
/*  Heranças (Raças)                            */
/* -------------------------------------------- */

/** Heranças com seus bônus de atributo-chave (referência; aplicação manual por ora). */
GRANBLUE.heritages = {
    eranko: { label: 'Eranko', bonus: { percepcao: 2, precisao: 1, reacao: 1 } },
    oni: { label: 'Oni', bonus: { potencia: 2, carisma: 1, forca: 1 } },
    tita: { label: 'Titã', bonus: { resiliencia: 2, forca: 2, reacao: -1 } },
    elven: { label: 'Elven', bonus: { sabedoria: 2, potencia: 1, disciplina: 1 } },
    pixelatte: { label: 'Pixelatte', bonus: { reacao: 2, carisma: 1, precisao: 1 } },
    dracunSquama: { label: 'Dracun Squama', bonus: { forca: 2, resiliencia: 1, potencia: 1 } },
    sage: { label: 'Sage', bonus: { precisao: 1, resiliencia: 1, disciplina: 1, sabedoria: 1 } },
    deva: { label: 'Deva', bonus: { carisma: 2, sabedoria: 1, percepcao: 1 } }
};

/* -------------------------------------------- */
/*  Adversários                                 */
/* -------------------------------------------- */

GRANBLUE.adversaryDifficulties = {
    normal: 'GRANBLUE.Adversary.difficulty.normal',
    intermediaria: 'GRANBLUE.Adversary.difficulty.intermediaria',
    dificil: 'GRANBLUE.Adversary.difficulty.dificil',
    lendaria: 'GRANBLUE.Adversary.difficulty.lendaria'
};

GRANBLUE.adversaryTypes = {
    comum: 'GRANBLUE.Adversary.type.comum',
    tank: 'GRANBLUE.Adversary.type.tank',
    boss: 'GRANBLUE.Adversary.type.boss',
    eliteBoss: 'GRANBLUE.Adversary.type.eliteBoss'
};

/* -------------------------------------------- */
/*  Status Effects (Condições)                  */
/* -------------------------------------------- */

/**
 * Condições do sistema Granblue. Ícones usam SVGs do core do Foundry
 * (sempre presentes em qualquer instalação).
 */
GRANBLUE.statusEffects = [
    { id: 'poison', name: 'GRANBLUE.Effects.poison', img: 'icons/svg/poison.svg' },
    { id: 'antiheal', name: 'GRANBLUE.Effects.antiheal', img: 'icons/svg/degen.svg' },
    { id: 'burn', name: 'GRANBLUE.Effects.burn', img: 'icons/svg/fire.svg' },
    { id: 'frost', name: 'GRANBLUE.Effects.frost', img: 'icons/svg/frozen.svg' },
    { id: 'freeze', name: 'GRANBLUE.Effects.freeze', img: 'icons/svg/ice-aura.svg' },
    { id: 'paralysis', name: 'GRANBLUE.Effects.paralysis', img: 'icons/svg/paralysis.svg' },
    { id: 'blind', name: 'GRANBLUE.Effects.blind', img: 'icons/svg/blind.svg' },
    { id: 'knockdown', name: 'GRANBLUE.Effects.knockdown', img: 'icons/svg/falling.svg' },
    { id: 'knockup', name: 'GRANBLUE.Effects.knockup', img: 'icons/svg/upgrade.svg' },
    { id: 'soak', name: 'GRANBLUE.Effects.soak', img: 'icons/svg/acid.svg' },
    { id: 'sneeze', name: 'GRANBLUE.Effects.sneeze', img: 'icons/svg/aura.svg' },
    { id: 'sleep', name: 'GRANBLUE.Effects.sleep', img: 'icons/svg/sleep.svg' },
    { id: 'confuse', name: 'GRANBLUE.Effects.confuse', img: 'icons/svg/daze.svg' },
    { id: 'charged', name: 'GRANBLUE.Effects.charged', img: 'icons/svg/lightning.svg' },
    { id: 'curse', name: 'GRANBLUE.Effects.curse', img: 'icons/svg/skull.svg' },
    { id: 'wildness', name: 'GRANBLUE.Effects.wildness', img: 'icons/svg/terror.svg' },
    { id: 'slow', name: 'GRANBLUE.Effects.slow', img: 'icons/svg/downgrade.svg' },
    { id: 'bleeding', name: 'GRANBLUE.Effects.bleeding', img: 'icons/svg/blood.svg' },
    { id: 'chained', name: 'GRANBLUE.Effects.chained', img: 'icons/svg/net.svg' },
    { id: 'insight', name: 'GRANBLUE.Effects.insight', img: 'icons/svg/eye.svg' },
    { id: 'venom', name: 'GRANBLUE.Effects.venom', img: 'icons/svg/biohazard.svg' },
    { id: 'bomb', name: 'GRANBLUE.Effects.bomb', img: 'icons/svg/explosion.svg' },
    { id: 'petrify', name: 'GRANBLUE.Effects.petrify', img: 'icons/svg/stoned.svg' },
    { id: 'bio', name: 'GRANBLUE.Effects.bio', img: 'icons/svg/hazard.svg' },
    { id: 'rust', name: 'GRANBLUE.Effects.rust', img: 'icons/svg/downgrade.svg' },
    { id: 'silence', name: 'GRANBLUE.Effects.silence', img: 'icons/svg/silenced.svg' },
    { id: 'stun', name: 'GRANBLUE.Effects.stun', img: 'icons/svg/daze.svg' },
    { id: 'forget', name: 'GRANBLUE.Effects.forget', img: 'icons/svg/black-hole.svg' },
    { id: 'fear', name: 'GRANBLUE.Effects.fear', img: 'icons/svg/terror.svg' },
    { id: 'charm', name: 'GRANBLUE.Effects.charm', img: 'icons/svg/heal.svg' },
    { id: 'nightmare', name: 'GRANBLUE.Effects.nightmare', img: 'icons/svg/deaf.svg' },
    { id: 'impeto', name: 'GRANBLUE.Effects.impeto', img: 'icons/svg/upgrade.svg' },
    { id: 'darkness', name: 'GRANBLUE.Effects.darkness', img: 'icons/svg/black-hole.svg' },
    { id: 'imortal', name: 'GRANBLUE.Effects.imortal', img: 'icons/svg/angel.svg' },
    { id: 'radiance', name: 'GRANBLUE.Effects.radiance', img: 'icons/svg/sun.svg' }
];
