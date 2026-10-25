/**
 * Journals (e os handouts mostrados aos jogadores) com o visual do sistema.
 *
 * A janela do journal é uma sheet do Granblue, padrão para os journals do
 * mundo: ela já nasce com as classes do sistema e o tema claro do Foundry, sem
 * piscar no tema escuro. As páginas exibidas dentro dela herdam o visual da
 * janela (o Foundry tira as classes delas ao embuti-las); as páginas abertas
 * numa janela própria (edição, página avulsa) e o visualizador de imagem (os
 * handouts mostrados aos jogadores) ganham as mesmas classes antes de a moldura
 * ser criada. Estilos em styles/journal.css.
 */

const { JournalEntrySheet } = foundry.applications.sheets.journal;

/** Classes que vestem uma janela com o visual do sistema. */
const JOURNAL_CLASSES = ['granblue', 'themed', 'theme-light', 'gb-journal'];

export class GranblueJournalSheet extends JournalEntrySheet {
    static DEFAULT_OPTIONS = {
        classes: JOURNAL_CLASSES
    };
}

/**
 * Hooks preRender da página avulsa e do visualizador de imagem: a janela já
 * nasce vestida (a moldura sai das classes das opções, criada logo depois).
 */
export function dressJournalWindow(app, context, options) {
    if (!options.isFirstRender || !app.hasFrame) return;
    const { classes } = app.options;
    classes.push(...JOURNAL_CLASSES.filter((c) => !classes.includes(c)));
    if (classes.includes('theme-dark')) classes.splice(classes.indexOf('theme-dark'), 1);
}
