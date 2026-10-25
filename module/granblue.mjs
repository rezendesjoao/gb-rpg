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
import { GranblueSpell } from './data/item-spell.mjs';
import { GranblueCharacterSheet } from './sheets/actor-character-sheet.mjs';
import { GranblueAdversarySheet } from './sheets/actor-adversary-sheet.mjs';
import { GranblueClassSheet } from './sheets/item-class-sheet.mjs';
import { GranblueHeritageSheet } from './sheets/item-heritage-sheet.mjs';
import { GranblueSpellSheet } from './sheets/item-spell-sheet.mjs';
import { onRenderChatMessage } from './chat.mjs';
import { SOCKET, onSocketMessage, sendLootDialog } from './loot.mjs';
import { onEffectSocket } from './effects.mjs';
import { GranblueHUD, registerHudSettings, initHud } from './hud.mjs';
import { onUpdateCombat, resetCombatants } from './economy.mjs';
import { registerMigrationSettings, migrateIfNeeded, migrateWorld } from './migration.mjs';
import { sigilSVG, sphereEmblemSVG, dieFaceHTML } from './sigil.mjs';

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
        applications: { GranblueCharacterSheet, GranblueAdversarySheet, GranblueHUD },
        sendLootDialog,
        migrateWorld,
        // Selos procedurais (para macros e módulos): game.granblue.sigil({ name, sphere, arcano, level })
        sigil: sigilSVG,
        sphereEmblem: sphereEmblemSVG
    };

    // Document classes
    CONFIG.Actor.documentClass = GranblueActor;
    CONFIG.Item.documentClass = GranblueItem;

    // Data models
    CONFIG.Actor.dataModels.character = GranblueCharacter;
    CONFIG.Actor.dataModels.adversary = GranblueAdversary;
    CONFIG.Item.dataModels.class = GranblueClass;
    CONFIG.Item.dataModels.heritage = GranblueHeritage;
    CONFIG.Item.dataModels.spell = GranblueSpell;

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
    Items.registerSheet('granblue', GranblueSpellSheet, {
        types: ['spell'],
        makeDefault: true,
        label: 'GRANBLUE.SheetLabels.spell'
    });

    // Pré-carrega os templates de chat (o de rolagem usa o partial parts/roll)
    foundry.applications.handlebars.loadTemplates([
        'systems/granblue/templates/chat/roll-card.hbs',
        'systems/granblue/templates/chat/parts/roll.hbs',
        'systems/granblue/templates/chat/description-card.hbs',
        'systems/granblue/templates/chat/loot-card.hbs'
    ]);

    registerSettings();
    registerHandlebarsHelpers();
});

/** Configurações do sistema (mundo). */
function registerSettings() {
    registerMigrationSettings();
    registerHudSettings();
    game.settings.register('granblue', 'hitOnTie', {
        name: 'GRANBLUE.Settings.hitOnTie.name',
        hint: 'GRANBLUE.Settings.hitOnTie.hint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
    });
}

/* -------------------------------------------- */
/*  i18nInit — status effects localizados       */
/* -------------------------------------------- */

Hooks.once('i18nInit', () => {
    CONFIG.statusEffects = GRANBLUE.statusEffects.map((e) => ({
        id: e.id,
        img: e.img,
        name: game.i18n.localize(e.name),
        // Vai para o Active Effect criado no token (aparece na ficha do efeito)
        description: game.i18n.localize(e.description)
    }));
    // Condição especial padrão de "morto" continua disponível
    CONFIG.specialStatusEffects ??= {};
});

/* -------------------------------------------- */
/*  Ready                                        */
/* -------------------------------------------- */

Hooks.once('ready', async () => {
    // Pop-ups de loot enviados pelo mestre (ver loot.mjs)
    game.socket.on(SOCKET, onSocketMessage);
    // Efeitos pedidos por jogadores em tokens que eles não controlam
    game.socket.on(SOCKET, onEffectSocket);
    await migrateIfNeeded();
    // HUD de ações do token controlado (ver hud.mjs)
    initHud();
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
/*  Cartões de chat: dano/cura/efeito, alvos     */
/* -------------------------------------------- */

Hooks.on('renderChatMessageHTML', onRenderChatMessage);

/* -------------------------------------------- */
/*  Combate: libera as ações a cada turno        */
/* -------------------------------------------- */

Hooks.on('updateCombat', onUpdateCombat);
Hooks.on('combatStart', resetCombatants);
Hooks.on('deleteCombat', resetCombatants);

/* -------------------------------------------- */
/*  Helpers                                      */
/* -------------------------------------------- */

function registerHandlebarsHelpers() {
    Handlebars.registerHelper('granblueSigned', (value) => {
        const n = Number(value) || 0;
        return n >= 0 ? `+${n}` : `${n}`;
    });
    Handlebars.registerHelper('eqStr', (a, b) => String(a) === String(b));
    // Natureza do dano efetiva de uma linha (ver GRANBLUE.damageNature)
    Handlebars.registerHelper('gbDamageNature', (row, spell) => GRANBLUE.damageNature(row, { spell: spell === true }));
    // Face de um dado rolado nos cartões de chat (pips no d6)
    Handlebars.registerHelper('gbDie', (faces, value) => new Handlebars.SafeString(dieFaceHTML(faces, value)));
}
