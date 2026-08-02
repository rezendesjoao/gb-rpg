/**
 * Granblue — ponto de entrada do sistema.
 * Registra document classes, data models, fichas, status effects e helpers.
 */

import { GRANBLUE } from './config.mjs';
import { GranblueActor } from './documents/actor.mjs';
import { GranblueCharacter } from './data/actor-character.mjs';
import { GranblueAdversary } from './data/actor-adversary.mjs';
import { GranblueCharacterSheet } from './sheets/actor-character-sheet.mjs';
import { GranblueAdversarySheet } from './sheets/actor-adversary-sheet.mjs';

/* -------------------------------------------- */
/*  Init                                        */
/* -------------------------------------------- */

Hooks.once('init', () => {
    console.log('Granblue | Inicializando o sistema Granblue');

    // Namespace de conveniência
    CONFIG.GRANBLUE = GRANBLUE;
    game.granblue = {
        config: GRANBLUE,
        documents: { GranblueActor },
        applications: { GranblueCharacterSheet, GranblueAdversarySheet }
    };

    // Document class
    CONFIG.Actor.documentClass = GranblueActor;

    // Data models
    CONFIG.Actor.dataModels.character = GranblueCharacter;
    CONFIG.Actor.dataModels.adversary = GranblueAdversary;

    // Barra de recursos / iniciativa
    CONFIG.Combat.initiative = { formula: '3d6 + @attributes.reacao.total', decimals: 0 };

    // Registro das fichas (ApplicationV2)
    const { Actors } = foundry.documents.collections;
    Actors.registerSheet('granblue', GranblueCharacterSheet, {
        types: ['character'],
        makeDefault: true,
        label: 'GRANBLUE.SheetLabels.character'
    });
    Actors.registerSheet('granblue', GranblueAdversarySheet, {
        types: ['adversary'],
        makeDefault: true,
        label: 'GRANBLUE.SheetLabels.adversary'
    });

    // Pré-carrega o template do cartão de chat
    foundry.applications.handlebars.loadTemplates([
        'systems/granblue/templates/chat/roll-card.hbs'
    ]);

    registerHandlebarsHelpers();
});

/* -------------------------------------------- */
/*  i18nInit — status effects localizados       */
/* -------------------------------------------- */

Hooks.once('i18nInit', () => {
    CONFIG.statusEffects = GRANBLUE.statusEffects.map((e) => ({
        id: e.id,
        img: e.img,
        name: game.i18n.localize(e.name)
    }));
    // Condição especial padrão de "morto" continua disponível
    CONFIG.specialStatusEffects ??= {};
});

/* -------------------------------------------- */
/*  Ready                                        */
/* -------------------------------------------- */

Hooks.once('ready', () => {
    console.log('Granblue | Sistema pronto');
});

/* -------------------------------------------- */
/*  Helpers                                      */
/* -------------------------------------------- */

function registerHandlebarsHelpers() {
    Handlebars.registerHelper('granblueSigned', (value) => {
        const n = Number(value) || 0;
        return n >= 0 ? `+${n}` : `${n}`;
    });
}
