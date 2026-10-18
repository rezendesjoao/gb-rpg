# Granblue — Compêndio de Classes e Heranças

**15 classes** (Estilos de Guerreiro) × 3 habilidades · **8 heranças** (Raças) com traço, debilidade e 3 progressos.

Arraste da aba *Compêndios → Granblue — Classes / Granblue — Heranças* para a ficha, ou escolha no
seletor no topo da ficha de personagem — nos dois caminhos as habilidades vêm junto e o Active Effect
(Energia Vital base da classe, bônus de atributo da herança) é aplicado sozinho.

Fonte dos dados: `module/content/classes.mjs` e `module/content/heritages.mjs`.

## Classes

### Conjurador

| Classe | Vida | Dado de vida | Dano | Armas | Ganho de Mana |
|---|---:|---|---|---|---|
| Artista | 40 | 2d6 | 2d8 | Adagas / Espadas (arremessadas; alcance especial 4 para mod. de Percepção) | +1 de Mana cada vez que confere uma melhoria a um aliado. |
| Ragda | 40 | 2d6 | 2d6 | Adaga / Cajado / Grimório / Anel | +1 de Mana quando inflige um efeito negativo com sucesso a um alvo. |
| Escriba | 40 | 2d4 | 2d6 | Pena / Caneta (arma especial, alcance 4) | +1 de Mana cada vez que é bem-sucedido em um teste de Disciplina. |
| Samaritano | 40 | 2d6 | 2d6 | Adaga / Bordão / Cajado / Anel / Grimório | +1 de Mana quando cura um alvo. |
| Taumaturgo | 40 | 2d6 | 2d6 | Cajado / Grimório / Anel | +1 de Mana para cada alvo que acertar com uma magia que cause dano. |

#### Artista

Focado em ajudar seus aliados por meio de sua coreografia mágica, o Artista traz ao campo de batalha vigor e aplausos, encorajando e aprimorando as habilidades de quem luta ao seu lado. Ambas as suas armas são arremessadas ao mesmo tempo e voltam às suas mãos, juntas, como melodia e canção.

- **Performance Deslumbrante** *(ativa)*
  Usando movimentos fantásticos e fascinantes, o Artista cria uma dança a partir de uma magia de aprimoramento. Ao executar a performance, todos os aliados em uma área 3x3 são afetados por um efeito positivo à sua escolha (é preciso possuir a magia que confere esse efeito).
  O uso desta habilidade faz o feitiço custar o dobro do custo normal e soma +2 à sua dificuldade.
- **Elogios a Mil** *(passiva)*
  Quando um aliado realiza um abate dentro do seu alcance, você o enche de elogios e aplausos, enaltecendo suas habilidades e conjurando sobre ele um efeito positivo que seja uma ação rápida, desde que esteja sob o alcance da magia.
- **Graciosidade** *(passiva)*
  Devido à sua graça e leveza de movimentos, sua ação de movimento desfruta de +1 e você pode se deslocar até 2 espaços quando for bem-sucedido em uma Evasão.

#### Ragda

Portando sua máscara e seus itens sânscritos, o Ragda é especialista em trazer uma grande quantidade de efeitos negativos através de diversos rituais de feitiçaria.

- **Totem — Feitiço Macabro** *(ativa)*
  Ação rápida: implanta um totem adjacente a si mesmo, que cria uma área 3x3 e afeta todos os alvos com um efeito negativo à sua escolha (é preciso possuir a magia que confere esse efeito).
  Alvos que adentram a área devem realizar um teste de Sabedoria CD 8 + Potência ou serão afetados pelo efeito negativo.
  O Ragda pode manter até 2 focos de Feitiço Macabro ao mesmo tempo. O foco dura até 3 rodadas e deve receber os recursos do Ragda (o custo da magia) a cada manutenção para continuar existindo.
  O uso desta habilidade faz o feitiço custar o dobro do custo normal e soma +2 à sua dificuldade.
- **Mandinga Perversa** *(ativa)*
  Ação rápida: diminui em -2 o resultado final das rolagens de um inimigo à sua escolha. Apenas um inimigo pode ser alvo por vez — ao escolher outro, o efeito no anterior deixa de existir. A Mandinga só se desfaz ao se superar um teste de Sabedoria CD 8 + Potência, que decai em 2 a cada tentativa.
  Caso você seja afetado por um efeito negativo, o alvo da Mandinga contrai o mesmo efeito, a menos que seja naturalmente imune.
- **Pinturas Antigas** *(passiva)*
  Efeitos negativos duram 1 rodada a menos. Além disso, você causa +2 de dano por efeito negativo que o inimigo estiver sofrendo.

#### Escriba

Dizem que a pena é mais rápida que a espada, e para o Escriba isso pode ser uma verdade. É a única classe que pode adicionar Sabedoria ao dano da arma em mãos, disparando um símbolo mágico ao atacar. A arma não requer tinta e desenha letras da cor desejada pelo Escriba.

- **Transcrever Magia** *(ativa)*
  Ação completa: transfere as propriedades de uma magia para um pedaço de pergaminho mágico em branco.
  Pergaminhos mágicos são especiais, pois contêm os encantamentos necessários para que a magia funcione sem problemas — apenas esse tipo de papel pode ser usado, e ele pode ser comprado em lojas.
  O custo de recursos e os testes de Disciplina são feitos normalmente, e então o pergaminho é criado. Qualquer um pode ler o pergaminho, mas ainda deve gastar os recursos da magia.
  Um Escriba e seu grupo podem usar em combate um número de pergaminhos igual ao número de personagens ativos no grupo.
- **Livro Cheio** *(passiva)*
  Para cada abate realizado pelo Escriba, uma página é preenchida pela sua caneta, aumentando sua Potência e Disciplina em 1. Este efeito acumula até 3 vezes, até o final do combate.
