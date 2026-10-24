/**
 * Migração do mundo para o modelo de ficha atual.
 *
 * Os data models já completam sozinhos, em memória, os campos que uma ficha
 * antiga não tem (RD, biografia do adversário, quantidade/qualidade do loot,
 * opções de passiva) e convertem os que mudaram de forma (a RD única virou
 * física + mágica, a vantagem única virou três caixas, o alcance em texto
 * virou metros — ver migrateData nos data models). Esta migração grava esses
 * campos no banco do mundo uma única vez, para que todas as fichas fiquem de
 * fato no modelo novo.
 *
 * Ela só ESCREVE os campos novos, sempre com o valor que a ficha já mostra —
 * nada existente é apagado ou alterado. Tokens não vinculados não são tocados:
 * herdam do ator base e recebem os padrões em memória.
 */

/** Versão do modelo de dados. Aumente quando houver uma nova migração. */
export const MIGRATION_VERSION = 3;

export function registerMigrationSettings() {
    game.settings.register('granblue', 'migrationVersion', {
        scope: 'world',
        config: false,
        type: Number,
        default: 0
    });
}

/** Roda a migração se o mundo estiver numa versão anterior (só o mestre ativo). */
export async function migrateIfNeeded() {
    if (!game.user.isActiveGM) return;
    const current = game.settings.get('granblue', 'migrationVersion') ?? 0;
    if (current >= MIGRATION_VERSION) return;
    await migrateWorld();
    await game.settings.set('granblue', 'migrationVersion', MIGRATION_VERSION);
}

/**
 * Campos novos de um ator, com o valor atual da ficha (fonte já completada
 * com os padrões). Listas são reescritas inteiras, linha por linha, com os
 * mesmos dados e só os campos novos acrescentados.
 */
function actorUpdateData(actor) {
    const src = actor._source.system;
    const update = {
        'system.defenses.rd': src.defenses.rd,
        'system.movementBonus': src.movementBonus
    };
    if (Array.isArray(src.actions)) update['system.actions'] = src.actions;
    if (Array.isArray(src.spells)) update['system.spells'] = src.spells;
    if (actor.type === 'character') {
        if (Array.isArray(src.inventory)) update['system.inventory'] = src.inventory;
    }
    if (actor.type === 'adversary') {
        update['system.kind'] = src.kind;
        update['system.biography'] = src.biography;
        update['system.spheres'] = src.spheres;
        update['system.advantages'] = src.advantages;
        update['system.disadvantages'] = src.disadvantages;
        if (Array.isArray(src.loot)) update['system.loot'] = src.loot;
    }
    return foundry.utils.deepClone(update);
}

/** Grava os campos novos de uma lista de atores; devolve quantos foram atualizados. */
async function migrateActors(actors) {
    let count = 0;
    for (const actor of actors) {
        if (!['adversary', 'character'].includes(actor.type)) continue;
        try {
            // diff:false força a gravação mesmo quando o valor em memória já é o mesmo.
            await actor.update(actorUpdateData(actor), { diff: false, render: false });
            count++;
        } catch (err) {
            console.error(`Granblue | Falha ao migrar ${actor.name} (${actor.uuid}):`, err);
        }
    }
    return count;
}

/** Migra os atores do mundo e os compêndios de atores do próprio mundo. */
export async function migrateWorld() {
    ui.notifications?.info(game.i18n.localize('GRANBLUE.Migration.start'), { permanent: false });
    let adversaries = game.actors.filter((a) => a.type === 'adversary').length;
    let total = await migrateActors(game.actors.contents);

    for (const pack of game.packs) {
        if (pack.documentName !== 'Actor' || pack.metadata.packageType !== 'world') continue;
        const wasLocked = pack.locked;
        try {
            if (wasLocked) await pack.configure({ locked: false });
            const docs = await pack.getDocuments();
            adversaries += docs.filter((a) => a.type === 'adversary').length;
            total += await migrateActors(docs);
        } catch (err) {
            console.error(`Granblue | Falha ao migrar o compêndio ${pack.collection}:`, err);
        } finally {
            if (wasLocked) await pack.configure({ locked: true });
        }
    }

    console.log(`Granblue | Migração ${MIGRATION_VERSION}: ${total} ficha(s) atualizada(s).`);
    ui.notifications?.info(game.i18n.format('GRANBLUE.Migration.done', { total, adversaries }), { permanent: true });
}
