/**
 * Granblue — ponto de entrada do sistema.
 * Registra document classes, data models, fichas, status effects e helpers.
 */

import { GRANBLUE } from './config.mjs';
import { GranblueActor } from './documents/actor.mjs';
import { GranblueItem } from './documents/item.mjs';
import { GranblueCharacter } from './data/actor-character.mjs';
import { GranblueAdversary } from './data/actor-adversary.mjs';
import { GranblueClass } from './data/item-class.mjs';
import { GranblueHeritage } from './data/item-heritage.mjs';
import { GranblueCharacterSheet } from './sheets/actor-character-sheet.mjs';
import { GranblueAdversarySheet } from './sheets/actor-adversary-sheet.mjs';
import { GranblueClassSheet } from './sheets/item-class-sheet.mjs';
import { GranblueHeritageSheet } from './sheets/item-heritage-sheet.mjs';

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

    // Document classes
    CONFIG.Actor.documentClass = GranblueActor;
    CONFIG.Item.documentClass = GranblueItem;

    // Data models
    CONFIG.Actor.dataModels.character = GranblueCharacter;
    CONFIG.Actor.dataModels.adversary = GranblueAdversary;
    CONFIG.Item.dataModels.class = GranblueClass;
    CONFIG.Item.dataModels.heritage = GranblueHeritage;

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

    const { Items } = foundry.documents.collections;
    Items.registerSheet('granblue', GranblueClassSheet, {
        types: ['class'],
        makeDefault: true,
        label: 'GRANBLUE.SheetLabels.class'
    });
    Items.registerSheet('granblue', GranblueHeritageSheet, {
        types: ['heritage'],
        makeDefault: true,
        label: 'GRANBLUE.SheetLabels.heritage'
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
/*  Arrastar ação → macro na barra de atalhos    */
/* -------------------------------------------- */

Hooks.on('hotbarDrop', (bar, data, slot) => {
    if (data?.type !== 'granblueAction') return;
    createActionMacro(data, slot);
    return false; // impede o comportamento padrão do Foundry
});

async function createActionMacro(data, slot) {
    const command =
        `const actor = await fromUuid(${JSON.stringify(data.actorUuid)});\n` +
        `if (actor) actor.rollActionByName(${JSON.stringify(data.actionName)});\n` +
        `else ui.notifications.warn("Granblue: ator não encontrado para esta ação.");`;
    try {
        let macro = game.macros.find((m) => m.name === data.actionName && m.command === command);
        if (!macro) {
            macro = await Macro.create({
                name: data.actionName,
                type: 'script',
                img: 'icons/svg/d20.svg',
                command,
                flags: { granblue: { actionMacro: true } }
            });
        }
        await game.user.assignHotbarMacro(macro, slot);
    } catch (err) {
        ui.notifications?.error('Granblue: não foi possível criar a macro (permissão de script?).');
        console.error('Granblue | Erro ao criar macro de ação:', err);
    }
}

/* -------------------------------------------- */
/*  Helpers                                      */
/* -------------------------------------------- */

function registerHandlebarsHelpers() {
    Handlebars.registerHelper('granblueSigned', (value) => {
        const n = Number(value) || 0;
        return n >= 0 ? `+${n}` : `${n}`;
    });
    Handlebars.registerHelper('eqStr', (a, b) => String(a) === String(b));
}