- **Poder das Palavras** *(passiva)*
  Para cada pergaminho usado em batalha, o Escriba ganha 1 ponto de Mana.

#### Samaritano

Um guerreiro que se concentra em auxiliar seus aliados e regenerar seus ferimentos. Apenas por estar perto dele, a esperança se renova.

- **Dom da Reciprocidade** *(passiva)*
  Ao oferecer suporte a um aliado, recupera Energia Vital:
  - Curar um aliado em 10 ou mais pontos → recupera 5 de Energia Vital
  - Curar um aliado em 20 ou mais pontos → recupera 10 de Energia Vital
  - Curar um aliado em 30 ou mais pontos → recupera 15 de Energia Vital
- **Regalo** *(ativa)*
  Presenteia um montante de Mana a um aliado adjacente, ou distante em até 10 espaços de você (nesse caso a ação consome uma ação normal). O montante é escolhido pelo Samaritano, mas não pode ultrapassar o montante que ele tem no momento.
- **Círculo da Vida** *(passiva)*
  Aliados adjacentes restauram 5 de Energia Vital na manutenção da rodada. Curar dessa forma não gera Mana ao Samaritano.

#### Taumaturgo

Usando a cromologia, o guerreiro é capaz de alterar a física de suas mázzickas e ampliar seus efeitos. Lançar magias em área o fortalece com Mana, recurso necessário para conjurar feitiços ainda mais poderosos a um custo reduzido.

- **Afinidade com o Mana** *(passiva)*
  Manobras de Mana custam -1 de Mana para serem executadas. O custo mínimo de uma manobra é 1.
- **Caleidoscópio** *(ativa)*
  Ação rápida: altera o elemento da sua mázzicka para outro aleatório dentre os outros dois da mesma Esfera. Assim que a magia é sorteada, o conjurador pode redirecionar a magia para um novo alvo no alcance.
- **Sangue Mágico** *(ativa)*
  Ação conjunta: converte 5 de Mana em 5 de Energia Vital. Este efeito só pode ser aplicado em si mesmo.

### Especial

| Classe | Vida | Dado de vida | Dano | Armas | Ganho de Mana |
|---|---:|---|---|---|---|
| Caçador | 50 | 2d6 | 2d6 | Adaga / Machado / Maça / Arco / Pistola Flintlock / Rifle de Assalto / Canhoneiro | +1 de Mana cada vez que acerta um inimigo já ferido nesta rodada. |
| Franco-Atirador | 40 | 2d6 | 2d8 | Arco / Pistola Flintlock / Rifle de Assalto / Canhoneiro | +1 de Mana ao acertar um ataque básico em um inimigo. |
| Mismágier | 40 | 2d6 | 2d8 | Adagas / Espada | +1 de Mana quando causar dano com ataques básicos. |
| Wugenji | 40 | 2d8 | 2d8 | Espada (Katana) | +1 de Mana quando causa dano com ataques básicos. |
| Pugilista | 50 | 2d8 | 2d6 | Manopla / Bordão | +1 de Mana quando causa dano com ataques básicos. |

#### Caçador

Um estilo versátil que consegue causar grandes estragos tanto a curta quanto a média distância. Especialista em combater grandes criaturas e em recolher espólios com eficácia, sua energia vital é ligeiramente restaurada com a emoção de cada abate.

- **Matador de Gigantes** *(passiva)*
  Quando uma criatura grande ou maior fizer um ataque a até 3 espaços contra você (acertando ou errando), você pode atacá-la com um ataque básico normal, 1 vez por rodada. Além disso, você causa +1d de dano a criaturas que ocupem 4 espaços ou mais.
- **Carniceiro** *(passiva)*
  Ao checar um inimigo por partes, o Caçador possui 100% de chance a mais de conseguir mais espólios e 50% de chance de que estes sejam de uma categoria acima. Para cada inimigo abatido em combate, o Caçador recupera 5 de Energia Vital.
- **Explorar Fontes** *(passiva)*
  Ao avistar um ponto de exploração a 10 espaços, é possível, com um teste de Percepção, saber qual é a natureza daquele ponto (encontro, tesouro, exploração). Além disso, extrai mais materiais de pontos de exploração, somando +5 ao teste.

#### Franco-Atirador

Nada escapa da mira de um guerreiro Franco-Atirador. Com o inimigo em vista e munição em sua arma, o alvo será caçado até a morte.

- **Tiro Calculado** *(ativa)*
  Concentrando-se por rodadas completas, o guerreiro pode atingir diversos alvos com sua arma:
  - 1 rodada: ataca 2 alvos, +5 de dano final, +5 de acerto final, +2 de alcance
  - 2 rodadas: ataca até 3 alvos, +15 de dano final, +10 de acerto, +4 de alcance
  - 3 rodadas: ataca até 4 alvos, +30 de dano final, +15 de acerto, +6 de alcance
- **Repetidor** *(passiva)*
  Aumenta o dano causado a um alvo atacado múltiplas vezes pelo guerreiro:
  - Atacado pela 2ª vez: +2 de dano
  - Atacado pela 3ª vez: +5 de dano
  - Atacado pela 4ª vez: +10 de dano
- **Postura do Atirador** *(ativa)*
  Ação de movimento: o atirador se ajoelha no campo de batalha, privando-se da ação de movimento, e prepara um tiro mais longo, recebendo +4 de alcance. Caso se mova, a postura é encerrada.

#### Mismágier

Altera a forma e a quantidade de sua arma para criar diversos efeitos. Além disso, consegue ferir melhor inimigos desprevenidos com técnicas furtivas.

