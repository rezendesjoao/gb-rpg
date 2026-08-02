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

- Ficha de **Personagem** completa (atributos, recursos, esferas, progressos, biografia, ações).
- Ficha de **Adversário / NPC** (estatísticas, ataques, loot, notas).
- **Classes e Heranças como Items** com **Active Effects automáticos**: a Herança soma os bônus
  de atributo automaticamente; a Classe define a Energia Vital base e os dados de vida/dano.
  Basta escolher no seletor da ficha (presets das 15 classes e 8 heranças) — os itens e efeitos
  são criados sozinhos. Também é possível editá-los abrindo o item.
- Rolagens de atributo (3d6) e de ações (fórmulas livres) com **cartão de chat** e escada de DCs.
- Botão para rolar o **dado de vida** da classe.
- Iniciativa `3d6 + Reação`. Status effects Granblue no HUD do token.

As ações (ataques/magias/manobras) são linhas livres na ficha: você digita a fórmula de
acerto e dano usando atalhos como `@forca`, `@precisao`, `@sabedoria`, `@nivel`, `@ca`.
Ex.: acerto `3d6 + @precisao`, dano `2d8 + @forca`.

## Instalação

1. Copie **esta pasta** (`granblue`) para dentro do diretório de dados do Foundry, em
   `Data/systems/`, de modo que o caminho final seja `.../Data/systems/granblue/system.json`.
2. Reinicie o Foundry.
3. Crie um novo Mundo (World) escolhendo o sistema **Granblue**.

## Roadmap (próximas iterações)

- Classes e heranças como **Items** que aplicam bônus/traços automaticamente (via Active Effects).
- Compêndios (magias por esfera, itens, adversários prontos).
- Aplicação automática de status effects e acúmulos.
- Automação de dano/cura no chat (aplicar em tokens).

## Licença

Conteúdo homebrew de Granblue pertence ao seu autor. Código do sistema é original.
