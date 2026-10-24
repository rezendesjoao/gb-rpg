# Granblue — Sistema para Foundry VTT

Sistema de RPG homebrew **Granblue** para o Foundry VTT (v13/v14). Construído do zero,
com a estrutura do sistema Daggerheart usada apenas como referência.

## Mecânica

- **Rolagem base:** `3d6 + (atributo + bônus)` para todos os testes.
- **9 Atributos:** Força, Precisão, Reação, Resiliência, Percepção, Carisma, Sabedoria, Potência, Disciplina.
- **Derivados:**
  - CA = `10 + Reação + bônus`
  - Energia Vital (máx) = `vida base + (Resiliência × 3) + dado de vida + vida temp`
  - Mana (máx) = `Sabedoria × 2`
- **Dificuldades:** 8 / 10 / 13 / 16 / 21 / 24 / 27 — testes de Mana somam +5 (Shift ao clicar no atributo).
- **Ranks:** D1 → S10. **15 classes** (Estilos de Guerreiro) e **8 heranças** (seleção na ficha).
- **7 Esferas de magia** com contagem de pontos (começa com 5).
- **~35 status effects** clicáveis no token.

## O que está implementado

- Ficha de **Personagem** completa (atributos, recursos, esferas, progressos, biografia, ações),
  com a **arte do personagem em painel lateral** (clique para trocar, lupa para ver em tamanho real).
- Aba **Magia**: cada esfera é um grupo com seus pontos e as **suas próprias magias**, criadas e
  roladas ali mesmo (a aba *Ações* fica só com ataques e manobras não-mágicas).
- Aba **Inventário**: itens por categoria (armas, equipamento defensivo, consumíveis, materiais,
  tesouros), com quantidade, Tier, Qualidade, peso, valor e marcação de *equipado* — lista pura,
  sem rolagens.
- Ficha de **Adversário / NPC** com a mesma **arte em painel lateral** do personagem e as abas
  Estatísticas, Ataques, **Magia** (as mesmas esferas do personagem), **Loot** e **Biografia** (os
  mesmos campos da biografia do personagem, mais descrição e notas). Dois ícones no cabeçalho (o escolhido
  fica aceso em dourado) separam o **monstro** do **personagem antagonista**, que ganha classe, herança
  e a aba Classe & Herança.
  As Estatísticas mostram os **pontos de atributo** distribuídos/restantes (igual ao personagem) e
  **três caixas de vantagem e três de desvantagem**, cada uma com botão de enviar ao chat.
- **RD física e RD mágica**, cada uma com **fixa + bônus + temporária = total**, no personagem e no
  adversário. O botão de dano do cartão de chat abate a RD da **natureza do dano** escolhida na ação
  (física ou mágica; as magias começam como mágicas); Shift+clique = dano verdadeiro.
- **Alcance simples ou complexo** em ações e magias: o simples é só a distância em metros; o
  complexo é uma **área a × b** (paralelogramo, círculo ou cone, em metros). Ao rolar, depois do
  diálogo de bônus, um pop-up oferece **posicionar a área no mapa** (Região do Foundry v14: roda do
  mouse gira, clique confirma); os tokens dentro dela viram alvos e o acerto é conferido contra a CA
  de cada um. Há também um botão na linha da ação para só posicionar a área. As 57 magias do
  compêndio que descrevem uma área ("3x3", "linha de 1x6", "cone de 5 m") já vêm com ela preenchida.
- **HUD de ações**, só durante o combate, acima da barra de macros, para o token controlado (o
  mestre troca clicando nos tokens; o jogador só vê os seus, ou o próprio personagem). O destaque é
  a **linha do tempo do turno** — movimentação → ação rápida → ação normal → ação bônus → reação —
  com as exceções à parte: **conjunta** (une a rápida e a normal) e **total** (usa todas as ações do
  turno). Clicar numa ação disponível lista as habilidades daquele tipo (ações, magias, habilidades
  de classe e de herança, itens do inventário) com custo, alcance, efeito, CD e dano; a ação normal
  também lista o que se faz com uma ação rápida. Usar uma delas gasta a ação. Abaixo, compactos:
  vida e **vida temporária** ajustável, mana (**+1** para a condição de Mana da classe), CA, RD
  física e mágica e deslocamento com bônus ajustável, e visão. A **estrela** na linha de uma ação marca o
  **ataque básico**, rolado pelo HUD ao custo de uma ação normal. As ações voltam no começo do
  turno do combatente (ou pelo botão de reiniciar). Pode ser desligado em *Configurações*.
- **Efeitos aplicados por todos:** um jogador aplica um status effect até num monstro do mestre —
  o pedido vai pelo socket e o mestre conectado aplica.
- **Alvos x CA:** com um token marcado como alvo (tecla **T**), o cartão de ataque/magia confere o
  acerto contra a CA de cada alvo e mostra *Acertou/Errou* (a CA do monstro só o mestre vê) e botões
  de aplicar dano/efeito direto em cada alvo. Sem token selecionado, os botões do rodapé usam os
  alvos atingidos. Magias com Dificuldade numérica também mostram *Conjuração · CD X: sucesso/falha*.
  Empate com a CA acerta (dá para mudar em *Configurações → Granblue*).
- O cartão de ataque mostra a **descrição** da ação, o texto do **efeito** e o resumo da regra do
  **status effect** aplicado (Burn, Frost…), que também vai para o efeito colocado no token.