- **Presságio da Ruína** *(ativa)*
  Ação rápida: cria uma cópia sua. A cópia possui 50% de chance de desferir um segundo golpe ao atacar um alvo com sua arma principal, durante 3 rodadas. Enquanto esta habilidade estiver ativa, o guerreiro pode usar sua ação de movimento para atacar com a arma em mãos. A cópia possui metade da sua Energia Vital total como durabilidade.
- **Rajada de Lâminas** *(passiva)*
  Quando um inimigo dentro do seu alcance sofre dano de uma magia que não seja sua, você pode executar um ataque básico livre. Ativações desta passiva não geram Mana.
- **Das Sombras...** *(ativa)*
  Ação normal: arremessando uma bomba de fumaça no chão, o Mismágier pode se ocultar, tornando-se transparente. Inimigos com a passiva Faro, Ver o Invisível ou Visão de Calor podem vê-lo e atacá-lo; ataques e magias em área ainda podem acertá-lo sem necessidade de testes adicionais. Quando o inimigo estiver desavisado de sua presença e/ou flanqueado, seu bônus de flanqueio aumenta para +10 (o normal é +5 de acerto e +5 de dano).
  Realizar qualquer ação que não seja se deslocar revela o Mismágier.

#### Wugenji

O lendário código de conduta e o caminho da honra tornam o guerreiro capaz de atacar com grande fúria ou restaurar seus ferimentos alterando sua postura.

- **Bainha dos Ancestrais** *(passiva)*
  Ao embainhar sua arma (ação rápida), regenera Energia Vital conforme a quantidade de ataques realizados: restaura 1 dado (2d8) de vida por ataque acertado. Limite de 4 estoques.
- **Despertar do Dragão** *(passiva)*
  Ao desembainhar sua lâmina, seu dano muda de face para d12. Após o primeiro golpe, o dano volta ao normal. Desembainhar é uma ação livre e só é possível se a lâmina estiver embainhada.
- **Sentença da Lua** *(ativa)*
  O Wugenji consome todos os estoques guardados na Bainha dos Ancestrais para realizar um único golpe avassalador, a fim de decapitar seu oponente. Para cada estoque, o golpe causa +1 dado de dano a mais que o do ataque básico. Ao realizar esta proeza, os estoques são zerados.

#### Pugilista

Canalizando Mana por seus braços e pernas, o guerreiro é capaz de realizar diversos efeitos em uma barragem de golpes usando a mázzicka que flui pelo seu corpo.

- **Punhos Gêmeos** *(passiva)*
  Ao atacar um alvo com uma ação básica, você tem 100% de chance de ativar um segundo golpe usando 1d4 + Força. Este golpe deve ser rolado para verificar acertos e críticos e não lhe dará Mana extra.
- **Combo** *(passiva)*
  Ao atacar um inimigo que já foi atacado e recebeu dano nesta rodada, você causa novos efeitos:
  - Atacado 2ª vez na rodada: +2 de dano extra
  - Atacado 3ª vez na rodada: +3 de dano extra e o alvo não pode ser curado nesta rodada e manutenção
  - Atacado 5ª vez na rodada: +5 de dano extra, o alvo não pode ser curado nesta rodada e manutenção e sofre Reação -5
- **Palma Suave / Palma Destruidora** *(passiva)*
  Ao atacar inimigos que possuam Mana, retira 1 de Mana do alvo por golpe acertado. Se o alvo estiver sem Mana, ele recebe +3 de dano adicional.
  Caso o alvo esteja com uma barreira ativa, causa o dobro de dano à barreira; se ainda sobrar dano a ser aplicado sobre o alvo, esse dano não é dobrado.

### Vanguarda

| Classe | Vida | Dado de vida | Dano | Armas | Ganho de Mana |
|---|---:|---|---|---|---|
| Herói | 40 | 2d8 | 2d8 | Espada / Adaga / Machado / Martelo / Lança / Manopla | +1 de Mana por ação de sua Princesa, máximo de 3 por rodada. |
| Ferrabrás | 50 | 2d8 | 2d6 | Espada / Adaga / Lança / Bordão | +1 de Mana ao Evadir um ataque. |
| Uhlan | 50 | 2d8 | 2d6 | Lança | +1 de Mana quando recebe dano. |
| Vingador | 40 | 2d8 | 2d8 | Espada / Adaga / Machado / Martelo / Lança / Bordão / Maça / Manopla | +1 de Mana quando receber dano. |
| Centurião | 60 | 2d10 | 2d4 | Espada / Lança / Machado / Martelo / Bordão / Maça / Escudo | +1 de Mana quando receber dano. |

#### Herói

Heróis são pessoas que defendem o que é certo, dedicando-se a proteger aqueles a quem juraram lealdade. Heróis podem assumir muitas formas e tamanhos — siga o caminho que você escolheu e acredite nele.

- **Resgate Triunfal** *(ativa)*
  No início do combate, o guerreiro escolhe um alvo para vigiar, denominando-o sua "Princesa". Quando a Princesa for alvejada, o Herói pode teletransportar-se imediatamente para um espaço adjacente a ela, concedendo-lhe um escudo baseado no seu valor de Resiliência. Após o resgate, Resgate Triunfal se encerra — o alvo, no entanto, continua sendo sua Princesa para satisfazer o requisito de ganho de Mana deste estilo.
- **Perseverança Heroica** *(passiva)*
  Um verdadeiro herói nunca desiste. Ao receber um dano fatal, o Herói instantaneamente ganha 100 de Iniciativa e uma ação completa para realizar como quiser. No final deste ciclo de ações, ele cai e não pode ser revivido durante uma rodada completa. Ao ser revivido, Valhacouto Amarante e Resgate Triunfal são reativados. Este efeito só pode ser ativado uma única vez por combate.
