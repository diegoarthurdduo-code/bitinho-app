/* Disciplina: Informática essencial. */
window.BITINHO = window.BITINHO || { disciplinas: [] };
window.BITINHO.disciplinas.push({
  id: 'informatica',
  ordem: 2,
  nome: 'Informática essencial',
  icone: 'folder',
  descricao: 'Perca o medo do computador: arquivos, internet, e-mail e atalhos.',
  trilhas: [
    {
      id: 'computador',
      nome: 'Computador sem medo',
      modulos: [
        {
          id: 'inf-m1',
          nome: 'Arquivos e pastas',
          licoes: [
            {
              id: 'inf-1',
              titulo: 'Onde ficam as coisas',
              minutos: 3,
              xp: 20,
              fala: 'Um computador organizado economiza muito tempo.',
              intro: {
                titulo: 'Arquivos vivem dentro de pastas',
                paragrafos: [
                  'Um **arquivo** é um documento, foto, música ou vídeo. Uma **pasta** é onde guardamos vários arquivos juntos.',
                  'Pastas podem conter outras pastas. O caminho até um arquivo mostra por onde passar para encontrá-lo.'
                ],
                codigo: {
                  arquivo: 'caminho',
                  lang: 'texto',
                  texto: 'Documentos\n└─ Escola\n   └─ redacao.docx',
                  destaque: [3]
                },
                dica: 'A parte depois do ponto, como `.docx` ou `.jpg`, é a extensão. Ela indica o tipo do arquivo.'
              },
              exercicios: [
                {
                  tipo: 'multipla',
                  enunciado: 'Onde guardamos vários arquivos de forma organizada?',
                  opcoes: ['Em uma pasta', 'Na área de transferência', 'No teclado', 'Na lixeira'],
                  certa: 0,
                  porque: 'Pastas servem para agrupar arquivos do mesmo assunto, como numa gaveta.'
                },
                {
                  tipo: 'ordenar',
                  enunciado: 'Coloque as etapas na ordem para salvar a redação na pasta Escola.',
                  lang: 'frase',
                  etapas: ['Abrir a pasta Documentos', 'Entrar na pasta Escola', 'Salvar o arquivo redacao.docx'],
                  porque: 'Primeiro chegamos à pasta certa, de fora para dentro, e só depois salvamos.'
                },
                {
                  tipo: 'multipla',
                  enunciado: 'Qual destes nomes de arquivo ajuda mais a encontrar a foto depois?',
                  opcoes: ['viagem-praia-2026.jpg', 'IMG_0001.jpg', 'novo.jpg', 'aaa.jpg'],
                  certa: 0,
                  porque: 'Um bom nome diz o que é o arquivo e quando foi feito. Nomes como "novo" ou "aaa" não explicam nada.'
                }
              ]
            }
          ]
        },
        {
          id: 'inf-m2',
          nome: 'Atalhos do dia a dia',
          licoes: [
            {
              id: 'inf-4',
              titulo: 'Atalhos de teclado',
              minutos: 3,
              xp: 25,
              fala: 'Estes atalhos vão te acompanhar para sempre.',
              intro: {
                titulo: 'Menos cliques, mais rapidez',
                paragrafos: [
                  'Um atalho combina teclas apertadas juntas. Segure `Ctrl` (no Mac, `Cmd`) e aperte uma letra.',
                  'Os mais úteis: copiar, colar, desfazer e salvar.'
                ],
                codigo: {
                  arquivo: 'atalhos',
                  lang: 'texto',
                  texto: 'Ctrl + C   copiar\nCtrl + V   colar\nCtrl + Z   desfazer\nCtrl + S   salvar',
                  destaque: [1, 2]
                },
                dica: 'Dá para lembrar: o **C** é de copiar e o **S** é de salvar. O **V** fica ao lado do **C** no teclado.'
              },
              exercicios: [
                {
                  tipo: 'lacunas',
                  enunciado: 'Complete os atalhos de copiar e colar.',
                  lang: 'frase',
                  modelo: 'Copiar: Ctrl + {{0}}\nColar: Ctrl + {{1}}',
                  banco: ['C', 'V', 'X', 'Z'],
                  respostas: ['C', 'V'],
                  porque: 'Ctrl + C copia e Ctrl + V cola. O Ctrl + X recorta, ou seja, copia e remove do lugar original.'
                },
                {
                  tipo: 'multipla',
                  enunciado: 'Você apagou um parágrafo sem querer. Qual atalho desfaz a última ação?',
                  opcoes: ['Ctrl + Z', 'Ctrl + P', 'Ctrl + A', 'Ctrl + N'],
                  certa: 0,
                  porque: 'Ctrl + Z desfaz a última ação. Você pode apertar várias vezes para voltar mais passos.'
                },
                {
                  tipo: 'desafio',
                  enunciado: 'Desafio prático: digite o atalho para **salvar** (formato Ctrl + letra).',
                  lang: 'frase',
                  placeholder: 'Ctrl + …',
                  aceita: ['^ctrl\\s*\\+\\s*s$'],
                  solucao: 'Ctrl + S',
                  dica: 'S de salvar.',
                  porque: 'Ctrl + S salva o arquivo. Vale apertar de vez em quando para não perder trabalho.'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'internet',
      nome: 'Internet e e-mail',
      modulos: [
        {
          id: 'inf-m3',
          nome: 'Navegando com segurança',
          licoes: [
            {
              id: 'inf-2',
              titulo: 'Endereços e links seguros',
              minutos: 4,
              xp: 25,
              fala: 'Navegar é fácil. Navegar com atenção é melhor ainda.',
              intro: {
                titulo: 'Lendo o endereço de um site',
                paragrafos: [
                  'O endereço fica na barra do navegador. O nome principal mostra de quem é o site.',
                  'O cadeado e o `https` indicam que a conexão é protegida, mas isso **não prova** que o site é confiável. Sempre confira o nome.'
                ],
                codigo: {
                  arquivo: 'barra de endereço',
                  lang: 'texto',
                  texto: 'https://www.meubanco.com.br/entrar',
                  destaque: [1]
                },
                dica: 'Desconfie de nomes estranhos, com erros de digitação ou com palavras como "promoção" e "prêmio".'
              },
              exercicios: [
                {
                  tipo: 'ordenar',
                  enunciado: 'Coloque as etapas na ordem para pesquisar na internet.',
                  lang: 'frase',
                  etapas: ['Abrir o navegador', 'Clicar na barra de endereço', 'Digitar o que procura', 'Apertar Enter'],
                  porque: 'É sempre nesta sequência: abrir, clicar, digitar e confirmar.'
                },
                {
                  tipo: 'multipla',
                  enunciado: 'O que o cadeado e o `https://` garantem?',
                  opcoes: [
                    'Que a conexão está protegida, mas não que o site é confiável',
                    'Que o site é do governo',
                    'Que o site nunca tem vírus',
                    'Que as ofertas são verdadeiras'
                  ],
                  certa: 0,
                  porque: 'O cadeado protege a conversa entre você e o site. Golpistas também podem usar https, por isso confira o nome do site.'
                },
                {
                  tipo: 'multipla',
                  enunciado: 'Chega uma mensagem com o link "banconacional-premio.xyz". O que fazer?',
                  opcoes: [
                    'Não clicar e entrar pelo aplicativo ou site oficial',
                    'Clicar para ver o prêmio',
                    'Encaminhar para os amigos',
                    'Digitar a senha para confirmar'
                  ],
                  certa: 0,
                  porque: 'Links com prêmios e nomes estranhos são sinal de golpe. O caminho seguro é abrir o app ou digitar o endereço oficial você mesmo.'
                }
              ]
            }
          ]
        },
        {
          id: 'inf-m4',
          nome: 'Usando o e-mail',
          licoes: [
            {
              id: 'inf-3',
              titulo: 'Escrevendo um e-mail',
              minutos: 4,
              xp: 25,
              fala: 'Um bom e-mail é curto, claro e educado.',
              intro: {
                titulo: 'As partes de um e-mail',
                paragrafos: [
                  '**Para** é quem recebe. **Assunto** resume o tema em poucas palavras. O corpo traz a mensagem.',
                  'O endereço de e-mail tem o nome da pessoa, o símbolo `@` e o provedor.'
                ],
                codigo: {
                  arquivo: 'novo e-mail',
                  lang: 'texto',
                  texto: 'Para:     ana@exemplo.com\nAssunto:  Reunião de sexta\n\nOi, Ana! Podemos marcar às 10h?',
                  destaque: [1, 2]
                },
                dica: 'Antes de enviar, confira o destinatário e se esqueceu de anexar algum arquivo.'
              },
              exercicios: [
                {
                  tipo: 'multipla',
                  enunciado: 'Para que serve o campo Assunto?',
                  opcoes: ['Resumir o tema da mensagem', 'Escolher a cor do e-mail', 'Apagar a mensagem', 'Guardar a senha'],
                  certa: 0,
                  porque: 'O assunto ajuda quem recebe a entender, de relance, do que se trata.'
                },
                {
                  tipo: 'ordenar',
                  enunciado: 'Coloque na ordem as etapas para enviar um e-mail com anexo.',
                  lang: 'frase',
                  etapas: ['Clicar em Escrever', 'Informar destinatário e assunto', 'Anexar o arquivo', 'Clicar em Enviar'],
                  porque: 'Primeiro criamos a mensagem, depois anexamos o arquivo e só então enviamos.'
                },
                {
                  tipo: 'desafio',
                  enunciado: 'Desafio prático: qual símbolo separa o nome da pessoa do provedor em um e-mail? Digite-o.',
                  lang: 'frase',
                  placeholder: 'Digite o símbolo',
                  aceita: ['^@$'],
                  solucao: '@',
                  dica: 'Ele aparece em ana@exemplo.com.',
                  porque: 'O arroba (@) separa o nome do usuário do provedor, como em ana@exemplo.com.'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
});
