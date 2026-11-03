/*
  Disciplina: Programação (trilhas de HTML e Python).
  Para adicionar uma lição, copie um objeto de "licoes" e troque o conteúdo.
  Tipos de exercício: multipla, prever, corrigir, lacunas, ordenar, desafio (ver README.md).
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
        },
        { id: 'html-m3', nome: 'Projetos e CSS', licoes: [
        { id: 'html-5', titulo: 'Primeiros estilos com CSS', minutos: 6, xp: 35, fala: 'Agora vamos dar cor e personalidade às páginas!', intro: { titulo: 'Estrutura e aparência trabalham juntas', paragrafos: ['HTML organiza o significado e CSS cuida da aparência. Uma folha externa pode ser conectada com a tag link dentro de head.', 'Regras CSS usam seletor, chaves e declarações no formato propriedade: valor.'], codigo: { arquivo: 'index.html + estilos.css', lang: 'html', texto: '<link rel="stylesheet" href="estilos.css">\n\n.cartao {\n  color: #24123f;\n  background: #eee5ff;\n  padding: 16px;\n}', destaque: [1, 3, 4, 5] }, dica: 'O caminho de href precisa apontar para a folha CSS correta.' }, exercicios: [
          { tipo: 'multipla', enunciado: 'Qual trecho conecta a folha estilos.css à página?', opcoes: ['<link rel="stylesheet" href="estilos.css">', '<style src="estilos.css">', '<css href="estilos.css">'], certa: 0, porque: 'A tag link em head conecta uma folha externa; rel indica que ela é uma folha de estilos.' },
          { tipo: 'prever', enunciado: 'Qual classe o HTML precisa usar para receber estas regras?', lang: 'html', arquivo: 'estilos.css', codigo: '.cartao {\n  background: #eee5ff;\n  padding: 16px;\n}', opcoes: ['class="cartao"', 'id="estilos.css"', 'href="cartao"'], certa: 0, porque: 'O seletor .cartao escolhe elementos com class="cartao". O ponto pertence ao CSS e não vai no valor do atributo.' },
          { tipo: 'corrigir', enunciado: 'A regra abaixo está sem o bloco e o seletor correto. Escolha a versão que estiliza a classe aviso.', lang: 'html', arquivo: 'estilos.css', codigo: 'aviso {\n  color purple\n}', opcoes: ['.aviso {\n  color: purple;\n}', '#aviso {\n  color purple;\n}', '<aviso>color: purple</aviso>'], certa: 0, porque: 'Uma classe começa com ponto e a declaração CSS separa propriedade e valor com dois-pontos.' }
        ] },
        { id: 'html-6', titulo: 'Classes, seletores e aparência', minutos: 6, xp: 35, fala: 'Vamos reaproveitar estilos sem copiar regras por toda a página.', intro: { titulo: 'Selecione os elementos certos', paragrafos: ['Uma classe pode ser reutilizada em vários elementos. No CSS, o ponto seleciona uma classe. Um seletor de tag, como p, atinge todos os parágrafos.', 'Ids devem identificar um elemento único. A cascata resolve estilos concorrentes olhando prioridade e ordem.'], codigo: { arquivo: 'index.html + estilos.css', lang: 'html', texto: '<h2 class="destaque">Minha meta</h2>\n<p class="destaque">Estudar toda semana.</p>\n\n.destaque { color: purple; }', destaque: [1, 2, 4] }, dica: 'Prefira classes para criar estilos reutilizáveis.' }, exercicios: [
          { tipo: 'multipla', enunciado: 'Qual seletor escolhe elementos com class="destaque"?', opcoes: ['.destaque', '#destaque', 'destaque'], certa: 0, porque: 'O ponto seleciona uma classe. # seleciona um id e sem símbolo o CSS procura uma tag.' },
          { tipo: 'prever', enunciado: 'Qual propriedade muda a cor do texto para roxo?', lang: 'html', arquivo: 'estilos.css', codigo: '.destaque {\n  color: purple;\n  background: white;\n}', opcoes: ['color', 'background', 'border-radius'], certa: 0, porque: 'color define a cor do texto; background define o fundo.' },
          { tipo: 'corrigir', enunciado: 'Escolha a regra que aplica espaçamento interno aos cartões.', lang: 'html', arquivo: 'estilos.css', codigo: '.cartao {\n  padding 16px\n}', opcoes: ['.cartao { padding: 16px; }', '#cartao { margin 16px; }', 'cartao: padding(16px);'], certa: 0, porque: 'A sintaxe CSS usa propriedade: valor; dentro das chaves. padding cria espaço interno.' }
        ] },
        { id: 'html-7', titulo: 'Layouts flexíveis para celular', minutos: 7, xp: 40, fala: 'Seu projeto precisa caber em telas grandes e pequenas.', intro: { titulo: 'Flexbox e adaptação', paragrafos: ['Flexbox organiza itens dentro de um contêiner. flex-wrap permite que os cartões quebrem para outra linha quando o espaço diminuir.', 'gap cria distância uniforme entre itens. Sempre confira a página em uma largura estreita.'], codigo: { arquivo: 'estilos.css', lang: 'html', texto: '.cartoes {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 12px;\n}', destaque: [1, 2, 3, 4] }, dica: 'Um layout responsivo reorganiza o conteúdo em vez de exigir rolagem horizontal.' }, exercicios: [
          { tipo: 'prever', enunciado: 'Em uma tela estreita, o que flex-wrap: wrap permite?', lang: 'html', arquivo: 'estilos.css', codigo: '.cartoes {\n  display: flex;\n  flex-wrap: wrap;\n}', opcoes: ['Os itens podem passar para a linha seguinte', 'O texto fica automaticamente em negrito', 'A página ganha uma tabela'], certa: 0, porque: 'wrap permite que os itens continuem em outra linha quando não cabem lado a lado.' },
          { tipo: 'ordenar', enunciado: 'Organize as declarações para ativar Flexbox e criar distância entre cartões.', lang: 'html', etapas: ['.cartoes {', '  display: flex;', '  gap: 12px;', '}'], porque: 'O seletor abre o bloco, as propriedades ficam dentro das chaves e o bloco é fechado no fim.' },
          { tipo: 'corrigir', enunciado: 'Corrija a regra para que os cartões possam quebrar de linha.', lang: 'html', arquivo: 'estilos.css', codigo: '.cartoes {\n  display: flex;\n  flex: wrap;\n}', opcoes: ['.cartoes { display: flex; flex-wrap: wrap; }', '.cartoes { display: wrap; flex: flex; }', '.cartoes { break: line; }'], certa: 0, porque: 'A propriedade correta se chama flex-wrap e recebe wrap como valor.' }
        ] },
        { id: 'html-8', titulo: 'Formulários claros e acessíveis', minutos: 7, xp: 40, fala: 'Um bom formulário explica o que a pessoa precisa preencher.', intro: { titulo: 'Rótulos, campos e validação', paragrafos: ['Conecte label e input usando for e id com o mesmo valor. Isso torna o campo mais fácil de compreender e selecionar.', 'required e type ajudam o navegador a verificar entradas simples. Um aplicativo real também valida dados no servidor.'], codigo: { arquivo: 'cadastro.html', lang: 'html', texto: '<label for="email">E-mail</label>\n<input id="email" name="email" type="email" required>', destaque: [1, 2] }, dica: 'Não use placeholder como único rótulo: ele desaparece quando a pessoa começa a digitar.' }, exercicios: [
          { tipo: 'corrigir', enunciado: 'Escolha o formulário com label corretamente conectado ao campo.', lang: 'html', arquivo: 'cadastro.html', codigo: '<label>E-mail</label>\n<input type="email">', opcoes: ['<label for="email">E-mail</label>\n<input id="email" name="email" type="email" required>', '<label id="email">E-mail</label>\n<input for="email">', '<input type="email" placeholder="E-mail">'], certa: 0, porque: 'O for do label deve ser igual ao id do campo. name identifica o dado no envio.' },
          { tipo: 'lacunas', enunciado: 'Ligue o rótulo ao campo usando o mesmo identificador.', lang: 'html', arquivo: 'cadastro.html', modelo: '<label {{0}}="email">E-mail</label>\n<input {{1}}="email" type="email">', banco: ['for', 'id', 'class', 'src'], respostas: ['for', 'id'], porque: 'for no label e id no input precisam compartilhar o mesmo valor.' },
          { tipo: 'multipla', enunciado: 'O que required faz neste campo?', opcoes: ['Pede que o campo seja preenchido antes do envio', 'Envia os dados a um servidor automaticamente', 'Cria um rótulo visível'], certa: 0, porque: 'required ativa uma verificação básica do navegador. Ele não envia dados sozinho nem substitui validação no servidor.' }
        ] },
        { id: 'html-9', titulo: 'Projeto: monte seu portfólio', minutos: 8, xp: 50, fala: 'Hora de juntar estrutura, estilos e acessibilidade num projeto.', intro: { titulo: 'Uma página para apresentar seu trabalho', paragrafos: ['Planeje uma introdução, uma seção sobre você, projetos e contato. Use tags semânticas e links que expliquem seu destino.', 'Depois conecte CSS, confira os cartões em telas pequenas e navegue usando Tab.'], codigo: { arquivo: 'index.html', lang: 'html', texto: '<header><h1>Portfólio da Lia</h1></header>\n<main>\n  <section><h2>Meus projetos</h2></section>\n</main>\n<footer>Contato</footer>', destaque: [1, 2, 3, 4, 5] }, dica: 'Comece pelo conteúdo e pela ordem; depois cuide da apresentação visual.' }, exercicios: [
          { tipo: 'ordenar', enunciado: 'Organize uma estrutura de página com conteúdo principal e encerramento.', lang: 'html', etapas: ['<header><h1>Meu portfólio</h1></header>', '<main>', '  <section><h2>Projetos</h2></section>', '</main>', '<footer>Contato</footer>'], porque: 'header apresenta a página, main contém o assunto principal e footer encerra com informações complementares.' },
          { tipo: 'desafio', enunciado: 'Escreva um link para projetos.html com o texto Ver projetos.', lang: 'html', arquivo: 'index.html', placeholder: '<a href="…">…</a>', aceita: ['^<a\\s+href=["\']projetos\\.html["\']>\\s*ver projetos\\s*</a>$'], solucao: '<a href="projetos.html">Ver projetos</a>', dica: 'Use a tag a, coloque o caminho no atributo href e escreva o texto entre as tags.', porque: 'Um link precisa de um destino href e de um texto clicável que explique o destino.' },
          { tipo: 'multipla', enunciado: 'Por que vale testar o portfólio com Tab?', opcoes: ['Para verificar se é possível navegar pelos controles usando teclado', 'Para mudar a cor dos cartões', 'Para contar quantas tags há na página'], certa: 0, porque: 'A navegação com Tab ajuda a conferir se links e campos têm foco visível e uma ordem que faz sentido.' }
        ] }
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
          licoes: [
            {
              id: 'py-5', titulo: 'Repetindo com for', minutos: 4, xp: 25,
              fala: 'Vamos ensinar o computador a repetir uma tarefa!',
              intro: { titulo: 'Uma instrução, várias voltas', paragrafos: ['O `for` percorre uma sequência e executa o bloco uma vez para cada item.', '`range(3)` gera 0, 1 e 2. O recuo indica o que será repetido.'], codigo: { arquivo: 'repeticao.py', lang: 'python', texto: 'for numero in range(3):\n    print("Volta", numero)', destaque: [1, 2] }, dica: 'O limite final de range não entra na contagem.' },
              exercicios: [
                { tipo: 'multipla', enunciado: 'Quantas vezes roda o bloco em `range(4)`?', opcoes: ['3 vezes', '4 vezes', '5 vezes', 'Uma vez'], certa: 1, porque: 'range(4) produz 0, 1, 2 e 3: quatro valores.' },
                { tipo: 'lacunas', enunciado: 'Complete o comando de repetição.', lang: 'python', arquivo: 'cores.py', modelo: '{{0}} cor in ["azul", "roxo"]:\n    print(cor)', banco: ['for', 'if', 'while'], respostas: ['for'], porque: 'for percorre os itens da lista, um de cada vez.' },
                { tipo: 'ordenar', enunciado: 'Organize um laço que mostra 0, 1 e 2.', lang: 'python', etapas: ['for n in range(3):', '    print(n)'], porque: 'O bloco indentado fica logo abaixo da linha for.' }
              ]
            },
            {
              id: 'py-6', titulo: 'Criando funções', minutos: 5, xp: 30,
              fala: 'Uma função é uma receita que podemos reutilizar.',
              intro: { titulo: 'Dê um nome para uma tarefa', paragrafos: ['`def` cria uma função. Ela pode receber parâmetros e devolver um valor com `return`.', 'Depois de definir, chame a função pelo nome para executar suas instruções.'], codigo: { arquivo: 'funcoes.py', lang: 'python', texto: 'def dobro(numero):\n    return numero * 2\n\nprint(dobro(5))', destaque: [1, 2, 4] }, dica: 'O parâmetro numero recebe o valor passado na chamada: neste exemplo, 5.' },
              exercicios: [
                { tipo: 'multipla', enunciado: 'O que `return` faz dentro de uma função?', opcoes: ['Devolve um resultado', 'Repete o código', 'Apaga uma variável', 'Abre uma janela'], certa: 0, porque: 'return entrega o resultado da função para o trecho que a chamou.' },
                { tipo: 'lacunas', enunciado: 'Complete a palavra que define uma função.', lang: 'python', arquivo: 'saudacao.py', modelo: '{{0}} oi():\n    print("Oi!")', banco: ['def', 'for', 'if'], respostas: ['def'], porque: 'def é a palavra reservada usada para definir uma função.' }
              ]
            }
          ]
        },
        { id: 'py-m4', nome: 'Projetos e dados', licoes: [
          { id: 'py-7', titulo: 'Listas para guardar coleções', minutos: 6, xp: 35, fala: 'Vamos guardar vários itens numa única variável!', intro: { titulo: 'Uma coleção em ordem', paragrafos: ['Listas guardam vários valores e permitem consultar posições, adicionar novos dados e percorrer itens com for.', 'enumerate() pode entregar posição e valor ao mesmo tempo.'], codigo: { arquivo: 'materias.py', lang: 'python', texto: 'materias = ["HTML", "Python"]\nmaterias.append("Projetos")\nfor posicao, materia in enumerate(materias, start=1):\n    print(posicao, materia)', destaque: [1, 2, 3, 4] }, dica: 'Índices de lista começam em zero. enumerate(start=1) é útil para exibir uma contagem começando em um.' }, exercicios: [
            { tipo: 'prever', enunciado: 'O que o programa mostra depois de adicionar CSS à lista?', lang: 'python', arquivo: 'materias.py', codigo: 'materias = ["HTML", "Python"]\nmaterias.append("CSS")\nprint(len(materias))', opcoes: ['2', '3', 'CSS'], certa: 1, porque: 'A lista começa com dois itens e append acrescenta um terceiro; len conta os itens.' },
            { tipo: 'lacunas', enunciado: 'Complete o método que adiciona um item ao final da lista.', lang: 'python', arquivo: 'tarefas.py', modelo: 'tarefas = ["Ler"]\ntarefas.{{0}}("Praticar")', banco: ['append', 'remove', 'count'], respostas: ['append'], porque: 'append() acrescenta um elemento ao fim da lista.' },
            { tipo: 'desafio', enunciado: 'Escreva duas linhas para criar uma lista chamada cores com azul e roxo e mostrar a lista.', lang: 'python', arquivo: 'cores.py', placeholder: 'cores = […]\nprint(cores)', aceita: ['^cores\\s*=\\s*\\[["\']azul["\']\\s*,\\s*["\']roxo["\']\\]\\s*print\\(cores\\)$'], solucao: 'cores = ["azul", "roxo"]\nprint(cores)', dica: 'Use colchetes e separe os textos por vírgula. Depois passe a variável para print().', porque: 'A lista guarda os dois textos em sequência e print mostra seu conteúdo.' }
          ] },
          { id: 'py-8', titulo: 'Dicionários para dados nomeados', minutos: 6, xp: 35, fala: 'Nem todo conjunto de dados é uma lista: às vezes cada valor tem um nome.', intro: { titulo: 'Chaves e valores', paragrafos: ['Um dicionário associa uma chave a um valor. Ele é útil para representar propriedades de uma pessoa, produto ou pergunta.', 'Acesse e atualize dados usando a chave entre colchetes.'], codigo: { arquivo: 'aluno.py', lang: 'python', texto: 'aluno = {"nome": "Lia", "pontos": 80}\naluno["pontos"] += 10\nprint(aluno["nome"], aluno["pontos"])', destaque: [1, 2, 3] }, dica: 'Use get() quando a chave talvez ainda não exista.' }, exercicios: [
            { tipo: 'multipla', enunciado: 'Como acessar o valor da chave nome em aluno?', opcoes: ['aluno["nome"]', 'aluno.nome()', 'aluno("nome")'], certa: 0, porque: 'Colchetes com a chave localizam o valor associado no dicionário.' },
            { tipo: 'prever', enunciado: 'Qual valor será exibido depois da atualização?', lang: 'python', arquivo: 'pontos.py', codigo: 'perfil = {"pontos": 12}\nperfil["pontos"] += 3\nprint(perfil["pontos"])', opcoes: ['12', '15', '3'], certa: 1, porque: 'A atualização soma três ao valor anterior, então o dicionário passa a guardar quinze pontos.' },
            { tipo: 'corrigir', enunciado: 'Corrija a sintaxe do dicionário para associar nome a Lia.', lang: 'python', arquivo: 'perfil.py', codigo: 'perfil = {"nome" "Lia"}', opcoes: ['perfil = {"nome": "Lia"}', 'perfil = ["nome" = "Lia"]', 'perfil = ("nome": "Lia")'], certa: 0, porque: 'Cada chave e valor são separados por dois-pontos, e o par fica entre chaves.' }
          ] },
          { id: 'py-9', titulo: 'Funções que resolvem tarefas', minutos: 7, xp: 40, fala: 'Vamos transformar uma solução em uma ferramenta que dá para reutilizar.', intro: { titulo: 'Parâmetros entram, return devolve', paragrafos: ['Parâmetros são nomes que recebem valores na chamada. return encerra a função e entrega um resultado.', 'Separar tarefas em funções pequenas deixa o projeto mais organizado.'], codigo: { arquivo: 'media.py', lang: 'python', texto: 'def calcular_media(notas):\n    return sum(notas) / len(notas)\n\nresultado = calcular_media([8, 9, 7])\nprint(resultado)', destaque: [1, 2, 4, 5] }, dica: 'A lista enviada na chamada vira o valor do parâmetro notas.' }, exercicios: [
            { tipo: 'ordenar', enunciado: 'Organize uma função que devolve o dobro de um número.', lang: 'python', etapas: ['def dobro(numero):', '    resultado = numero * 2', '    return resultado', 'print(dobro(4))'], porque: 'Primeiro definimos a função e seu parâmetro, calculamos o valor, devolvemos com return e depois chamamos a função.' },
            { tipo: 'prever', enunciado: 'Qual valor aparece na tela?', lang: 'python', arquivo: 'dobro.py', codigo: 'def dobro(n):\n    return n * 2\nprint(dobro(6))', opcoes: ['6', '8', '12'], certa: 2, porque: 'A chamada envia 6 para n. A função multiplica por 2 e devolve 12.' },
            { tipo: 'desafio', enunciado: 'Escreva uma função chamada quadrado que receba n e devolva n multiplicado por ele mesmo.', lang: 'python', arquivo: 'quadrado.py', placeholder: 'def quadrado(n):\n    return …', aceita: ['^def\\s+quadrado\\(n\\):\\s*return\\s+n\\s*\\*\\s*n$'], solucao: 'def quadrado(n):\n    return n * n', dica: 'Defina com def quadrado(n): e coloque return indentado na linha seguinte.', porque: 'O parâmetro n recebe o valor e return devolve seu produto por ele mesmo.' }
          ] },
          { id: 'py-10', titulo: 'Tratar entradas inválidas', minutos: 7, xp: 40, fala: 'Um bom programa também sabe reagir quando algo dá errado.', intro: { titulo: 'Prepare-se para entradas inesperadas', paragrafos: ['Converter texto inválido para inteiro pode gerar ValueError. try envolve a operação e except trata esse erro esperado.', 'Uma mensagem específica orienta a pessoa sem ocultar outros problemas de programação.'], codigo: { arquivo: 'idade.py', lang: 'python', texto: 'texto = input("Idade: ")\ntry:\n    idade = int(texto)\nexcept ValueError:\n    print("Digite um número.")\nelse:\n    print(idade)', destaque: [2, 3, 4, 5] }, dica: 'Evite except genérico quando você sabe qual erro precisa tratar.' }, exercicios: [
            { tipo: 'corrigir', enunciado: 'Escolha o tratamento que captura a conversão inválida para inteiro.', lang: 'python', arquivo: 'idade.py', codigo: 'try:\n    idade = int(texto)\nexcept:\n    print("Erro")', opcoes: ['try:\n    idade = int(texto)\nexcept ValueError:\n    print("Digite um número inteiro.")', 'try idade = int(texto)\ncatch ValueError:\n    print("Erro")', 'except ValueError:\n    idade = try(int(texto))'], certa: 0, porque: 'except ValueError captura especificamente uma conversão inválida e pode orientar a pessoa sobre como corrigir.' },
            { tipo: 'prever', enunciado: 'O que aparece se texto contiver "doze"?', lang: 'python', arquivo: 'entrada.py', codigo: 'texto = "doze"\ntry:\n    idade = int(texto)\nexcept ValueError:\n    print("Digite um número.")', opcoes: ['12', 'Digite um número.', 'Não aparece nada'], certa: 1, porque: 'A palavra doze não é um texto numérico que int converta; ValueError leva o programa ao except.' },
            { tipo: 'lacunas', enunciado: 'Complete o bloco que captura um erro de conversão para inteiro.', lang: 'python', arquivo: 'entrada.py', modelo: 'try:\n    valor = int(texto)\n{{0}} ValueError:\n    print("Entrada inválida")', banco: ['except', 'else', 'for'], respostas: ['except'], porque: 'except ValueError trata a falha de conversão que ocorreu dentro de try.' }
          ] },
          { id: 'py-11', titulo: 'Projeto: crie um quiz', minutos: 9, xp: 50, fala: 'Vamos juntar listas, dicionários, laços, condições e funções num projeto!', intro: { titulo: 'Um programa de perguntas e pontos', paragrafos: ['Cada pergunta pode ser um dicionário guardado numa lista. Um for apresenta as perguntas e uma condição compara respostas.', 'Uma função pode cuidar da rodada e devolver a pontuação para o restante do programa.'], codigo: { arquivo: 'quiz.py', lang: 'python', texto: 'perguntas = [{"texto": "2 + 2?", "resposta": "4"}]\npontos = 0\nfor pergunta in perguntas:\n    resposta = input(pergunta["texto"] + " ")\n    if resposta.strip() == pergunta["resposta"]:\n        pontos += 1\nprint("Pontos:", pontos)', destaque: [1, 3, 4, 5, 6, 7] }, dica: 'Teste a resposta certa, uma errada e uma resposta com espaços extras.' }, exercicios: [
            { tipo: 'ordenar', enunciado: 'Organize os passos para conferir uma resposta e somar pontos.', lang: 'python', etapas: ['pontos = 0', 'for pergunta in perguntas:', '    resposta = input(pergunta["texto"])', '    if resposta == pergunta["resposta"]:', '        pontos += 1'], porque: 'Inicialize a pontuação, percorra cada pergunta, receba resposta, compare e some um ponto quando houver acerto.' },
            { tipo: 'prever', enunciado: 'Quantos pontos serão mostrados?', lang: 'python', arquivo: 'quiz.py', codigo: 'respostas = ["sim", "não", "sim"]\npontos = 0\nfor resposta in respostas:\n    if resposta == "sim":\n        pontos += 1\nprint(pontos)', opcoes: ['1', '2', '3'], certa: 1, porque: 'Duas respostas são iguais a sim, então o laço soma dois pontos.' },
            { tipo: 'desafio', enunciado: 'Crie uma pergunta como dicionário com a chave texto valendo Quanto é 3 + 1? e resposta valendo 4.', lang: 'python', arquivo: 'quiz.py', placeholder: '{"texto": "…", "resposta": "…"}', aceita: ['^\\{\\s*["\']texto["\']\\s*:\\s*["\']quanto é 3 \\+ 1\\?["\']\\s*,\\s*["\']resposta["\']\\s*:\\s*["\']4["\']\\s*\\}$'], solucao: '{"texto": "Quanto é 3 + 1?", "resposta": "4"}', dica: 'Use chaves, escreva cada chave entre aspas e separe chave e valor com dois-pontos.', porque: 'O dicionário guarda o enunciado e a resposta em campos que o laço do quiz pode consultar.' }
          ] }
        ] }
      ]
    }
  ]
});