- **Valhacouto Amarante** *(passiva)*
  Basta estar ao lado do Herói para se sentir mais seguro. No começo do combate, todos os aliados (excluindo o Herói) ganham uma proteção de barreira baseada na Resiliência do guerreiro. Caso esse valor seja menor que 5, a barreira vale 5 para os aliados. Múltiplos Heróis não acumulam este efeito.

#### Ferrabrás

Com sua graça e beleza, o guerreiro mágico evade golpes, redireciona magias e contra-ataca com precisão e leveza de movimentos.

- **Falsete** *(ativa)*
  Permite fazer um segundo teste de Precisão; o guerreiro deve ficar com o segundo teste. Cada golpe acertado dá ao Ferrabrás +1 de CA, acumulável até 3 vezes. Receber um golpe reseta a contagem.
- **Chifre Mágico** *(passiva)*
  Quando um aliado a até 3 espaços de você for alvo de uma magia de dano, você pode atrair o ataque para si, tornando-se o alvo primário. Magias de área ainda aplicam seu dano/efeito na nova área. Ao redirecionar um ataque mágico para si, o Ferrabrás ganha 1 de Mana.
- **Centro das Atenções** *(passiva)*
  Estar no meio de uma multidão pode ser embaraçoso, mas é exatamente onde o Ferrabrás quer estar. Para cada alvo a 3 espaços de você, o guerreiro desfruta de +1 de acerto e +2 de redução de dano mágico.

#### Uhlan

Brandindo sua arma, o guerreiro é capaz de usar o alcance extra de sua lança para aprimorar sua mobilidade e mover inimigos pelo campo de batalha, isolando-os junto a si mesmo.

- **Ritual Combativo** *(passiva)*
  Utilizando sua arma alongada, o Uhlan seleciona um alvo para, após atacá-lo com um ataque básico corpo-a-corpo, conduzi-lo junto consigo mesmo por dois espaços, em uma dinâmica de ataques e esquivas.
- **Pavos e Bravus** *(ativa)*
  Ação rápida para ativar esta postura. Ao ser atacado por ataques básicos, pode ativar dois efeitos:
  - Pavos: reduz danos físicos em 50%
  - Bravus: contra-ataca um alvo no alcance corpo-a-corpo com a arma em mãos (pode ser defendido normalmente)
  Efeitos conforme a quantidade de golpes físicos recebidos:
  - 1 golpe físico: 15% Pavos
  - 2 golpes físicos: 30% Pavos / 10% Bravus
  - 3 golpes físicos: 45% Pavos / 20% Bravus
  - 4 ou mais golpes: 60% Pavos / 40% Bravus
  - 5 ou mais golpes: 75% Pavos / 60% Bravus
  - 6 ou mais golpes: 90% Pavos / 80% Bravus
  - 7 ou mais golpes: 100% Pavos / 100% Bravus
  Enquanto estiver nesta postura, seu deslocamento é reduzido pela metade e você não pode ser deslocado involuntariamente. Todas as porcentagens de sucesso consideram resultados iguais ou menores que o valor critério.
- **Contra-Ataque Mágico** *(passiva)*
  Enquanto estiver sob a postura de Pavos e Bravus, ao ser alvo de uma magia de dano, você pode contra-atacar um alvo no alcance com um ataque básico.

#### Vingador

Usando a força bruta dos elementos, o Vingador consegue resistir a danos que normalmente incapacitariam um homem comum. Uma força imparável no campo de batalha, ele se fortalece a cada ferimento e seus sentidos aumentam conforme o tempo passa.

- **Hoje Não...** *(passiva)*
  Durante uma batalha, o personagem só é incapacitado quando chega a -10 de Energia Vital. Caso a batalha seja concluída e o guerreiro esteja com pontos negativos (até -10), ele cai como se estivesse apenas inconsciente.
- **Instinto** *(passiva)*
  Conforme o tempo passa, seus sentidos vão ficando mais apurados:
  - 1 rodada passada: +1 de Precisão e Carisma
  - 3 rodadas passadas: +2 de Precisão e Carisma
  - 5 rodadas passadas: +3 de Precisão e Carisma
- **Adrenalina** *(passiva)*
  Ao ter sua Energia Vital diminuída pelos ferimentos, os ataques com arma do Vingador aumentam em potência:
  - Energia Vital < 50%: +1 de Força
  - Energia Vital < 25%: +2 de Força
  - Energia Vital < 10%: +4 de Força

#### Centurião

Usando a estabilidade de seu escudo e a eficiência de sua arma, o guerreiro é treinado em manter o seu posto enquanto causa dano. Mais focado na defesa do que no ataque.

- **Sentinela** *(ativa)*
  Ação rápida: o Centurião é o bastião daqueles que se põem ao seu lado. Ao ativar Sentinela, todos os aliados imediatamente adjacentes recebem 3 pontos de Redução de Dano contra todas as fontes. Além disso, qualquer aliado a 3 metros de um Sentinela pode gastar sua reação, sempre ao final de seu próprio turno, para Recuar em direção ao Centurião até um espaço adjacente, sem ser alvo de quaisquer tipos de Ataques de Oportunidade. Ao ativar, o Centurião desloca metade de seu deslocamento atual. Desfazer o Sentinela é uma ação livre.
- **Provocar** *(ativa)*
  Ação rápida: força todos os inimigos a até 6 metros a escolher você como alvo do primeiro ataque do turno, por 2 rodadas, caso falhem em um teste de Sabedoria contra o Carisma do Centurião. Este efeito pode não funcionar em alguns inimigos. Alvos sob efeito possuem um redutor de -2 de Percepção e Disciplina (não acumulável).
- **Determinação** *(passiva)*
  Enquanto estiver portando seu escudo, você possui +2 de Resistência a Dano.

## Heranças

