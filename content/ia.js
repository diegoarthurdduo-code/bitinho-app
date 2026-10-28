/* Disciplina: Inteligência artificial e produtividade digital. */
window.BITINHO = window.BITINHO || { disciplinas: [] };
window.BITINHO.disciplinas.push({
  id: 'ia',
  ordem: 3,
  nome: 'IA e produtividade',
  icone: 'sparkle',
  descricao: 'Use a inteligência artificial a seu favor, com senso crítico.',
  trilhas: [
    {
      id: 'ia-pedidos',
      nome: 'Primeiros pedidos',
      modulos: [
        {
          id: 'ia-m1',
          nome: 'Conhecendo a IA',
          licoes: [
            {
              id: 'ia-1',
              titulo: 'O que é um assistente de IA',
              minutos: 3,
              xp: 20,
              fala: 'Um assistente de IA é um ótimo ajudante, e não uma bola de cristal.',
              intro: {
                titulo: 'Você pede, ele responde',
                paragrafos: [
                  'Um assistente de IA escreve respostas a partir do que você pede: resume textos, explica assuntos, sugere ideias e ajuda a organizar tarefas.',
                  'Ele pode **errar** e inventar detalhes com muita confiança. Por isso, a resposta é um ponto de partida, e você continua no comando.'
                ],
                codigo: {
                  arquivo: 'conversa',
                  lang: 'texto',
                  texto: 'Você:  Resuma este texto em 3 tópicos.\nIA:    1. A ideia principal é…',
                  destaque: [1]
                },
                dica: 'Quanto mais claro o seu pedido, mais útil tende a ser a resposta.'
              },
              exercicios: [
                {
                  tipo: 'multipla',
                  enunciado: 'Qual afirmação sobre assistentes de IA é verdadeira?',
                  opcoes: [
                    'Eles criam respostas úteis, mas também podem errar',
                    'Eles nunca erram',
                    'Eles sabem tudo sobre você',
                    'Eles só funcionam para programadores'
                  ],
                  certa: 0,
                  porque: 'A IA é uma ferramenta poderosa e falível. Conferir o que ela diz faz parte do bom uso.'
                },
                {
                  tipo: 'multipla',
                  enunciado: 'Qual é uma boa tarefa para pedir à IA?',
                  opcoes: [
                    'Resumir um texto longo em tópicos',
                    'Decidir sozinha um tratamento médico',
                    'Guardar a sua senha do banco',
                    'Assinar documentos por você'
                  ],
                  certa: 0,
                  porque: 'Resumir, explicar e organizar são tarefas em que a IA ajuda bastante. Decisões de saúde e dinheiro precisam de profissionais.'
                },
                {
                  tipo: 'ordenar',
                  enunciado: 'Coloque na ordem o ciclo de uso de uma IA.',
                  lang: 'frase',
                  etapas: ['Escrever o pedido', 'Ler a resposta com atenção', 'Conferir os fatos importantes', 'Ajustar o pedido, se precisar'],
                  porque: 'Pedimos, lemos, conferimos e refinamos. Esse ciclo se repete até o resultado ficar bom.'
                }
              ]
            }
          ]
        },
        {
          id: 'ia-m2',
          nome: 'Pedidos claros',
          licoes: [
            {
              id: 'ia-2',
              titulo: 'Como escrever um bom pedido',
              minutos: 4,
              xp: 25,
              fala: 'Um pedido bem feito poupa muitas tentativas.',
              intro: {
                titulo: 'Objetivo, contexto e formato',
                paragrafos: [
                  'Um bom pedido diz **o que você quer** (objetivo), **para quem ou em qual situação** (contexto) e **como quer a resposta** (formato).',
                  'Compare: "Fale de energia" deixa tudo em aberto. Já o pedido abaixo é específico.'
                ],
                codigo: {
                  arquivo: 'pedido.txt',
                  lang: 'texto',
                  texto: 'Explique energia solar em 5 linhas,\npara uma criança de 10 anos,\ncom um exemplo do dia a dia.',
                  destaque: [1, 2, 3]
                },
                dica: 'Se a resposta não saiu como queria, peça um ajuste: "mais curto", "mais simples" ou "em tópicos".'
              },
              exercicios: [
                {
                  tipo: 'lacunas',
                  enunciado: 'Complete a frase com os ingredientes de um bom pedido.',
                  lang: 'frase',
                  modelo: 'Um bom pedido tem {{0}}, contexto e {{1}}.',
                  banco: ['objetivo', 'formato', 'sorte', 'pressa'],
                  respostas: ['objetivo', 'formato'],
                  porque: 'Objetivo, contexto e formato dão à IA o que ela precisa para responder bem.'
                },
                {
                  tipo: 'multipla',
                  enunciado: 'Qual pedido tende a gerar uma resposta melhor?',
                  opcoes: [
                    'Fale de energia.',
                    'Explique energia solar em 5 linhas para uma criança de 10 anos.',
                    'Energia',
                    'Me conte tudo, o mais longo possível.'
                  ],
                  certa: 1,
                  porque: 'Ele traz o tema, o tamanho e o público. Quanto mais específico, menos a IA precisa adivinhar.'
                },
                {
                  tipo: 'desafio',
                  enunciado: 'Desafio prático: escreva um pedido para a IA sobre **fotossíntese**. Diga o tamanho ou o público da resposta (pelo menos 25 caracteres).',
                  lang: 'frase',
                  placeholder: 'Ex.: Explique a fotossíntese em…',
                  aceita: ['^(?=[\\s\\S]{25,}$)[\\s\\S]*fotoss[ií]ntese[\\s\\S]*$'],
                  solucao: 'Explique a fotossíntese em 4 linhas para uma criança de 9 anos.',
                  dica: 'Inclua o tema e algo como "em 4 linhas" ou "para um aluno do 6º ano".',
                  porque: 'Um pedido completo cita o tema e orienta a resposta, por exemplo com tamanho e público.'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'ia-critico',
      nome: 'Senso crítico',
      modulos: [
        {
          id: 'ia-m3',
          nome: 'Conferindo respostas',
          licoes: [
            {
              id: 'ia-3',
              titulo: 'Verifique antes de confiar',
              minutos: 4,
              xp: 25,
              fala: 'Confiar sem conferir é o maior risco. Vamos aprender a checar.',
              intro: {
                titulo: 'Por que a IA inventa coisas',
                paragrafos: [
                  'A IA monta respostas que **soam corretas**. Nem sempre ela consulta fatos, então pode errar datas, números, nomes e até citar fontes que não existem.',
                  'Quanto mais importante a informação, mais vale conferir em uma fonte confiável.'
                ],
                codigo: {
                  arquivo: 'checklist',
                  lang: 'texto',
                  texto: '1. Marque os fatos importantes\n2. Procure em fonte confiável\n3. Compare com a resposta\n4. Corrija o que diferir',
                  destaque: [2]
                },
                dica: 'Boas fontes: sites oficiais, instituições de ensino, jornais conhecidos e livros.'
              },
              exercicios: [
                {
                  tipo: 'multipla',
                  enunciado: 'A IA citou uma data histórica. O que fazer antes de usar no trabalho da escola?',
                  opcoes: [
                    'Conferir em uma fonte confiável',
                    'Copiar sem ler',
                    'Pedir à própria IA que jure que está certo',
                    'Ignorar, pois datas não importam'
                  ],
                  certa: 0,
                  porque: 'Fatos importantes devem ser confirmados fora da conversa. Perguntar de novo à IA não é uma checagem independente.'
                },
                {
                  tipo: 'multipla',
                  enunciado: 'Por que uma IA pode apresentar uma informação errada com muita segurança?',
                  opcoes: [
                    'Porque ela gera textos que parecem plausíveis, mesmo sem ter certeza',
                    'Porque ela quer enganar',
                    'Porque a internet caiu',
                    'Porque você digitou rápido demais'
                  ],
                  certa: 0,
                  porque: 'O tom confiante não indica que a resposta está certa. Ela foi construída para soar natural, e a checagem cabe a você.'
                },
                {
                  tipo: 'ordenar',
                  enunciado: 'Coloque na ordem as etapas para verificar uma resposta.',
                  lang: 'frase',
                  etapas: ['Identificar os fatos importantes', 'Procurar em uma fonte confiável', 'Comparar com a resposta da IA', 'Corrigir o que estiver diferente'],
                  porque: 'Primeiro separamos o que precisa ser checado, depois comparamos e corrigimos.'
                }
              ]
            }
          ]
        },
        {
          id: 'ia-m4',
          nome: 'Uso responsável',
          licoes: [
            {
              id: 'ia-4',
              titulo: 'Privacidade e honestidade',
              minutos: 4,
              xp: 25,
              fala: 'Usar IA com cuidado protege você e as outras pessoas.',
              intro: {
                titulo: 'O que não compartilhar',
                paragrafos: [
                  'Evite colocar em uma conversa de IA senhas, números de documentos, dados de cartão ou informações pessoais de outras pessoas.',
                  'Nos estudos e no trabalho, use a IA para entender e revisar, e entregue algo que você compreende. Quando fizer sentido, avise que usou a ferramenta.'
                ],
                codigo: {
                  arquivo: 'regra de ouro',
                  lang: 'texto',
                  texto: 'Se eu não contaria isso a um\nestranho, não coloco no chat.',
                  destaque: [1, 2]
                },
                dica: 'Dá para pedir ajuda sem expor dados: troque nomes e números reais por exemplos.'
              },
              exercicios: [
                {
                  tipo: 'multipla',
                  enunciado: 'Qual destas informações você NÃO deve colocar em um chat de IA?',
                  opcoes: [
                    'A senha do seu e-mail',
                    'Uma pergunta sobre receita de bolo',
                    'Um tema para estudar',
                    'Um pedido de resumo de texto público'
                  ],
                  certa: 0,
                  porque: 'Senhas e dados de documentos nunca devem ser compartilhados, nem com ferramentas que pareçam confiáveis.'
                },
                {
                  tipo: 'lacunas',
                  enunciado: 'Complete a regra de segurança.',
                  lang: 'frase',
                  modelo: 'Nunca compartilhe {{0}} nem dados {{1}} de outras pessoas.',
                  banco: ['senhas', 'pessoais', 'receitas', 'piadas'],
                  respostas: ['senhas', 'pessoais'],
                  porque: 'Senhas e dados pessoais, seus ou de terceiros, devem ficar de fora da conversa.'
                },
                {
                  tipo: 'multipla',
                  enunciado: 'Qual é um jeito honesto de usar IA em um trabalho escolar?',
                  opcoes: [
                    'Pedir explicações, revisar o texto e entregar algo que você entende',
                    'Entregar a resposta pronta sem ler',
                    'Dizer que não usou, mesmo tendo usado',
                    'Pedir que ela faça a prova por você'
                  ],
                  certa: 0,
                  porque: 'A IA deve ajudar você a aprender e melhorar. Se o trabalho deixa de ser seu, a ferramenta atrapalha em vez de ajudar.'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
});