- **Habilidades passivas:** ataques, manobras e magias podem ser do tipo *Passiva* (só um texto maior
  e rolável, com botão de enviar ao chat) ou ativas com **passiva anexada** (*Possui passiva*: um texto
  a mais, também com botão de chat). Vale para o item Magia do compêndio — útil para itens mágicos.
- Na aba **Classe & Herança**, cada habilidade de classe, traço, debilidade e progresso tem um botão
  que mostra no chat o que ele faz.
- **Loot do adversário:** cada espólio tem chance, quantidade (fórmula, ex. `1d3`) e até qual
  qualidade pode chegar. O mestre clica em *Enviar rolagem de loot aos jogadores*: cada jogador
  recebe um pop-up só com a **chance** de cada espólio (sem o nome) e o d100; quem tirar igual ou
  menos consegue o item e gira a quantidade e a qualidade (d100: Boa ≤50, Rara ≤25, Primorosa ≤12,
  Matéria-prima ≤5, limitada à qualidade máxima) e pode guardar direto no inventário. A dificuldade
  do encontro soma o bônus de drop (+10/+20/+30%), editável no envio.
- **Atualização automática das fichas:** ao abrir o mundo depois de atualizar o sistema, o mestre grava
  em todas as fichas (do mundo e dos compêndios do mundo) os campos novos, sem apagar nada.
- **Classes e Heranças como Items** com **Active Effects automáticos**: a Herança soma os bônus
  de atributo automaticamente; a Classe define a Energia Vital base e os dados de vida/dano.
  Basta escolher no seletor da ficha (as 15 classes e as 8 heranças) — o item, o efeito **e as
  habilidades** (3 skills da classe; traço, debilidade e 3 progressos da herança) são criados
  sozinhos, com o mesmo conteúdo do compêndio. Também é possível editá-los abrindo o item.
- Rolagens de atributo (3d6) e de ações com **cartão de chat** (mostra cada dado) e botões de
  **Dano/Cura/Efeito** que aplicam no token selecionado.
- **Efeito aplicado** por ação/magia: cada ataque, manobra ou magia escolhe um dos ~35 status
  effects do sistema num seletor e ganha um botão de varinha que o aplica nos tokens
  selecionados — na caixa da ação e também no cartão de chat da rolagem.
- **Ações colapsáveis**, com dado rápido (rola acerto+dano) e arrastáveis para a barra de macros.
- Botão para rolar o **dado de vida** da classe.
- Iniciativa `3d6 + Reação`. Status effects Granblue no HUD do token.

### Compêndio (arraste para a ficha)
Os itens já vêm prontos nos compêndios **Granblue** — arraste para a ficha do personagem:
- **Classes — as 15 completas:** organizadas em pastas por grupo (Conjurador, Especial, Vanguarda)
  dentro do compêndio **Granblue — Classes**. Cada estilo traz Energia Vital base, dado de vida,
  dado de dano, armas, condição de ganho de Mana e **as 3 habilidades** (passiva/ativa) com o
  texto completo, e aplica o Active Effect da Energia Vital base.
- **Heranças — as 8 completas:** Eranko, Oni, Titã, Elven, Pixelatte, Dracun Squama, Sage e Deva,
  cada uma com **traço compartilhado, debilidade e os 3 progressos** (com o requisito de atributo),
  aplicando os bônus de atributo automaticamente.
  O mesmo conteúdo vem pelo **seletor de classe/herança no topo da ficha** — as duas rotas usam a
  mesma fonte (`module/content/`). Consulta rápida: [CLASSES-HERANCAS-REFERENCIA.md](CLASSES-HERANCAS-REFERENCIA.md).
- **Magias — as 189 completas:** as **7 esferas × 3 arcanos × 9 níveis**, organizadas em pastas
  (`Esfera → Arcano`) dentro do compêndio **Granblue — Magias**:
  Energia (Arcana, Barreira, Cura) · Destruição (Eletricidade, Calor, Frio) ·
  Criação (Céu, Terra, Água) · Matéria (Planta, Areia, Metal) ·
  Persona (Psíquica, Ki, Espírito) · Cosmo (Sol, Estrela, Lua) ·
  Proibida (Tempo, Espaço, Trevas).
  Cada magia já vem com **custo, alcance, conjuração, dificuldade, acerto `3d6 + @disciplina`,
  fórmula de dano/cura, efeito resumido e a citação de conjuração** — e, nas 78 que aplicam um
  status effect, com o **efeito já selecionado** (Burn, Frost, Curse, Charged…). Ao arrastar para
  a ficha, a magia entra na aba **Magia**, dentro da esfera dela, pronta para rolar e aplicar.

As ações (ataques/magias/manobras) são linhas livres na ficha: você digita a fórmula de
acerto e dano usando atalhos como `@forca`, `@precisao`, `@sabedoria`, `@nivel`, `@ca`.
Ex.: acerto `3d6 + @precisao`, dano `2d8 + @forca`.

## Instalação

1. Copie **esta pasta** (`granblue`) para dentro do diretório de dados do Foundry, em
   `Data/systems/`, de modo que o caminho final seja `.../Data/systems/granblue/system.json`.
2. Reinicie o Foundry.
3. Crie um novo Mundo (World) escolhendo o sistema **Granblue**.

## Roadmap (próximas iterações)

- Compêndios de itens e adversários prontos (magias, classes e heranças já estão completas).
- Acúmulos de status effect (hoje o botão aplica/mantém o efeito, sem contar pilhas).

## Licença

Conteúdo homebrew de Granblue pertence ao seu autor. Código do sistema é original.