| Herança | Atributos-chave | Traço compartilhado | Progressos |
|---|---|---|---|
| Eranko | Percepção +2, Precisão +1, Reação +1 | Sentidos Especiais | Controle Selvagem · Armas Ferais · Modelo Especial Bestial |
| Oni | Potência +2, Carisma +1, Força +1 | Aura do Terror | Audácia · Telestesia · Sanguinolência |
| Titã | Resiliência +2, Força +2, Reação -1 | Corpo Milenar | Aço e Fogo · Frente Gaia · Modelo Especial Colossal |
| Elven | Sabedoria +2, Potência +1, Disciplina +1 | Arcano Arcano Arcano | Especialista em Magia · Sangue Élfico · Passo de Elvengarden |
| Pixelatte | Reação +2, Carisma +1, Precisão +1 | Apequenado | Maratona · Sofisticação · Modelo Especial Feérico |
| Dracun Squama | Força +2, Resiliência +1, Potência +1 | Arma de Sopro | Ignição Dracônica · Presa Elemental · Voto de Inimizade |
| Sage | Precisão +1, Resiliência +1, Disciplina +1, Sabedoria +1 | Perito | Iluminação do Sábio · Estilo de Luta · Brilhantismo do Sábio |
| Deva | Carisma +2, Sabedoria +1, Percepção +1 | Divindade | Revitalizar · Coroa Luminus · Modelo Especial Angelical |

### Eranko

Nascida no sangue das grandes criaturas meio-bestas, vindas do plano de Llurus — um mundo floresta-selva de rios largos e árvores colossais, onde as tribos disputavam território com monstruosidades e o líder era sempre o meio-besta mais forte.

Os Erankos de hoje lembram canídeos e felinos: encorpados, com orelhas e caudas animais e, por vezes, patas ou garras. Seus instintos são intensos e seus sentidos denunciam os detalhes de um ambiente com grande precisão.

**Atributos-chave:** Percepção +2 · Precisão +1 · Reação +1

**Traço compartilhado** — **Sentidos Especiais:** o Eranko escolhe entre audição, visão ou faro aguçado. Sempre que realizar um teste de Percepção para investigar coisas em um ambiente, recebe +5 no resultado da rolagem.

**Debilidade** — O Eranko é sempre mais sensível a cheiros, texturas ou brilho: efeitos negativos como Cegueira ou Ofuscado são duplamente eficazes.

- **Controle Selvagem** *(Carisma 4)*
  O Eranko pode controlar animais da sua espécie (Canidae ou Felinae). Ao usar um comando, os animais à vista que não superarem um teste de Sabedoria CD 8 + Carisma ficam totalmente sob seu controle — é capaz de controlar 1 animal por Ranque de Guerreiro Mágico. Ao chegar no Ranque B, pode desenvolver um laço permanente com um animal cujo porte seja, no máximo, médio.
  Um animal sob controle possui ação na rodada: pode realizar uma ação de movimento e uma ação normal, até que seja debilitado. Eles atacam com 3d6 + Carisma de precisão e 1d6 + Carisma de dano. Além disso, um animal sob seu controle que esteja adjacente pode realizar a manobra Interpor como reação, para protegê-lo de dano físico ou de projéteis (mágicos ou não).
- **Armas Ferais** *(Precisão 7)*
  Uma vez por rodada, ao acertar um ataque em seu turno, o Eranko pode realizar um ataque físico extra usando suas garras ou presas contra alvos a até um metro. A Arma Feral usa 2d4 + Força para calcular o dano.
- **Modelo Especial Bestial** *(Percepção 10 e Carisma 6)*
  O Eranko se transforma em uma versão mais primitiva de si mesmo: seu tamanho se torna médio, seus ataques atingem uma área de 3 metros, sua Força e Precisão aumentam em 3 pontos, seu deslocamento dobra e ele recebe 20 pontos de vida temporária. Nessa forma, todos os seus ataques físicos tornam-se perfurantes.
  Debilidade: o Eranko perde capacidade cognitiva ao bestializar-se — seus testes de Sabedoria e Carisma que não sejam para intimidar sofrem penalidade de -3. Além disso, equipamentos e roupas serão destruídos caso não sejam removidos (removê-los é uma ação rápida).

### Oni

Nascida no sangue dos terríveis demônios Azakana, atraídos do Plano Espiritual — o Palácio Branco — pelo grande caos da Guerra Planar. Os Azakanas antigos atormentavam Granblue, alimentando-se das emoções negativas que provocavam: quanto mais saciado o Azakana, maior seu poder.

Os Onis de hoje têm fenótipos diversos, altos ou pequenos, fortes ou esguios, mas sua principal marca é a aura do terror e os chifres, geralmente encurvados para frente.

**Atributos-chave:** Potência +2 · Carisma +1 · Força +1

**Traço compartilhado** — **Aura do Terror:** ação normal. O Oni externaliza uma aura obscura e perfidiosa, revelando sua verdadeira natureza sombria. Criaturas a até 2 metros que falhem em um teste de Carisma CD 8 + Carisma recebem o efeito negativo Medo. A cada manutenção em que a aura continuar ativa, o Oni perde 5 de vida, porém recebe 5 de vida para cada inimigo afetado por Medo dentro do alcance. O Oni deve realizar um descanso longo antes de utilizá-la novamente.

**Debilidade** — O Oni sempre causa desconfiança: testes de Carisma para convencer, acalmar ou cativar qualquer criatura recebem -3 de penalidade no resultado da rolagem.

- **Audácia** *(Força 4)*
  O Oni é atraído por Energia Vital. Ao lutar contra um inimigo com Energia Vital máxima maior que a sua, suas ações de dano recebem +5 no resultado da rolagem.
  Debilidade: o Oni é inebriado pela possibilidade de fazer o oponente sangrar, o que o torna mais letal, porém mais suscetível a falhar em se defender — recebe penalidade de -2 na CA contra ataques de inimigos com Energia Vital máxima maior que a sua.
