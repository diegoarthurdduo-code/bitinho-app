/*
  Disciplina: Programação (trilhas de HTML e Python).
  Para adicionar uma lição, copie um objeto de "licoes" e troque o conteúdo.
  Tipos de exercício: multipla, lacunas, ordenar, desafio (ver LEIA-ME.md).
*/
window.BITINHO = window.BITINHO || { disciplinas: [] };
window.BITINHO.disciplinas.push({
  id: 'programacao',
  ordem: 1,
  nome: 'Programação',
  icone: 'code',
  descricao: 'Aprenda a dar ordens ao computador, um conceito por vez.',
  trilhas: [
    {
      id: 'html',
      nome: 'HTML do zero',
      modulos: [
        {
          id: 'html-m1',
          nome: 'Primeiros passos',
          licoes: [
            {
              id: 'html-1',
              titulo: 'O que é HTML?',
              minutos: 3,
              xp: 20,
              fala: 'Vamos começar pelo começo. É bem mais simples do que parece!',
              intro: {
                titulo: 'A estrutura de uma página',
                paragrafos: [
                  'HTML é a linguagem que organiza o conteúdo de uma página da web: títulos, textos, links e imagens.',
                  'Ela usa **tags**, que são palavras entre `<` e `>`. Quase sempre existe uma tag que abre e outra que fecha, com uma barra.'
                ],
                codigo: { arquivo: 'index.html', lang: 'html', texto: '<p>Olá, mundo!</p>', destaque: [1] },
                dica: 'A tag que abre é `<p>` e a que fecha é `</p>`. O texto fica no meio.'
              },
              exercicios: [
                {
                  tipo: 'multipla',
                  enunciado: 'Para que serve o HTML?',
                  opcoes: ['Dar estrutura ao conteúdo da página', 'Deixar o computador mais rápido', 'Guardar senhas com segurança', 'Editar fotos'],
                  certa: 0,
                  porque: 'O HTML descreve o que existe na página: o que é título, o que é parágrafo, o que é link.'
                },
                {
                  tipo: 'lacunas',
                  enunciado: 'Complete o parágrafo escolhendo as peças certas.',
                  lang: 'html',
                  arquivo: 'index.html',
                  modelo: '<{{0}}>Bem-vindo!<{{1}}>',
                  banco: ['p', '/p', 'a', 'h1'],
                  respostas: ['p', '/p'],
                  porque: 'Abrimos com `<p>` e fechamos com `</p>`. A barra indica que a tag está fechando.',
                  pista: 'A segunda lacuna é a tag que fecha, e ela começa com uma barra.'
                },
                {
                  tipo: 'ordenar',
                  enunciado: 'Coloque as etapas na ordem para criar um parágrafo.',
                  lang: 'html',
                  etapas: ['<p>', 'Texto do parágrafo', '</p>'],
                  porque: 'Primeiro a tag que abre, depois o conteúdo e por fim a tag que fecha.'
                }
              ]
            },
            {
              id: 'html-2',
              titulo: 'Títulos e parágrafos',
              minutos: 4,
              xp: 25,
              fala: 'Todo texto bem organizado começa com um bom título.',
              intro: {
                titulo: 'Do título principal ao texto',
                paragrafos: [
                  'Os títulos vão de `h1` (o mais importante) até `h6`. Em geral, cada página tem um único `h1`.',
                  'Os textos corridos ficam dentro de `p`, de parágrafo.'
                ],
                codigo: {
                  arquivo: 'index.html',
                  lang: 'html',
                  texto: '<h1>Meu primeiro site</h1>\n<p>Aqui eu conto o que aprendi.</p>',
                  destaque: [1]
                },
                dica: 'Pense nos títulos como um sumário: o `h1` é o nome do livro, o `h2` é o nome de um capítulo.'
              },
              exercicios: [
                {
                  tipo: 'multipla',
                  enunciado: 'Qual tag cria o título principal da página?',
                  opcoes: ['<h1>', '<p>', '<h6>', '<title>'],
                  certa: 0,
                  porque: 'O `h1` é o título de maior destaque. O `h6` é o menor de todos.'
                },
                {
                  tipo: 'lacunas',
                  enunciado: 'Monte um título completo.',
                  lang: 'html',
                  arquivo: 'index.html',
                  modelo: '<{{0}}>Minha página<{{1}}>',
                  banco: ['h1', '/h1', 'p', '/p'],
                  respostas: ['h1', '/h1'],
                  porque: 'O título abre com `<h1>` e fecha com `</h1>`.'
                },
                {
                  tipo: 'desafio',
                  enunciado: 'Desafio prático: escreva um parágrafo com o texto **Oi**.',
                  lang: 'html',
                  placeholder: '<p>…</p>',
                  aceita: ['^<p>\\s*oi\\s*</p>$'],
                  solucao: '<p>Oi</p>',
                  dica: 'Abra com `<p>`, escreva Oi e feche com `</p>`.',
                  porque: 'Um parágrafo é a tag `p` com o texto no meio.'
                }
              ]
            }
          ]
        },
        {
          id: 'html-m2',
          nome: 'Links e listas',
          licoes: [
            {
              id: 'html-3',
              titulo: 'Links entre páginas',
              minutos: 4,
              xp: 25,
              fala: 'Links são o que faz a web ser uma teia.',
              intro: {
                titulo: 'A tag de link',
                paragrafos: [
                  'Um link usa a tag `a`. O endereço de destino vai no atributo `href`, dentro da tag que abre.',
                  'O texto entre as tags é o que a pessoa vê e clica.'
                ],
                codigo: {
                  arquivo: 'index.html',
                  lang: 'html',
                  texto: '<a href="https://exemplo.com">Visite o site</a>',
                  destaque: [1]
                },
                dica: 'Atributos ficam na tag que abre, no formato `nome="valor"`.'
              },
              exercicios: [
                {
                  tipo: 'multipla',
                  enunciado: 'Qual atributo define o endereço de destino de um link?',
                  opcoes: ['href', 'src', 'alt', 'class'],
                  certa: 0,
                  porque: '`href` vem de "hypertext reference", a referência para onde o link leva.'
                },
                {
                  tipo: 'lacunas',
                  enunciado: 'Complete o link.',
                  lang: 'html',
                  arquivo: 'index.html',
                  modelo: '<a {{0}}="https://exemplo.com">Visite</a>',
                  banco: ['href', 'src', 'alt', 'link'],
                  respostas: ['href'],
                  porque: 'É o `href` que guarda o endereço.'
                },
                {
                  tipo: 'desafio',
                  enunciado: 'Desafio prático: crie um link para **https://exemplo.com** com o texto **Entrar**.',
                  lang: 'html',
                  placeholder: '<a …>…</a>',
                  aceita: ['^<a\\s+href=["\']https://exemplo\\.com/?["\']\\s*>\\s*entrar\\s*</a>$'],
                  solucao: '<a href="https://exemplo.com">Entrar</a>',
                  dica: 'Comece com `<a href="` e depois o endereço entre aspas.',
                  porque: 'A tag `a` com o `href` e o texto Entrar no meio forma o link.'
                }
              ]
            },
            {
              id: 'html-4',
              titulo: 'Listas',
              minutos: 4,
              xp: 25,
              fala: 'Listas deixam tudo mais fácil de ler.',
              intro: {
                titulo: 'Itens com marcadores',
                paragrafos: [
                  'Uma lista com marcadores usa `ul`. Cada item fica dentro de uma tag `li`.',
                  'Se a ordem importar, use `ol` no lugar de `ul` e os itens ganham números.'
                ],
                codigo: {
                  arquivo: 'lista.html',
                  lang: 'html',
                  texto: '<ul>\n  <li>Pão</li>\n  <li>Leite</li>\n</ul>',
                  destaque: [2, 3]
                },
                dica: '`ul` quer dizer "unordered list" (lista sem ordem). `li` é "list item".'
              },
              exercicios: [
                {
                  tipo: 'multipla',
                  enunciado: 'Qual tag cria uma lista com marcadores?',
                  opcoes: ['<ul>', '<li>', '<list>', '<p>'],
                  certa: 0,
                  porque: 'O `ul` é o recipiente da lista. Os `li` são os itens que ficam dentro dele.'
                },
                {
                  tipo: 'ordenar',
                  enunciado: 'Coloque as linhas na ordem certa para montar a lista.',
                  lang: 'html',
                  etapas: ['<ul>', '  <li>Pão</li>', '  <li>Leite</li>', '</ul>'],
                  porque: 'A lista abre com `<ul>`, recebe os itens e só então fecha com `</ul>`.'
                },
                {
                  tipo: 'lacunas',
                  enunciado: 'Complete o item da lista.',
                  lang: 'html',
                  arquivo: 'lista.html',
                  modelo: '<ul>\n  <{{0}}>Café</{{1}}>\n</ul>',
                  banco: ['li', 'li', 'ul', 'p'],
                  respostas: ['li', 'li'],
                  porque: 'Cada item da lista é uma tag `li`.'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'python',
      nome: 'Python para iniciantes',
      modulos: [
        {
          id: 'py-m1',
          nome: 'Primeiros passos',
          licoes: [
            {
              id: 'py-1',
              titulo: 'Seu primeiro print',
              minutos: 3,
              xp: 20,
              fala: 'Hora de fazer o computador falar!',
              intro: {
                titulo: 'Mostrando algo na tela',
                paragrafos: [
                  'Em Python, o comando `print` mostra uma mensagem na tela.',
                  'O texto vai entre aspas, dentro dos parênteses.'
                ],
                codigo: { arquivo: 'ola.py', lang: 'python', texto: 'print("Olá, mundo!")', destaque: [1] },
                dica: 'Textos sempre ficam entre aspas. Sem aspas, o Python acha que é outra coisa.'
              },
              exercicios: [
                {
                  tipo: 'multipla',
                  enunciado: 'O que este código faz?\n`print("Oi")`',
                  opcoes: ['Mostra Oi na tela', 'Apaga a palavra Oi', 'Guarda Oi em um arquivo', 'Nada, está com erro'],
                  certa: 0,
                  porque: 'O `print` exibe na tela o que estiver entre os parênteses.'
                },
                {
                  tipo: 'lacunas',
                  enunciado: 'Complete o comando para mostrar a mensagem.',
                  lang: 'python',
                  arquivo: 'ola.py',
                  modelo: '{{0}}("Bom dia!")',
                  banco: ['print', 'imprimir', 'show', 'echo'],
                  respostas: ['print'],
                  porque: 'Em Python o comando para mostrar algo na tela se chama `print`.'
                },
                {
                  tipo: 'desafio',
                  enunciado: 'Desafio prático: escreva um comando que mostre a palavra **Oi**.',
                  lang: 'python',
                  placeholder: 'print(…)',
                  aceita: ['^print\\(\\s*["\']oi["\']\\s*\\)$'],
                  solucao: 'print("Oi")',
                  dica: 'Use print, parênteses e a palavra entre aspas.',
                  porque: 'O comando completo é `print("Oi")`.'
                }
              ]
            },
            {
              id: 'py-2',
              titulo: 'Variáveis',
              minutos: 4,
              xp: 25,
              fala: 'Variáveis são como etiquetas coladas em caixas.',
              intro: {
                titulo: 'Guardando valores',
                paragrafos: [
                  'Uma **variável** é um nome que guarda um valor. Criamos uma com o sinal de igual.',
                  'Depois, basta usar o nome sempre que precisar do valor.'
                ],
                codigo: {
                  arquivo: 'dados.py',
                  lang: 'python',
                  texto: 'nome = "Ana"\nidade = 12\nprint(nome)',
                  destaque: [1, 2]
                },
                dica: 'Escolha nomes claros, como `idade` ou `cidade`. Evite espaços e acentos.'
              },
              exercicios: [
                {
                  tipo: 'multipla',
                  enunciado: 'O que é uma variável?',
                  opcoes: ['Um nome que guarda um valor', 'Um erro no programa', 'Uma tecla do teclado', 'Um tipo de arquivo'],
                  certa: 0,
                  porque: 'A variável funciona como uma etiqueta: você dá um nome a um valor e o usa depois.'
                },
                {
                  tipo: 'ordenar',
                  enunciado: 'Coloque as partes na ordem para criar a variável `idade` com o valor 12.',
                  lang: 'python',
                  etapas: ['idade', '=', '12'],
                  porque: 'Primeiro o nome, depois o sinal de igual e por último o valor: `idade = 12`.'
                },
                {
                  tipo: 'desafio',
                  enunciado: 'Desafio prático: crie a variável **cidade** com o valor **"Recife"**.',
                  lang: 'python',
                  placeholder: 'cidade = …',
                  aceita: ['^cidade\\s*=\\s*["\']recife["\']$'],
                  solucao: 'cidade = "Recife"',
                  dica: 'Nome, igual e o texto entre aspas.',
                  porque: 'Como Recife é um texto, ele vai entre aspas: `cidade = "Recife"`.'
                }
              ]
            }
          ]
        },
        {
          id: 'py-m2',
          nome: 'Contas e decisões',
          licoes: [
            {
              id: 'py-3',
              titulo: 'Números e contas',
              minutos: 4,
              xp: 25,
              fala: 'O Python também é uma ótima calculadora.',
              intro: {
                titulo: 'Operações básicas',
                paragrafos: [
                  'Use `+` para somar, `-` para subtrair, `*` para multiplicar e `/` para dividir.',
                  'Você pode colocar a conta direto dentro do `print`.'
                ],
                codigo: {
                  arquivo: 'contas.py',
                  lang: 'python',
                  texto: 'a = 8\nb = 3\nprint(a + b)   # 11\nprint(a * b)   # 24',
                  destaque: [3, 4]
                },
                dica: 'O texto depois do `#` é um comentário. O Python ignora, e ele serve para explicar o código.'
              },
              exercicios: [
                {
                  tipo: 'multipla',
                  enunciado: 'Qual símbolo multiplica números em Python?',
                  opcoes: ['*', 'x', '%', '#'],
                  certa: 0,
                  porque: 'A multiplicação usa o asterisco: `4 * 3` resulta em 12.'
                },
                {
                  tipo: 'multipla',
                  enunciado: 'O que aparece na tela?\n`print(10 - 4)`',
                  opcoes: ['6', '14', '10 - 4', '104'],
                  certa: 0,
                  porque: 'O Python faz a conta antes de mostrar o resultado: 10 menos 4 é 6.'
                },
                {
                  tipo: 'desafio',
                  enunciado: 'Desafio prático: escreva um `print` que mostre a soma de **2** e **3**.',
                  lang: 'python',
                  placeholder: 'print(…)',
                  aceita: ['^print\\(\\s*2\\s*\\+\\s*3\\s*\\)$'],
                  solucao: 'print(2 + 3)',
                  dica: 'Coloque 2 + 3 dentro dos parênteses.',
                  porque: '`print(2 + 3)` faz a conta e mostra 5.'
                }
              ]
            },
            {
              id: 'py-4',
              titulo: 'Decisões com if',
              minutos: 5,
              xp: 30,
              fala: 'Agora o programa vai aprender a escolher.',
              intro: {
                titulo: 'Se isso, então aquilo',
                paragrafos: [
                  'Com `if` o programa só executa um trecho quando uma condição é verdadeira. O `else` cobre o caso contrário.',
                  'Os dois-pontos ao final da linha e o recuo (os espaços no começo) são obrigatórios.'
                ],
                codigo: {
                  arquivo: 'entrada.py',
                  lang: 'python',
                  texto: 'idade = 16\nif idade >= 18:\n    print("Pode entrar")\nelse:\n    print("Ainda não")',
                  destaque: [2, 4]
                },
                dica: '`>=` quer dizer "maior ou igual a".'
              },
              exercicios: [
                {
                  tipo: 'multipla',
                  enunciado: 'Com `idade = 16`, o que o código do exemplo mostra?',
                  opcoes: ['Ainda não', 'Pode entrar', 'Nada', 'Um erro'],
                  certa: 0,
                  porque: '16 não é maior ou igual a 18, então o Python executa o `else` e mostra "Ainda não".'
                },
                {
                  tipo: 'lacunas',
                  enunciado: 'Complete a condição: a pessoa passa com nota 7 ou mais.',
                  lang: 'python',
                  arquivo: 'nota.py',
                  modelo: 'nota = 8\nif nota {{0}} 7:\n    print("Aprovado")',
                  banco: ['>=', '=', '=>', '=<'],
                  respostas: ['>='],
                  porque: '`>=` compara "maior ou igual". O sinal `=` sozinho serve para guardar valores.'
                },
                {
                  tipo: 'ordenar',
                  enunciado: 'Coloque as linhas na ordem certa.',
                  lang: 'python',
                  etapas: ['if idade >= 18:', '    print("Pode entrar")', 'else:', '    print("Ainda não")'],
                  porque: 'Primeiro a condição com `if`, depois o que fazer se for verdadeira, e o `else` com a alternativa.'
                }
              ]
            }
          ]
        },
        {
          id: 'py-m3',
          nome: 'Repetição com for',
          emBreve: true,
          licoes: []
        }
      ]
    }
  ]
});
