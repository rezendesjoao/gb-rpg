/**
 * Conteúdo das 15 Classes (Estilos de Guerreiro), transcrito do journal
 * "⚔ Estilos de Guerreiro".
 *
 * Fonte única: o seletor de classe da ficha (presetClassData) e o compêndio
 * "Granblue — Classes" são montados a partir daqui, então as habilidades
 * acompanham a classe automaticamente nos dois caminhos.
 *
 *   grupo       conjurador | especial | vanguarda
 *   vidaBase    Energia Vital base (vira Active Effect de OVERRIDE)
 *   vidaDado    dado de vida (rolado uma vez)
 *   danoDado    dado de dano base da classe
 *   mana        condição de ganho de Mana do estilo
 *   abilities   habilidades do estilo (passiva | ativa)
 */

export const CLASSES = {
    /* ============================================================ */
    /*  CONJURADOR                                                  */
    /* ============================================================ */

    artista: {
        label: 'Artista',
        grupo: 'conjurador',
        vidaBase: 40,
        vidaDado: '2d6',
        danoDado: '2d8',
        mana: '+1 de Mana cada vez que confere uma melhoria a um aliado.',
        weapons: 'Adagas / Espadas (arremessadas; alcance especial 4 para mod. de Percepção)',
        img: 'icons/svg/aura.svg',
        description: 'Focado em ajudar seus aliados por meio de sua coreografia mágica, o Artista traz ao campo de batalha vigor e aplausos, encorajando e aprimorando as habilidades de quem luta ao seu lado. Ambas as suas armas são arremessadas ao mesmo tempo e voltam às suas mãos, juntas, como melodia e canção.',
        abilities: [
            {
                name: 'Performance Deslumbrante',
                type: 'ativa',
                description: 'Usando movimentos fantásticos e fascinantes, o Artista cria uma dança a partir de uma magia de aprimoramento. Ao executar a performance, todos os aliados em uma área 3x3 são afetados por um efeito positivo à sua escolha (é preciso possuir a magia que confere esse efeito).\nO uso desta habilidade faz o feitiço custar o dobro do custo normal e soma +2 à sua dificuldade.'
            },
            {
                name: 'Elogios a Mil',
                type: 'passiva',
                description: 'Quando um aliado realiza um abate dentro do seu alcance, você o enche de elogios e aplausos, enaltecendo suas habilidades e conjurando sobre ele um efeito positivo que seja uma ação rápida, desde que esteja sob o alcance da magia.'
            },
            {
                name: 'Graciosidade',
                type: 'passiva',
                description: 'Devido à sua graça e leveza de movimentos, sua ação de movimento desfruta de +1 e você pode se deslocar até 2 espaços quando for bem-sucedido em uma Evasão.'
            }
        ]
    },

    ragda: {
        label: 'Ragda',
        grupo: 'conjurador',
        vidaBase: 40,
        vidaDado: '2d6',
        danoDado: '2d6',
        mana: '+1 de Mana quando inflige um efeito negativo com sucesso a um alvo.',
        weapons: 'Adaga / Cajado / Grimório / Anel',
        img: 'icons/svg/statue.svg',
        description: 'Portando sua máscara e seus itens sânscritos, o Ragda é especialista em trazer uma grande quantidade de efeitos negativos através de diversos rituais de feitiçaria.',
        abilities: [
            {
                name: 'Totem — Feitiço Macabro',
                type: 'ativa',
                description: 'Ação rápida: implanta um totem adjacente a si mesmo, que cria uma área 3x3 e afeta todos os alvos com um efeito negativo à sua escolha (é preciso possuir a magia que confere esse efeito).\nAlvos que adentram a área devem realizar um teste de Sabedoria CD 8 + Potência ou serão afetados pelo efeito negativo.\nO Ragda pode manter até 2 focos de Feitiço Macabro ao mesmo tempo. O foco dura até 3 rodadas e deve receber os recursos do Ragda (o custo da magia) a cada manutenção para continuar existindo.\nO uso desta habilidade faz o feitiço custar o dobro do custo normal e soma +2 à sua dificuldade.'
            },
            {
                name: 'Mandinga Perversa',
                type: 'ativa',
                description: 'Ação rápida: diminui em -2 o resultado final das rolagens de um inimigo à sua escolha. Apenas um inimigo pode ser alvo por vez — ao escolher outro, o efeito no anterior deixa de existir. A Mandinga só se desfaz ao se superar um teste de Sabedoria CD 8 + Potência, que decai em 2 a cada tentativa.\nCaso você seja afetado por um efeito negativo, o alvo da Mandinga contrai o mesmo efeito, a menos que seja naturalmente imune.'
            },
            {
                name: 'Pinturas Antigas',
                type: 'passiva',
                description: 'Efeitos negativos duram 1 rodada a menos. Além disso, você causa +2 de dano por efeito negativo que o inimigo estiver sofrendo.'
            }
        ]
    },

    escriba: {
        label: 'Escriba',
        grupo: 'conjurador',
        vidaBase: 40,
        vidaDado: '2d4',
        danoDado: '2d6',
        mana: '+1 de Mana cada vez que é bem-sucedido em um teste de Disciplina.',
        weapons: 'Pena / Caneta (arma especial, alcance 4)',
        img: 'icons/svg/book.svg',
        description: 'Dizem que a pena é mais rápida que a espada, e para o Escriba isso pode ser uma verdade. É a única classe que pode adicionar Sabedoria ao dano da arma em mãos, disparando um símbolo mágico ao atacar. A arma não requer tinta e desenha letras da cor desejada pelo Escriba.',
        abilities: [
            {
                name: 'Transcrever Magia',
                type: 'ativa',
                description: 'Ação completa: transfere as propriedades de uma magia para um pedaço de pergaminho mágico em branco.\nPergaminhos mágicos são especiais, pois contêm os encantamentos necessários para que a magia funcione sem problemas — apenas esse tipo de papel pode ser usado, e ele pode ser comprado em lojas.\nO custo de recursos e os testes de Disciplina são feitos normalmente, e então o pergaminho é criado. Qualquer um pode ler o pergaminho, mas ainda deve gastar os recursos da magia.\nUm Escriba e seu grupo podem usar em combate um número de pergaminhos igual ao número de personagens ativos no grupo.'
            },
            {
                name: 'Livro Cheio',
                type: 'passiva',
                description: 'Para cada abate realizado pelo Escriba, uma página é preenchida pela sua caneta, aumentando sua Potência e Disciplina em 1. Este efeito acumula até 3 vezes, até o final do combate.'
            },
            {
                name: 'Poder das Palavras',
                type: 'passiva',
                description: 'Para cada pergaminho usado em batalha, o Escriba ganha 1 ponto de Mana.'
            }
        ]
    },

    samaritano: {
        label: 'Samaritano',
        grupo: 'conjurador',
        vidaBase: 40,
        vidaDado: '2d6',
        danoDado: '2d6',
        mana: '+1 de Mana quando cura um alvo.',
        weapons: 'Adaga / Bordão / Cajado / Anel / Grimório',
        img: 'icons/svg/heal.svg',
        description: 'Um guerreiro que se concentra em auxiliar seus aliados e regenerar seus ferimentos. Apenas por estar perto dele, a esperança se renova.',
        abilities: [
            {
                name: 'Dom da Reciprocidade',
                type: 'passiva',
                description: 'Ao oferecer suporte a um aliado, recupera Energia Vital:\n• Curar um aliado em 10 ou mais pontos → recupera 5 de Energia Vital\n• Curar um aliado em 20 ou mais pontos → recupera 10 de Energia Vital\n• Curar um aliado em 30 ou mais pontos → recupera 15 de Energia Vital'
            },
            {
                name: 'Regalo',
                type: 'ativa',
                description: 'Presenteia um montante de Mana a um aliado adjacente, ou distante em até 10 espaços de você (nesse caso a ação consome uma ação normal). O montante é escolhido pelo Samaritano, mas não pode ultrapassar o montante que ele tem no momento.'
            },
            {
                name: 'Círculo da Vida',
                type: 'passiva',
                description: 'Aliados adjacentes restauram 5 de Energia Vital na manutenção da rodada. Curar dessa forma não gera Mana ao Samaritano.'
            }
        ]
    },

    taumaturgo: {
        label: 'Taumaturgo',
        grupo: 'conjurador',
        vidaBase: 40,
        vidaDado: '2d6',
        danoDado: '2d6',
        mana: '+1 de Mana para cada alvo que acertar com uma magia que cause dano.',
        weapons: 'Cajado / Grimório / Anel',
        img: 'icons/svg/explosion.svg',
        description: 'Usando a cromologia, o guerreiro é capaz de alterar a física de suas mázzickas e ampliar seus efeitos. Lançar magias em área o fortalece com Mana, recurso necessário para conjurar feitiços ainda mais poderosos a um custo reduzido.',
        abilities: [
            {
                name: 'Afinidade com o Mana',
                type: 'passiva',
                description: 'Manobras de Mana custam -1 de Mana para serem executadas. O custo mínimo de uma manobra é 1.'
            },
            {
                name: 'Caleidoscópio',
                type: 'ativa',
                description: 'Ação rápida: altera o elemento da sua mázzicka para outro aleatório dentre os outros dois da mesma Esfera. Assim que a magia é sorteada, o conjurador pode redirecionar a magia para um novo alvo no alcance.'
            },
            {
                name: 'Sangue Mágico',
                type: 'ativa',
                description: 'Ação conjunta: converte 5 de Mana em 5 de Energia Vital. Este efeito só pode ser aplicado em si mesmo.'
            }
        ]
    },

    /* ============================================================ */
    /*  ESPECIAL                                                    */
    /* ============================================================ */

    cacador: {
        label: 'Caçador',
        grupo: 'especial',
        vidaBase: 50,
        vidaDado: '2d6',
        danoDado: '2d6',
        mana: '+1 de Mana cada vez que acerta um inimigo já ferido nesta rodada.',
        weapons: 'Adaga / Machado / Maça / Arco / Pistola Flintlock / Rifle de Assalto / Canhoneiro',
        img: 'icons/svg/pawprint.svg',
        description: 'Um estilo versátil que consegue causar grandes estragos tanto a curta quanto a média distância. Especialista em combater grandes criaturas e em recolher espólios com eficácia, sua energia vital é ligeiramente restaurada com a emoção de cada abate.',
        abilities: [
            {
                name: 'Matador de Gigantes',
                type: 'passiva',
                description: 'Quando uma criatura grande ou maior fizer um ataque a até 3 espaços contra você (acertando ou errando), você pode atacá-la com um ataque básico normal, 1 vez por rodada. Além disso, você causa +1d de dano a criaturas que ocupem 4 espaços ou mais.'
            },
            {
                name: 'Carniceiro',
                type: 'passiva',
                description: 'Ao checar um inimigo por partes, o Caçador possui 100% de chance a mais de conseguir mais espólios e 50% de chance de que estes sejam de uma categoria acima. Para cada inimigo abatido em combate, o Caçador recupera 5 de Energia Vital.'
            },
            {
                name: 'Explorar Fontes',
                type: 'passiva',
                description: 'Ao avistar um ponto de exploração a 10 espaços, é possível, com um teste de Percepção, saber qual é a natureza daquele ponto (encontro, tesouro, exploração). Além disso, extrai mais materiais de pontos de exploração, somando +5 ao teste.'
            }
        ]
    },

    francoAtirador: {
        label: 'Franco-Atirador',
        grupo: 'especial',
        vidaBase: 40,
        vidaDado: '2d6',
        danoDado: '2d8',
        mana: '+1 de Mana ao acertar um ataque básico em um inimigo.',
        weapons: 'Arco / Pistola Flintlock / Rifle de Assalto / Canhoneiro',
        img: 'icons/svg/target.svg',
        description: 'Nada escapa da mira de um guerreiro Franco-Atirador. Com o inimigo em vista e munição em sua arma, o alvo será caçado até a morte.',
        abilities: [
            {
                name: 'Tiro Calculado',
                type: 'ativa',
                description: 'Concentrando-se por rodadas completas, o guerreiro pode atingir diversos alvos com sua arma:\n• 1 rodada: ataca 2 alvos, +5 de dano final, +5 de acerto final, +2 de alcance\n• 2 rodadas: ataca até 3 alvos, +15 de dano final, +10 de acerto, +4 de alcance\n• 3 rodadas: ataca até 4 alvos, +30 de dano final, +15 de acerto, +6 de alcance'
            },
            {
                name: 'Repetidor',
                type: 'passiva',
                description: 'Aumenta o dano causado a um alvo atacado múltiplas vezes pelo guerreiro:\n• Atacado pela 2ª vez: +2 de dano\n• Atacado pela 3ª vez: +5 de dano\n• Atacado pela 4ª vez: +10 de dano'
            },
            {
                name: 'Postura do Atirador',
                type: 'ativa',
                description: 'Ação de movimento: o atirador se ajoelha no campo de batalha, privando-se da ação de movimento, e prepara um tiro mais longo, recebendo +4 de alcance. Caso se mova, a postura é encerrada.'
            }
        ]
    },

    mismagier: {
        label: 'Mismágier',
        grupo: 'especial',
        vidaBase: 40,
        vidaDado: '2d6',
        danoDado: '2d8',
        mana: '+1 de Mana quando causar dano com ataques básicos.',
        weapons: 'Adagas / Espada',
        img: 'icons/svg/invisible.svg',
        description: 'Altera a forma e a quantidade de sua arma para criar diversos efeitos. Além disso, consegue ferir melhor inimigos desprevenidos com técnicas furtivas.',
        abilities: [
            {
                name: 'Presságio da Ruína',
                type: 'ativa',
                description: 'Ação rápida: cria uma cópia sua. A cópia possui 50% de chance de desferir um segundo golpe ao atacar um alvo com sua arma principal, durante 3 rodadas. Enquanto esta habilidade estiver ativa, o guerreiro pode usar sua ação de movimento para atacar com a arma em mãos. A cópia possui metade da sua Energia Vital total como durabilidade.'
            },
            {
                name: 'Rajada de Lâminas',
                type: 'passiva',
                description: 'Quando um inimigo dentro do seu alcance sofre dano de uma magia que não seja sua, você pode executar um ataque básico livre. Ativações desta passiva não geram Mana.'
            },
            {
                name: 'Das Sombras...',
                type: 'ativa',
                description: 'Ação normal: arremessando uma bomba de fumaça no chão, o Mismágier pode se ocultar, tornando-se transparente. Inimigos com a passiva Faro, Ver o Invisível ou Visão de Calor podem vê-lo e atacá-lo; ataques e magias em área ainda podem acertá-lo sem necessidade de testes adicionais. Quando o inimigo estiver desavisado de sua presença e/ou flanqueado, seu bônus de flanqueio aumenta para +10 (o normal é +5 de acerto e +5 de dano).\nRealizar qualquer ação que não seja se deslocar revela o Mismágier.'
            }
        ]
    },

    wugenji: {
        label: 'Wugenji',
        grupo: 'especial',
        vidaBase: 40,
        vidaDado: '2d8',
        danoDado: '2d8',
        mana: '+1 de Mana quando causa dano com ataques básicos.',
        weapons: 'Espada (Katana)',
        img: 'icons/svg/sword.svg',
        description: 'O lendário código de conduta e o caminho da honra tornam o guerreiro capaz de atacar com grande fúria ou restaurar seus ferimentos alterando sua postura.',
        abilities: [
            {
                name: 'Bainha dos Ancestrais',
                type: 'passiva',
                description: 'Ao embainhar sua arma (ação rápida), regenera Energia Vital conforme a quantidade de ataques realizados: restaura 1 dado (2d8) de vida por ataque acertado. Limite de 4 estoques.'
            },
            {
                name: 'Despertar do Dragão',
                type: 'passiva',
                description: 'Ao desembainhar sua lâmina, seu dano muda de face para d12. Após o primeiro golpe, o dano volta ao normal. Desembainhar é uma ação livre e só é possível se a lâmina estiver embainhada.'
            },
            {
                name: 'Sentença da Lua',
                type: 'ativa',
                description: 'O Wugenji consome todos os estoques guardados na Bainha dos Ancestrais para realizar um único golpe avassalador, a fim de decapitar seu oponente. Para cada estoque, o golpe causa +1 dado de dano a mais que o do ataque básico. Ao realizar esta proeza, os estoques são zerados.'
            }
        ]
    },

    pugilista: {
        label: 'Pugilista',
        grupo: 'especial',
        vidaBase: 50,
        vidaDado: '2d8',
        danoDado: '2d6',
        mana: '+1 de Mana quando causa dano com ataques básicos.',
        weapons: 'Manopla / Bordão',
        img: 'icons/svg/combat.svg',
        description: 'Canalizando Mana por seus braços e pernas, o guerreiro é capaz de realizar diversos efeitos em uma barragem de golpes usando a mázzicka que flui pelo seu corpo.',
        abilities: [
            {
                name: 'Punhos Gêmeos',
                type: 'passiva',
                description: 'Ao atacar um alvo com uma ação básica, você tem 100% de chance de ativar um segundo golpe usando 1d4 + Força. Este golpe deve ser rolado para verificar acertos e críticos e não lhe dará Mana extra.'
            },
            {
                name: 'Combo',
                type: 'passiva',
                description: 'Ao atacar um inimigo que já foi atacado e recebeu dano nesta rodada, você causa novos efeitos:\n• Atacado 2ª vez na rodada: +2 de dano extra\n• Atacado 3ª vez na rodada: +3 de dano extra e o alvo não pode ser curado nesta rodada e manutenção\n• Atacado 5ª vez na rodada: +5 de dano extra, o alvo não pode ser curado nesta rodada e manutenção e sofre Reação -5'
            },
            {
                name: 'Palma Suave / Palma Destruidora',
                type: 'passiva',
                description: 'Ao atacar inimigos que possuam Mana, retira 1 de Mana do alvo por golpe acertado. Se o alvo estiver sem Mana, ele recebe +3 de dano adicional.\nCaso o alvo esteja com uma barreira ativa, causa o dobro de dano à barreira; se ainda sobrar dano a ser aplicado sobre o alvo, esse dano não é dobrado.'
            }
        ]
    },

    /* ============================================================ */
    /*  VANGUARDA                                                   */
    /* ============================================================ */

    heroi: {
        label: 'Herói',
        grupo: 'vanguarda',
        vidaBase: 40,
        vidaDado: '2d8',
        danoDado: '2d8',
        mana: '+1 de Mana por ação de sua Princesa, máximo de 3 por rodada.',
        weapons: 'Espada / Adaga / Machado / Martelo / Lança / Manopla',
        img: 'icons/svg/holy-shield.svg',
        description: 'Heróis são pessoas que defendem o que é certo, dedicando-se a proteger aqueles a quem juraram lealdade. Heróis podem assumir muitas formas e tamanhos — siga o caminho que você escolheu e acredite nele.',
        abilities: [
            {
                name: 'Resgate Triunfal',
                type: 'ativa',
                description: 'No início do combate, o guerreiro escolhe um alvo para vigiar, denominando-o sua "Princesa". Quando a Princesa for alvejada, o Herói pode teletransportar-se imediatamente para um espaço adjacente a ela, concedendo-lhe um escudo baseado no seu valor de Resiliência. Após o resgate, Resgate Triunfal se encerra — o alvo, no entanto, continua sendo sua Princesa para satisfazer o requisito de ganho de Mana deste estilo.'
            },
            {
                name: 'Perseverança Heroica',
                type: 'passiva',
                description: 'Um verdadeiro herói nunca desiste. Ao receber um dano fatal, o Herói instantaneamente ganha 100 de Iniciativa e uma ação completa para realizar como quiser. No final deste ciclo de ações, ele cai e não pode ser revivido durante uma rodada completa. Ao ser revivido, Valhacouto Amarante e Resgate Triunfal são reativados. Este efeito só pode ser ativado uma única vez por combate.'
            },
            {
                name: 'Valhacouto Amarante',
                type: 'passiva',
                description: 'Basta estar ao lado do Herói para se sentir mais seguro. No começo do combate, todos os aliados (excluindo o Herói) ganham uma proteção de barreira baseada na Resiliência do guerreiro. Caso esse valor seja menor que 5, a barreira vale 5 para os aliados. Múltiplos Heróis não acumulam este efeito.'
            }
        ]
    },

    ferrabras: {
        label: 'Ferrabrás',
        grupo: 'vanguarda',
        vidaBase: 50,
        vidaDado: '2d8',
        danoDado: '2d6',
        mana: '+1 de Mana ao Evadir um ataque.',
        weapons: 'Espada / Adaga / Lança / Bordão',
        img: 'icons/svg/wingfoot.svg',
        description: 'Com sua graça e beleza, o guerreiro mágico evade golpes, redireciona magias e contra-ataca com precisão e leveza de movimentos.',
        abilities: [
            {
                name: 'Falsete',
                type: 'ativa',
                description: 'Permite fazer um segundo teste de Precisão; o guerreiro deve ficar com o segundo teste. Cada golpe acertado dá ao Ferrabrás +1 de CA, acumulável até 3 vezes. Receber um golpe reseta a contagem.'
            },
            {
                name: 'Chifre Mágico',
                type: 'passiva',
                description: 'Quando um aliado a até 3 espaços de você for alvo de uma magia de dano, você pode atrair o ataque para si, tornando-se o alvo primário. Magias de área ainda aplicam seu dano/efeito na nova área. Ao redirecionar um ataque mágico para si, o Ferrabrás ganha 1 de Mana.'
            },
            {
                name: 'Centro das Atenções',
                type: 'passiva',
                description: 'Estar no meio de uma multidão pode ser embaraçoso, mas é exatamente onde o Ferrabrás quer estar. Para cada alvo a 3 espaços de você, o guerreiro desfruta de +1 de acerto e +2 de redução de dano mágico.'
            }
        ]
    },

    uhlan: {
        label: 'Uhlan',
        grupo: 'vanguarda',
        vidaBase: 50,
        vidaDado: '2d8',
        danoDado: '2d6',
        mana: '+1 de Mana quando recebe dano.',
        weapons: 'Lança',
        img: 'icons/svg/thrust.svg',
        description: 'Brandindo sua arma, o guerreiro é capaz de usar o alcance extra de sua lança para aprimorar sua mobilidade e mover inimigos pelo campo de batalha, isolando-os junto a si mesmo.',
        abilities: [
            {
                name: 'Ritual Combativo',
                type: 'passiva',
                description: 'Utilizando sua arma alongada, o Uhlan seleciona um alvo para, após atacá-lo com um ataque básico corpo-a-corpo, conduzi-lo junto consigo mesmo por dois espaços, em uma dinâmica de ataques e esquivas.'
            },
            {
                name: 'Pavos e Bravus',
                type: 'ativa',
                description: 'Ação rápida para ativar esta postura. Ao ser atacado por ataques básicos, pode ativar dois efeitos:\n• Pavos: reduz danos físicos em 50%\n• Bravus: contra-ataca um alvo no alcance corpo-a-corpo com a arma em mãos (pode ser defendido normalmente)\nEfeitos conforme a quantidade de golpes físicos recebidos:\n• 1 golpe físico: 15% Pavos\n• 2 golpes físicos: 30% Pavos / 10% Bravus\n• 3 golpes físicos: 45% Pavos / 20% Bravus\n• 4 ou mais golpes: 60% Pavos / 40% Bravus\n• 5 ou mais golpes: 75% Pavos / 60% Bravus\n• 6 ou mais golpes: 90% Pavos / 80% Bravus\n• 7 ou mais golpes: 100% Pavos / 100% Bravus\nEnquanto estiver nesta postura, seu deslocamento é reduzido pela metade e você não pode ser deslocado involuntariamente. Todas as porcentagens de sucesso consideram resultados iguais ou menores que o valor critério.'
            },
            {
                name: 'Contra-Ataque Mágico',
                type: 'passiva',
                description: 'Enquanto estiver sob a postura de Pavos e Bravus, ao ser alvo de uma magia de dano, você pode contra-atacar um alvo no alcance com um ataque básico.'
            }
        ]
    },

    vingador: {
        label: 'Vingador',
        grupo: 'vanguarda',
        vidaBase: 40,
        vidaDado: '2d8',
        danoDado: '2d8',
        mana: '+1 de Mana quando receber dano.',
        weapons: 'Espada / Adaga / Machado / Martelo / Lança / Bordão / Maça / Manopla',
        img: 'icons/svg/blood.svg',
        description: 'Usando a força bruta dos elementos, o Vingador consegue resistir a danos que normalmente incapacitariam um homem comum. Uma força imparável no campo de batalha, ele se fortalece a cada ferimento e seus sentidos aumentam conforme o tempo passa.',
        abilities: [
            {
                name: 'Hoje Não...',
                type: 'passiva',
                description: 'Durante uma batalha, o personagem só é incapacitado quando chega a -10 de Energia Vital. Caso a batalha seja concluída e o guerreiro esteja com pontos negativos (até -10), ele cai como se estivesse apenas inconsciente.'
            },
            {
                name: 'Instinto',
                type: 'passiva',
                description: 'Conforme o tempo passa, seus sentidos vão ficando mais apurados:\n• 1 rodada passada: +1 de Precisão e Carisma\n• 3 rodadas passadas: +2 de Precisão e Carisma\n• 5 rodadas passadas: +3 de Precisão e Carisma'
            },
            {
                name: 'Adrenalina',
                type: 'passiva',
                description: 'Ao ter sua Energia Vital diminuída pelos ferimentos, os ataques com arma do Vingador aumentam em potência:\n• Energia Vital < 50%: +1 de Força\n• Energia Vital < 25%: +2 de Força\n• Energia Vital < 10%: +4 de Força'
            }
        ]
    },

    centuriao: {
        label: 'Centurião',
        grupo: 'vanguarda',
        vidaBase: 60,
        vidaDado: '2d10',
        danoDado: '2d4',
        mana: '+1 de Mana quando receber dano.',
        weapons: 'Espada / Lança / Machado / Martelo / Bordão / Maça / Escudo',
        img: 'icons/svg/shield.svg',
        description: 'Usando a estabilidade de seu escudo e a eficiência de sua arma, o guerreiro é treinado em manter o seu posto enquanto causa dano. Mais focado na defesa do que no ataque.',
        abilities: [
            {
                name: 'Sentinela',
                type: 'ativa',
                description: 'Ação rápida: o Centurião é o bastião daqueles que se põem ao seu lado. Ao ativar Sentinela, todos os aliados imediatamente adjacentes recebem 3 pontos de Redução de Dano contra todas as fontes. Além disso, qualquer aliado a 3 metros de um Sentinela pode gastar sua reação, sempre ao final de seu próprio turno, para Recuar em direção ao Centurião até um espaço adjacente, sem ser alvo de quaisquer tipos de Ataques de Oportunidade. Ao ativar, o Centurião desloca metade de seu deslocamento atual. Desfazer o Sentinela é uma ação livre.'
            },
            {
                name: 'Provocar',
                type: 'ativa',
                description: 'Ação rápida: força todos os inimigos a até 6 metros a escolher você como alvo do primeiro ataque do turno, por 2 rodadas, caso falhem em um teste de Sabedoria contra o Carisma do Centurião. Este efeito pode não funcionar em alguns inimigos. Alvos sob efeito possuem um redutor de -2 de Percepção e Disciplina (não acumulável).'
            },
            {
                name: 'Determinação',
                type: 'passiva',
                description: 'Enquanto estiver portando seu escudo, você possui +2 de Resistência a Dano.'
            }
        ]
    }
};