- **Telestesia** *(Carisma 6)*
  Ação normal: as capacidades do Oni confundem o plano material e o espiritual, permitindo compenetrar o íntimo de uma criatura a até 4 metros. A Telestesia permite:
  - Ler pensamentos: +2 no resultado de testes para obter informações de outra pessoa (interrogatório, intimidação ou lábia)
  - Analisar poder de combate: descobre características de uma criatura, revelando uma desvantagem
  - Revelar tesouros: descobre o que de valioso uma criatura leva consigo
  - Prever movimentos: adivinha os próximos passos do adversário e recebe +2 na CA e no resultado de testes de Reação contra os ataques dele até o fim do combate
  O Oni não pode alvejar o mesmo alvo mais de uma vez em um mesmo combate.
- **Sanguinolência** *(Potência 8 e Força 6)*
  O Oni pode acrescentar seu modificador de Carisma como dano bônus em ataques físicos. Além disso, sua Aura do Terror é aprimorada: o alcance aumenta para 4 metros e, sempre que um inimigo afetado por Medo receber dano, o Oni se cura na mesma quantidade.

### Titã

Nascida no sangue dos colossais andarilhos da terra, vindos do plano de Gaia — um mundo imensificado de vastas planícies e cadeias montanhosas que desafiavam as noções de dimensão. Os Titãs eram nômades, organizados em clãs chefiados pelo Titã ancião mais antigo.

Os Titãs de hoje são diminutos se comparados aos primeiros, mas a mistura das raças não apagou sua resistência implacável. No geral são robustos e grandes, de pele em tonalidades metálicas e musculatura sempre bem aparente.

**Atributos-chave:** Resiliência +2 · Força +2 · Reação -1

**Traço compartilhado** — **Corpo Milenar:** sua resiliência é fora de série. Você possui uma armadura que bloqueia naturalmente 5 de dano recebido por ataques físicos.

**Debilidade** — Você é mais lento que as criaturas convencionais: seu deslocamento cai de 5 para 4 metros.

- **Aço e Fogo** *(Sabedoria 3)*
  O Titã possui proficiência para a forja: pode reparar armas quebradas com os materiais necessários para tal. Além disso, escolhe uma arma para aprimorar — ela recebe +2 faces no dado de dano. Ao atingir o Ranque B de Guerreiro Mágico, pode aprimorar outra arma (ou relíquia).
- **Frente Gaia** *(Disciplina 6)*
  Ação normal: o Titã usa instintivamente uma versão primitiva da magia Muralha, manipulando a terra. Uma parede 1x1 (1,5 m de largura por 2 m de altura) se ergue em um espaço adjacente, com 15 pontos de durabilidade; se o espaço estiver ocupado, empurra o alvo 1,5 metro para trás e o derruba caso ele falhe em um teste de Reação CD 8 + Sabedoria. O espaço ocupado pela Frente Gaia não pode ser atravessado sem testes, e ataques físicos ou projéteis (mágicos ou não) são aparados em sua superfície. A cada uso extra por descanso, o Titã perde 5^n pontos de vida, onde n é a quantidade de usos.
  Ao atingir o Ranque B de Guerreiro Mágico, a barreira se torna 1x5 metros e bloqueia 15 + 3 × Resiliência do Titã.
- **Modelo Especial Colossal** *(Resiliência 12)*
  O Titã se transforma em uma versão mais primitiva de si mesmo: seu tamanho se torna grande, seus ataques atingem uma área de 6 metros, sua Força aumenta em 4 pontos e sua Resiliência em 6. Além disso, recebe 30 pontos de vida temporária e seu Corpo Milenar passa a bloquear 10 de dano.
  Debilidade: o Titã se torna uma criatura extremamente lenta — recebe sua Resiliência base como penalidade na CA e seu deslocamento é reduzido pela metade. Além disso, equipamentos e roupas serão destruídos caso não sejam removidos (removê-los é uma ação rápida).

### Elven

Nascida no sangue dos nobres elfos da floresta, vindos do plano de Elvengarden — um mundo arcano carregado pela magia planar, de florestas antigas e coloridas, plantas exóticas e criaturas vorazes. Por isso os elfos foram os que melhor desenvolveram o domínio da magia e a disciplina necessária.

Os Elven de hoje possuem orelhas pontudas e corpo esguio; seus cabelos são prateados, escuros ou em tons que rememoram as estações.

**Atributos-chave:** Sabedoria +2 · Potência +1 · Disciplina +1

**Traço compartilhado** — **Arcano Arcano Arcano:** o Elven escolhe um arcano da esfera de Energia para receber 3 pontos. As magias dessa esfera custam 1 de Mana a menos para serem conjuradas; magias que custariam 0 restauram 1 ponto de Mana.

**Debilidade** — O Elven recebe 1d a mais de dano de ataques físicos.

- **Especialista em Magia** *(Etapa 1: Sabedoria 4 · Etapa 2: Disciplina 8)*
  Etapa 1: o Elven consegue identificar magias sustentadas ou realizadas em sua presença. Ao fazê-lo, compreende fraquezas, caso existam, e rastreia características do conjurador. Também pode ganhar um ponto na esfera de uma magia detectada, caso reserve o tempo necessário para aprendê-la. Detectar magia é uma ação normal.
  Etapa 2: o Elven elege uma magia para aprimorar ao atingir o marco de progresso, e outra ao atingir o Ranque B de Guerreiro Mágico. Uma magia aprimorada se torna uma ação conjunta e recebe um efeito único: +2 faces na rolagem de dano ou efeito estendido em +2 rodadas.
- **Sangue Élfico** *(Sabedoria 6)*
  Ação padrão: o Elven consegue trocar 5 pontos de vida por 5 pontos de Mana.
