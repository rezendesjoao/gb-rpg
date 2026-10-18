/**
 * Conteúdo das 8 Heranças (Raças), transcrito do journal "🩸 Heranças".
 *
 * Fonte única: o seletor de herança da ficha (presetHeritageData) e o compêndio
 * "Granblue — Heranças" são montados a partir daqui, então traço, debilidade e
 * progressos acompanham a herança automaticamente nos dois caminhos.
 *
 *   bonus        bônus de atributo-chave (vira Active Effect de ADD)
 *   sharedTrait  traço compartilhado (HTML)
 *   weakness     debilidade do traço compartilhado (HTML)
 *   progress     habilidades desbloqueadas por limites de atributo
 */

export const HERITAGES = {
    eranko: {
        label: 'Eranko',
        bonus: { percepcao: 2, precisao: 1, reacao: 1 },
        img: 'icons/svg/pawprint.svg',
        description: '<p>Nascida no sangue das grandes criaturas meio-bestas, vindas do plano de Llurus — um mundo floresta-selva de rios largos e árvores colossais, onde as tribos disputavam território com monstruosidades e o líder era sempre o meio-besta mais forte.</p><p>Os Erankos de hoje lembram canídeos e felinos: encorpados, com orelhas e caudas animais e, por vezes, patas ou garras. Seus instintos são intensos e seus sentidos denunciam os detalhes de um ambiente com grande precisão.</p>',
        sharedTrait: '<p><strong>Sentidos Especiais:</strong> o Eranko escolhe entre audição, visão ou faro aguçado. Sempre que realizar um teste de Percepção para investigar coisas em um ambiente, recebe +5 no resultado da rolagem.</p>',
        weakness: '<p>O Eranko é sempre mais sensível a cheiros, texturas ou brilho: efeitos negativos como Cegueira ou Ofuscado são duplamente eficazes.</p>',
        progress: [
            {
                name: 'Controle Selvagem',
                requirement: 'Carisma 4',
                description: 'O Eranko pode controlar animais da sua espécie (Canidae ou Felinae). Ao usar um comando, os animais à vista que não superarem um teste de Sabedoria CD 8 + Carisma ficam totalmente sob seu controle — é capaz de controlar 1 animal por Ranque de Guerreiro Mágico. Ao chegar no Ranque B, pode desenvolver um laço permanente com um animal cujo porte seja, no máximo, médio.\nUm animal sob controle possui ação na rodada: pode realizar uma ação de movimento e uma ação normal, até que seja debilitado. Eles atacam com 3d6 + Carisma de precisão e 1d6 + Carisma de dano. Além disso, um animal sob seu controle que esteja adjacente pode realizar a manobra Interpor como reação, para protegê-lo de dano físico ou de projéteis (mágicos ou não).'
            },
            {
                name: 'Armas Ferais',
                requirement: 'Precisão 7',
                description: 'Uma vez por rodada, ao acertar um ataque em seu turno, o Eranko pode realizar um ataque físico extra usando suas garras ou presas contra alvos a até um metro. A Arma Feral usa 2d4 + Força para calcular o dano.'
            },
            {
                name: 'Modelo Especial Bestial',
                requirement: 'Percepção 10 e Carisma 6',
                description: 'O Eranko se transforma em uma versão mais primitiva de si mesmo: seu tamanho se torna médio, seus ataques atingem uma área de 3 metros, sua Força e Precisão aumentam em 3 pontos, seu deslocamento dobra e ele recebe 20 pontos de vida temporária. Nessa forma, todos os seus ataques físicos tornam-se perfurantes.\nDebilidade: o Eranko perde capacidade cognitiva ao bestializar-se — seus testes de Sabedoria e Carisma que não sejam para intimidar sofrem penalidade de -3. Além disso, equipamentos e roupas serão destruídos caso não sejam removidos (removê-los é uma ação rápida).'
            }
        ]
    },

    oni: {
        label: 'Oni',
        bonus: { potencia: 2, carisma: 1, forca: 1 },
        img: 'icons/svg/terror.svg',
        description: '<p>Nascida no sangue dos terríveis demônios Azakana, atraídos do Plano Espiritual — o Palácio Branco — pelo grande caos da Guerra Planar. Os Azakanas antigos atormentavam Granblue, alimentando-se das emoções negativas que provocavam: quanto mais saciado o Azakana, maior seu poder.</p><p>Os Onis de hoje têm fenótipos diversos, altos ou pequenos, fortes ou esguios, mas sua principal marca é a aura do terror e os chifres, geralmente encurvados para frente.</p>',
        sharedTrait: '<p><strong>Aura do Terror:</strong> ação normal. O Oni externaliza uma aura obscura e perfidiosa, revelando sua verdadeira natureza sombria. Criaturas a até 2 metros que falhem em um teste de Carisma CD 8 + Carisma recebem o efeito negativo Medo. A cada manutenção em que a aura continuar ativa, o Oni perde 5 de vida, porém recebe 5 de vida para cada inimigo afetado por Medo dentro do alcance. O Oni deve realizar um descanso longo antes de utilizá-la novamente.</p>',
        weakness: '<p>O Oni sempre causa desconfiança: testes de Carisma para convencer, acalmar ou cativar qualquer criatura recebem -3 de penalidade no resultado da rolagem.</p>',
        progress: [
            {
                name: 'Audácia',
                requirement: 'Força 4',
                description: 'O Oni é atraído por Energia Vital. Ao lutar contra um inimigo com Energia Vital máxima maior que a sua, suas ações de dano recebem +5 no resultado da rolagem.\nDebilidade: o Oni é inebriado pela possibilidade de fazer o oponente sangrar, o que o torna mais letal, porém mais suscetível a falhar em se defender — recebe penalidade de -2 na CA contra ataques de inimigos com Energia Vital máxima maior que a sua.'
            },
            {
                name: 'Telestesia',
                requirement: 'Carisma 6',
                description: 'Ação normal: as capacidades do Oni confundem o plano material e o espiritual, permitindo compenetrar o íntimo de uma criatura a até 4 metros. A Telestesia permite:\n• Ler pensamentos: +2 no resultado de testes para obter informações de outra pessoa (interrogatório, intimidação ou lábia)\n• Analisar poder de combate: descobre características de uma criatura, revelando uma desvantagem\n• Revelar tesouros: descobre o que de valioso uma criatura leva consigo\n• Prever movimentos: adivinha os próximos passos do adversário e recebe +2 na CA e no resultado de testes de Reação contra os ataques dele até o fim do combate\nO Oni não pode alvejar o mesmo alvo mais de uma vez em um mesmo combate.'
            },
            {
                name: 'Sanguinolência',
                requirement: 'Potência 8 e Força 6',
                description: 'O Oni pode acrescentar seu modificador de Carisma como dano bônus em ataques físicos. Além disso, sua Aura do Terror é aprimorada: o alcance aumenta para 4 metros e, sempre que um inimigo afetado por Medo receber dano, o Oni se cura na mesma quantidade.'
            }
        ]
    },

    tita: {
        label: 'Titã',
        bonus: { resiliencia: 2, forca: 2, reacao: -1 },
        img: 'icons/svg/mountain.svg',
        description: '<p>Nascida no sangue dos colossais andarilhos da terra, vindos do plano de Gaia — um mundo imensificado de vastas planícies e cadeias montanhosas que desafiavam as noções de dimensão. Os Titãs eram nômades, organizados em clãs chefiados pelo Titã ancião mais antigo.</p><p>Os Titãs de hoje são diminutos se comparados aos primeiros, mas a mistura das raças não apagou sua resistência implacável. No geral são robustos e grandes, de pele em tonalidades metálicas e musculatura sempre bem aparente.</p>',
        sharedTrait: '<p><strong>Corpo Milenar:</strong> sua resiliência é fora de série. Você possui uma armadura que bloqueia naturalmente 5 de dano recebido por ataques físicos.</p>',
        weakness: '<p>Você é mais lento que as criaturas convencionais: seu deslocamento cai de 5 para 4 metros.</p>',
        progress: [
            {
                name: 'Aço e Fogo',
                requirement: 'Sabedoria 3',
                description: 'O Titã possui proficiência para a forja: pode reparar armas quebradas com os materiais necessários para tal. Além disso, escolhe uma arma para aprimorar — ela recebe +2 faces no dado de dano. Ao atingir o Ranque B de Guerreiro Mágico, pode aprimorar outra arma (ou relíquia).'
            },
            {
                name: 'Frente Gaia',
                requirement: 'Disciplina 6',
                description: 'Ação normal: o Titã usa instintivamente uma versão primitiva da magia Muralha, manipulando a terra. Uma parede 1x1 (1,5 m de largura por 2 m de altura) se ergue em um espaço adjacente, com 15 pontos de durabilidade; se o espaço estiver ocupado, empurra o alvo 1,5 metro para trás e o derruba caso ele falhe em um teste de Reação CD 8 + Sabedoria. O espaço ocupado pela Frente Gaia não pode ser atravessado sem testes, e ataques físicos ou projéteis (mágicos ou não) são aparados em sua superfície. A cada uso extra por descanso, o Titã perde 5^n pontos de vida, onde n é a quantidade de usos.\nAo atingir o Ranque B de Guerreiro Mágico, a barreira se torna 1x5 metros e bloqueia 15 + 3 × Resiliência do Titã.'
            },
            {
                name: 'Modelo Especial Colossal',
                requirement: 'Resiliência 12',
                description: 'O Titã se transforma em uma versão mais primitiva de si mesmo: seu tamanho se torna grande, seus ataques atingem uma área de 6 metros, sua Força aumenta em 4 pontos e sua Resiliência em 6. Além disso, recebe 30 pontos de vida temporária e seu Corpo Milenar passa a bloquear 10 de dano.\nDebilidade: o Titã se torna uma criatura extremamente lenta — recebe sua Resiliência base como penalidade na CA e seu deslocamento é reduzido pela metade. Além disso, equipamentos e roupas serão destruídos caso não sejam removidos (removê-los é uma ação rápida).'
            }
        ]
    },

    elven: {
        label: 'Elven',
        bonus: { sabedoria: 2, potencia: 1, disciplina: 1 },
        img: 'icons/svg/oak.svg',
        description: '<p>Nascida no sangue dos nobres elfos da floresta, vindos do plano de Elvengarden — um mundo arcano carregado pela magia planar, de florestas antigas e coloridas, plantas exóticas e criaturas vorazes. Por isso os elfos foram os que melhor desenvolveram o domínio da magia e a disciplina necessária.</p><p>Os Elven de hoje possuem orelhas pontudas e corpo esguio; seus cabelos são prateados, escuros ou em tons que rememoram as estações.</p>',
        sharedTrait: '<p><strong>Arcano Arcano Arcano:</strong> o Elven escolhe um arcano da esfera de Energia para receber 3 pontos. As magias dessa esfera custam 1 de Mana a menos para serem conjuradas; magias que custariam 0 restauram 1 ponto de Mana.</p>',
        weakness: '<p>O Elven recebe 1d a mais de dano de ataques físicos.</p>',
        progress: [
            {
                name: 'Especialista em Magia',
                requirement: 'Etapa 1: Sabedoria 4 · Etapa 2: Disciplina 8',
                description: 'Etapa 1: o Elven consegue identificar magias sustentadas ou realizadas em sua presença. Ao fazê-lo, compreende fraquezas, caso existam, e rastreia características do conjurador. Também pode ganhar um ponto na esfera de uma magia detectada, caso reserve o tempo necessário para aprendê-la. Detectar magia é uma ação normal.\nEtapa 2: o Elven elege uma magia para aprimorar ao atingir o marco de progresso, e outra ao atingir o Ranque B de Guerreiro Mágico. Uma magia aprimorada se torna uma ação conjunta e recebe um efeito único: +2 faces na rolagem de dano ou efeito estendido em +2 rodadas.'
            },
            {
                name: 'Sangue Élfico',
                requirement: 'Sabedoria 6',
                description: 'Ação padrão: o Elven consegue trocar 5 pontos de vida por 5 pontos de Mana.'
            },
            {
                name: 'Passo de Elvengarden',
                requirement: 'Potência 7',
                description: 'Ação bônus: o Elven se teletransporta na forma de energia para um espaço desocupado que possa ver, a até 9 metros. O Passo ganha um efeito adicional com base em uma das estações escolhidas; se o efeito exigir um teste de resistência, a CD é 8 + o modificador de Sabedoria ou Carisma (à sua escolha):\n• Outono: imediatamente após teletransportar-se, até duas criaturas à sua escolha que possa ver a até 3 metros devem passar em um teste de Sabedoria ou ficarão enfeitiçadas por você por 1 minuto, ou até que você ou seus aliados causem dano a elas\n• Inverno: uma criatura à sua escolha que possa ver a até 1,5 metro deve passar em um teste de resistência de Sabedoria ou ficará com Medo até o final do seu próximo turno\n• Primavera: você pode tocar uma criatura disposta a até 1,5 metro; em vez de você, essa criatura se teletransporta para um espaço desocupado à sua escolha que possa ver a até 9 metros\n• Verão: cada criatura à sua escolha que possa ver a até 1,5 metro sofre dano de fogo igual ao seu modificador de Potência\nO Elven possui uma quantidade de usos igual à metade do modificador de Potência (arredondado para baixo) por descanso longo.\nDebilidade: o Elven se torna etéreo e sua existência material oscila entre planos — recebe 1d6 de dano extra de todas as fontes após usar o Passo de Elvengarden, até o final da rodada.'
            }
        ]
    },

    pixelatte: {
        label: 'Pixelatte',
        bonus: { reacao: 2, carisma: 1, precisao: 1 },
        img: 'icons/svg/wing.svg',
        description: '<p>Nascida no sangue das graciosas fadas, vindas do plano de Eeodore — um mundo encantado e diminuto, de horizontes pincelados por campos floridos infindos, governado pela Corte dentro do grande palácio construído sobre Yigdrazil, a primeira árvore que germinou.</p><p>No passado os Pixelattes dominavam o voo, com estrutura aliforme membranosa semelhante às libélulas. Hoje permanecem menores que a média, ágeis, de feições curvilíneas e cativantes, e não crescem mais que 150 cm de altura.</p>',
        sharedTrait: '<p><strong>Apequenado:</strong> o Pixelatte tem tamanho pequeno, consegue andar por espaços ocupados por criaturas pelo menos um tamanho maiores que o seu e ficar furtivo sob sua cobertura. Além disso, recebe +2 pontos de CA.</p>',
        weakness: '<p>O Pixelatte tem penalidade de -2 pontos no modificador de Força.</p>',
        progress: [
            {
                name: 'Maratona',
                requirement: 'Reação 4',
                description: 'O Pixelatte pode usar Corrida como uma ação rápida.'
            },
            {
                name: 'Sofisticação',
                requirement: 'Reação 6',
                description: 'O Pixelatte é capaz de sair da área de alcance de um oponente sem acionar seu ataque de oportunidade.'
            },
            {
                name: 'Modelo Especial Feérico',
                requirement: 'Reação 10 e Carisma 6',
                description: 'O Pixelatte se transforma em uma versão mais primitiva de si mesmo: desenvolve asas que o permitem voar a até 30 metros de altura e deslocar o triplo da distância de sua ação de movimento. Sua CA, Precisão e Reação aumentam em 3 pontos. Inimigos no solo não conseguem atacá-lo a menos que ele os engaje em seus alcances. Além disso, sempre que ativar Sofisticação, inflige Charm nos inimigos que falharem em um teste de Sabedoria CD 8 + Carisma, até o final da rodada; usar um comando no turno de oponentes encantados é uma ação livre.\nDebilidade: o Pixelatte adquire a fragilidade de uma fada e recebe 1d a mais de dano de todas as fontes enquanto usar o Modelo Especial Feérico.'
            }
        ]
    },

    dracunSquama: {
        label: 'Dracun Squama',
        bonus: { forca: 2, resiliencia: 1, potencia: 1 },
        img: 'icons/svg/fire.svg',
        description: '<p>Nascida no sangue dos homens-lagarto. Os antigos contam que, quando todas as raças chegaram à Granblue, os Dracun Squama já estavam lá: ficaram expostos à magia dracônica latente do plano por tempo suficiente para despertar traços draco-elementais. Os clãs dracônicos cultuavam os Dragon Lords, dividindo-se em 3 grandes famílias, uma para cada Dragão.</p><p>Os Dracun Squama de hoje são humanoides reptílicos de pele mais grossa e chifres, e muitos ainda dispõem de garras e escamas.</p>',
        sharedTrait: '<p><strong>Arma de Sopro:</strong> ação normal, 2 usos por descanso longo. O Dracun Squama canaliza o elemental de sua ancestralidade e o expele na forma de energia destrutiva, causando 2d8 + 2×Potência de dano. Seu ancestral dracônico determina o tipo de dano e o formato do sopro:</p><ul><li><strong>Azul</strong> — Elétrico — linha de 1,5 x 9 m</li><li><strong>Branco</strong> — Frio — cone de 4,5 m</li><li><strong>Bronze</strong> — Elétrico — linha de 1,5 x 9 m</li><li><strong>Latão</strong> — Fogo — linha de 1,5 x 9 m</li><li><strong>Ouro</strong> — Fogo — cone de 4,5 m</li><li><strong>Prata</strong> — Frio — cone de 4,5 m</li><li><strong>Vermelho</strong> — Fogo — cone de 4,5 m</li></ul>',
        weakness: '<p>O Dracun Squama possui vulnerabilidade ao elemental oposto ao de sua ancestralidade: recebe 1d a mais desse tipo de dano. Opõem-se Fogo e Frio, e Eletricidade e Terra.</p>',
        progress: [
            {
                name: 'Ignição Dracônica',
                requirement: 'Resiliência 4',
                description: 'O Dracun Squama pode adicionar 1d6 à rolagem final de dano — do tipo definido pela sua ancestralidade — sempre que acertar um ataque físico. Além disso, adquire resistência ao tipo de dano de sua ancestralidade, recebendo apenas metade do valor nessas rolagens.'
            },
            {
                name: 'Presa Elemental',
                requirement: 'Potência 6 e Força 6',
                description: 'O Dracun Squama pode acrescentar metade do próprio nível (arredondado para cima) ao número de faces do dano das magias do arcano de sua ancestralidade. Se ainda não possuía pontos nessa esfera, recebe 1. Deve ser anunciado antes da rolagem.\nDebilidade: sempre que optar por usar Presa Elemental, o Dracun Squama não pode usar as magias do mesmo elemental durante a próxima rodada.'
            },
            {
                name: 'Voto de Inimizade',
                requirement: 'Força 10',
                description: 'Ação rápida: o Dracun Squama declara inimizade contra um adversário a até 6 metros em combate. O primeiro ataque que realizar contra ele a cada rodada terá vantagem. Além disso, sempre que acertar um ataque de oportunidade em seu inimigo jurado, o deslocamento dele cai pela metade até o final do turno. Desfazer o Voto é uma ação normal e só é possível jurar uma criatura por vez.\nDebilidade: ao usar o Voto de Inimizade, o Dracun Squama só pode atacar seu inimigo jurado até que ele fique incapacitado ou o voto seja desfeito. Caso o voto seja quebrado, recebe penalidade de -2 de CA até o final do combate.'
            }
        ]
    },

    sage: {
        label: 'Sage',
        bonus: { precisao: 1, resiliencia: 1, disciplina: 1, sabedoria: 1 },
        img: 'icons/svg/mystery-man.svg',
        description: '<p>Nascida diretamente do sangue do Grande Sábio. A grande mistura planar tornou os Sages criaturas indistintas: sem o predomínio de um traço específico, o Sage representa a mistura de todos eles e sobreviveu no Oblívion pela versatilidade de habilidades.</p><p>O Grande Sábio foi a criatura conhecida com maior aptidão à magia pura, mas nem todo Sage nasce para ser Grande Sábio. No geral são seres humanos comuns, poucos com talento para magia. É notadamente a herança com maior número de descendentes.</p>',
        sharedTrait: '<p><strong>Perito:</strong> o Sage escolhe 3 áreas dentre Esportes, Ladinagem, Furtividade, Conhecimento Arcano, História do Mundo, Investigação, Natureza, Religião, Adestrar Animais, Intuição, Medicina, Sobrevivência, Atuação, Enganação e Persuasão. Rolagens que envolvam essas perícias recebem +3 pontos no resultado da rolagem.</p>',
        weakness: '<p>Por não possuir vantagens inatas, o Sage possui a CD de testes dos seus 3 piores atributos aumentada em +2 pontos. Isso não se aplica a testes em que é perito.</p>',
        progress: [
            {
                name: 'Iluminação do Sábio',
                requirement: 'Disciplina 4',
                description: 'O Sage gira dois 3d6 em um momento de tranquilidade e reflexão. Mais tarde, um dos resultados dessa rolagem pode ser substituído em qualquer outro teste da mesa, mesmo após ver o resultado.'
            },
            {
                name: 'Estilo de Luta',
                requirement: 'Sabedoria 6',
                description: 'O Sage adota um estilo particular de combate que será sua especialidade. Ele desenvolve suas capacidades e sua ação rápida passa a ser uma ação normal. Além disso, escolhe um estilo dentre:\n• Arquearia: +2 de acerto para jogadas de ataque realizadas com uma arma à distância; seu alcance aumenta em um metro\n• Combate com Duas Armas: pode empunhar duas armas e, ao alternar o ataque entre elas, recebe +1d na rolagem de dano do segundo ataque\n• Defesa: enquanto estiver empunhando uma armadura pesada, possui +2 de CA; além disso, armaduras pesadas não aplicam penalidade no deslocamento\n• Duelismo: enquanto estiver empunhando uma arma corpo-a-corpo em uma mão e nenhuma outra arma, pode contra-atacar com um ataque físico, uma vez por rodada, um oponente dentro de seu alcance que o tenha atacado'
            },
            {
                name: 'Brilhantismo do Sábio',
                requirement: 'Sabedoria 12',
                description: 'O Sage adquire uma segunda classe e pode escolher apenas uma das skills dessa classe.'
            }
        ]
    },

    deva: {
        label: 'Deva',
        bonus: { carisma: 2, sabedoria: 1, percepcao: 1 },
        img: 'icons/svg/angel.svg',
        description: '<p>Nascida no sangue das criaturas angelicais, vindas do plano de Luminus — um mundo de nuvens onde a imensidão do céu tomava conta de tudo, com estruturas sustentadas pelo arcano do céu e comandadas pela Coroa de Luminus, o rei Deva.</p><p>Os Deva de hoje são humanoides sem asas, mas seu sangue ainda é predominantemente angelical: sua aura é agradável e sua presença, demasiadamente política. Sua principal característica é a pureza, a estranha capacidade de passar confiança somada a uma retórica irreplicável.</p>',
        sharedTrait: '<p><strong>Divindade:</strong> o Deva pode inspirar um aliado com uma ação bônus e conceder vantagem em sua jogada, uma vez por rodada.</p>',
        weakness: '<p>O Deva é vulnerável às magias proibidas: recebe +1d de dano de fontes proibidas.</p>',
        progress: [
            {
                name: 'Revitalizar',
                requirement: 'Disciplina 4',
                description: 'O Deva possui acesso a uma magia restrita do arcano Cura. Revitalizar consome um ponto de Mana para curar dois pontos de Energia Vital de um alvo a até 4,5 metros. Usar Revitalizar é uma ação bônus.'
            },
            {
                name: 'Coroa Luminus',
                requirement: 'Carisma 7',
                description: 'Ação conjunta, 2 usos por descanso longo: o Deva perturba a energia do ambiente, impedindo a conjuração de magias. Um alvo visível a até 6 metros não pode usar magias ofensivas — contudo, o Deva também não pode. Enquanto o adversário estiver no alcance, o efeito persiste; interromper a Coroa Luminus é uma ação rápida.\nDebilidade: enquanto sustentar a Coroa Luminus, o Deva se torna vulnerável a todas as fontes de magia e recebe +1d de dano de todas as fontes mágicas.'
            },
            {
                name: 'Modelo Especial Angelical',
                requirement: 'Carisma 12',
                description: 'O Deva se transforma em uma versão mais primitiva de si mesmo: desenvolve asas que o permitem voar a até 30 metros de altura e deslocar o dobro da distância de sua ação de movimento. Inimigos no solo não conseguem atacá-lo a menos que sejam engajados em seus alcances. Sua Sabedoria e Carisma aumentam em 3 pontos. Além disso, a Coroa Luminus se ativa em um alcance de 9 metros contra todos os inimigos no alcance — para tal, é necessário estar no nível do solo.\nDebilidade: nessa forma, o Deva se torna vulnerável a todas as fontes de dano e recebe +1d de dano.'
            }
        ]
    }
};