- **Passo de Elvengarden** *(Potência 7)*
  Ação bônus: o Elven se teletransporta na forma de energia para um espaço desocupado que possa ver, a até 9 metros. O Passo ganha um efeito adicional com base em uma das estações escolhidas; se o efeito exigir um teste de resistência, a CD é 8 + o modificador de Sabedoria ou Carisma (à sua escolha):
  - Outono: imediatamente após teletransportar-se, até duas criaturas à sua escolha que possa ver a até 3 metros devem passar em um teste de Sabedoria ou ficarão enfeitiçadas por você por 1 minuto, ou até que você ou seus aliados causem dano a elas
  - Inverno: uma criatura à sua escolha que possa ver a até 1,5 metro deve passar em um teste de resistência de Sabedoria ou ficará com Medo até o final do seu próximo turno
  - Primavera: você pode tocar uma criatura disposta a até 1,5 metro; em vez de você, essa criatura se teletransporta para um espaço desocupado à sua escolha que possa ver a até 9 metros
  - Verão: cada criatura à sua escolha que possa ver a até 1,5 metro sofre dano de fogo igual ao seu modificador de Potência
  O Elven possui uma quantidade de usos igual à metade do modificador de Potência (arredondado para baixo) por descanso longo.
  Debilidade: o Elven se torna etéreo e sua existência material oscila entre planos — recebe 1d6 de dano extra de todas as fontes após usar o Passo de Elvengarden, até o final da rodada.

### Pixelatte

Nascida no sangue das graciosas fadas, vindas do plano de Eeodore — um mundo encantado e diminuto, de horizontes pincelados por campos floridos infindos, governado pela Corte dentro do grande palácio construído sobre Yigdrazil, a primeira árvore que germinou.

No passado os Pixelattes dominavam o voo, com estrutura aliforme membranosa semelhante às libélulas. Hoje permanecem menores que a média, ágeis, de feições curvilíneas e cativantes, e não crescem mais que 150 cm de altura.

**Atributos-chave:** Reação +2 · Carisma +1 · Precisão +1

**Traço compartilhado** — **Apequenado:** o Pixelatte tem tamanho pequeno, consegue andar por espaços ocupados por criaturas pelo menos um tamanho maiores que o seu e ficar furtivo sob sua cobertura. Além disso, recebe +2 pontos de CA.

**Debilidade** — O Pixelatte tem penalidade de -2 pontos no modificador de Força.

- **Maratona** *(Reação 4)*
  O Pixelatte pode usar Corrida como uma ação rápida.
- **Sofisticação** *(Reação 6)*
  O Pixelatte é capaz de sair da área de alcance de um oponente sem acionar seu ataque de oportunidade.
- **Modelo Especial Feérico** *(Reação 10 e Carisma 6)*
  O Pixelatte se transforma em uma versão mais primitiva de si mesmo: desenvolve asas que o permitem voar a até 30 metros de altura e deslocar o triplo da distância de sua ação de movimento. Sua CA, Precisão e Reação aumentam em 3 pontos. Inimigos no solo não conseguem atacá-lo a menos que ele os engaje em seus alcances. Além disso, sempre que ativar Sofisticação, inflige Charm nos inimigos que falharem em um teste de Sabedoria CD 8 + Carisma, até o final da rodada; usar um comando no turno de oponentes encantados é uma ação livre.
  Debilidade: o Pixelatte adquire a fragilidade de uma fada e recebe 1d a mais de dano de todas as fontes enquanto usar o Modelo Especial Feérico.

### Dracun Squama

Nascida no sangue dos homens-lagarto. Os antigos contam que, quando todas as raças chegaram à Granblue, os Dracun Squama já estavam lá: ficaram expostos à magia dracônica latente do plano por tempo suficiente para despertar traços draco-elementais. Os clãs dracônicos cultuavam os Dragon Lords, dividindo-se em 3 grandes famílias, uma para cada Dragão.

Os Dracun Squama de hoje são humanoides reptílicos de pele mais grossa e chifres, e muitos ainda dispõem de garras e escamas.

**Atributos-chave:** Força +2 · Resiliência +1 · Potência +1

**Traço compartilhado** — **Arma de Sopro:** ação normal, 2 usos por descanso longo. O Dracun Squama canaliza o elemental de sua ancestralidade e o expele na forma de energia destrutiva, causando 2d8 + 2×Potência de dano. Seu ancestral dracônico determina o tipo de dano e o formato do sopro:

- **Azul** — Elétrico — linha de 1,5 x 9 m
- **Branco** — Frio — cone de 4,5 m
- **Bronze** — Elétrico — linha de 1,5 x 9 m
- **Latão** — Fogo — linha de 1,5 x 9 m
- **Ouro** — Fogo — cone de 4,5 m
- **Prata** — Frio — cone de 4,5 m
- **Vermelho** — Fogo — cone de 4,5 m

**Debilidade** — O Dracun Squama possui vulnerabilidade ao elemental oposto ao de sua ancestralidade: recebe 1d a mais desse tipo de dano. Opõem-se Fogo e Frio, e Eletricidade e Terra.

- **Ignição Dracônica** *(Resiliência 4)*
  O Dracun Squama pode adicionar 1d6 à rolagem final de dano — do tipo definido pela sua ancestralidade — sempre que acertar um ataque físico. Além disso, adquire resistência ao tipo de dano de sua ancestralidade, recebendo apenas metade do valor nessas rolagens.
- **Presa Elemental** *(Potência 6 e Força 6)*
  O Dracun Squama pode acrescentar metade do próprio nível (arredondado para cima) ao número de faces do dano das magias do arcano de sua ancestralidade. Se ainda não possuía pontos nessa esfera, recebe 1. Deve ser anunciado antes da rolagem.
  Debilidade: sempre que optar por usar Presa Elemental, o Dracun Squama não pode usar as magias do mesmo elemental durante a próxima rodada.
- **Voto de Inimizade** *(Força 10)*
  Ação rápida: o Dracun Squama declara inimizade contra um adversário a até 6 metros em combate. O primeiro ataque que realizar contra ele a cada rodada terá vantagem. Além disso, sempre que acertar um ataque de oportunidade em seu inimigo jurado, o deslocamento dele cai pela metade até o final do turno. Desfazer o Voto é uma ação normal e só é possível jurar uma criatura por vez.
  Debilidade: ao usar o Voto de Inimizade, o Dracun Squama só pode atacar seu inimigo jurado até que ele fique incapacitado ou o voto seja desfeito. Caso o voto seja quebrado, recebe penalidade de -2 de CA até o final do combate.

### Sage

Nascida diretamente do sangue do Grande Sábio. A grande mistura planar tornou os Sages criaturas indistintas: sem o predomínio de um traço específico, o Sage representa a mistura de todos eles e sobreviveu no Oblívion pela versatilidade de habilidades.

O Grande Sábio foi a criatura conhecida com maior aptidão à magia pura, mas nem todo Sage nasce para ser Grande Sábio. No geral são seres humanos comuns, poucos com talento para magia. É notadamente a herança com maior número de descendentes.

**Atributos-chave:** Precisão +1 · Resiliência +1 · Disciplina +1 · Sabedoria +1

**Traço compartilhado** — **Perito:** o Sage escolhe 3 áreas dentre Esportes, Ladinagem, Furtividade, Conhecimento Arcano, História do Mundo, Investigação, Natureza, Religião, Adestrar Animais, Intuição, Medicina, Sobrevivência, Atuação, Enganação e Persuasão. Rolagens que envolvam essas perícias recebem +3 pontos no resultado da rolagem.

**Debilidade** — Por não possuir vantagens inatas, o Sage possui a CD de testes dos seus 3 piores atributos aumentada em +2 pontos. Isso não se aplica a testes em que é perito.

- **Iluminação do Sábio** *(Disciplina 4)*
  O Sage gira dois 3d6 em um momento de tranquilidade e reflexão. Mais tarde, um dos resultados dessa rolagem pode ser substituído em qualquer outro teste da mesa, mesmo após ver o resultado.
- **Estilo de Luta** *(Sabedoria 6)*
  O Sage adota um estilo particular de combate que será sua especialidade. Ele desenvolve suas capacidades e sua ação rápida passa a ser uma ação normal. Além disso, escolhe um estilo dentre:
  - Arquearia: +2 de acerto para jogadas de ataque realizadas com uma arma à distância; seu alcance aumenta em um metro
  - Combate com Duas Armas: pode empunhar duas armas e, ao alternar o ataque entre elas, recebe +1d na rolagem de dano do segundo ataque
  - Defesa: enquanto estiver empunhando uma armadura pesada, possui +2 de CA; além disso, armaduras pesadas não aplicam penalidade no deslocamento
  - Duelismo: enquanto estiver empunhando uma arma corpo-a-corpo em uma mão e nenhuma outra arma, pode contra-atacar com um ataque físico, uma vez por rodada, um oponente dentro de seu alcance que o tenha atacado
- **Brilhantismo do Sábio** *(Sabedoria 12)*
  O Sage adquire uma segunda classe e pode escolher apenas uma das skills dessa classe.

### Deva

Nascida no sangue das criaturas angelicais, vindas do plano de Luminus — um mundo de nuvens onde a imensidão do céu tomava conta de tudo, com estruturas sustentadas pelo arcano do céu e comandadas pela Coroa de Luminus, o rei Deva.

Os Deva de hoje são humanoides sem asas, mas seu sangue ainda é predominantemente angelical: sua aura é agradável e sua presença, demasiadamente política. Sua principal característica é a pureza, a estranha capacidade de passar confiança somada a uma retórica irreplicável.

**Atributos-chave:** Carisma +2 · Sabedoria +1 · Percepção +1

**Traço compartilhado** — **Divindade:** o Deva pode inspirar um aliado com uma ação bônus e conceder vantagem em sua jogada, uma vez por rodada.

**Debilidade** — O Deva é vulnerável às magias proibidas: recebe +1d de dano de fontes proibidas.

- **Revitalizar** *(Disciplina 4)*
  O Deva possui acesso a uma magia restrita do arcano Cura. Revitalizar consome um ponto de Mana para curar dois pontos de Energia Vital de um alvo a até 4,5 metros. Usar Revitalizar é uma ação bônus.
- **Coroa Luminus** *(Carisma 7)*
  Ação conjunta, 2 usos por descanso longo: o Deva perturba a energia do ambiente, impedindo a conjuração de magias. Um alvo visível a até 6 metros não pode usar magias ofensivas — contudo, o Deva também não pode. Enquanto o adversário estiver no alcance, o efeito persiste; interromper a Coroa Luminus é uma ação rápida.
  Debilidade: enquanto sustentar a Coroa Luminus, o Deva se torna vulnerável a todas as fontes de magia e recebe +1d de dano de todas as fontes mágicas.
- **Modelo Especial Angelical** *(Carisma 12)*
  O Deva se transforma em uma versão mais primitiva de si mesmo: desenvolve asas que o permitem voar a até 30 metros de altura e deslocar o dobro da distância de sua ação de movimento. Inimigos no solo não conseguem atacá-lo a menos que sejam engajados em seus alcances. Sua Sabedoria e Carisma aumentam em 3 pontos. Além disso, a Coroa Luminus se ativa em um alcance de 9 metros contra todos os inimigos no alcance — para tal, é necessário estar no nível do solo.
  Debilidade: nessa forma, o Deva se torna vulnerável a todas as fontes de dano e recebe +1d de dano.
