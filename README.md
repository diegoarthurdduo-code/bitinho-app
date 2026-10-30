# Bitinho

Protótipo mobile (iPhone e Android) para aprender habilidades digitais com lições curtas.

## Estrutura

```
index.html            página e ordem de carregamento
styles.css            identidade visual (tokens de cor, tipografia, componentes)
app.js                motor do app: telas, exercícios, progresso, medalhas
content/
  programacao.js      HTML e Python
  informatica.js      Informática essencial
  ia.js               IA e produtividade
```

## Versão do app

A versão atual aparece discretamente no canto inferior do app. Ao preparar cada atualização que será enviada ao GitHub, atualize o número exibido em `index.html` seguindo o formato `vMAJOR.MINOR.PATCH` (por exemplo, `v1.0.0` para `v1.0.1`). Assim, depois do `git pull`, a versão visível confirma qual atualização está instalada.

## Como adicionar conteúdo

**Nova lição:** copie um objeto de `licoes` em qualquer arquivo de `content/`, troque o `id` (único) e o texto.

**Novo módulo ou trilha:** adicione um objeto em `modulos` ou `trilhas`. Use `emBreve: true` para mostrar um módulo ainda sem lições.

**Nova disciplina:** crie `content/minha-disciplina.js` com `window.BITINHO.disciplinas.push({ id, ordem, nome, icone, descricao, trilhas })`, depois inclua um `<script>` em `index.html` antes de `app.js`. Ícones disponíveis: `code`, `folder`, `sparkle` (outros em `app.js`, objeto `P`).

## Tipos de exercício

| tipo | campos principais |
| --- | --- |
| `multipla` | `enunciado`, `opcoes`, `certa` (índice), `porque` |
| `lacunas` | `modelo` com `{{0}}`, `{{1}}`…, `banco`, `respostas`, `lang` (`html`, `python` ou `frase`), `porque` |
| `ordenar` | `etapas` (já na ordem correta; o app embaralha), `lang`, `porque` |
| `desafio` | `aceita` (lista de expressões regulares), `solucao`, `dica`, `lang`, `porque` |

`pista` (opcional) aparece no primeiro erro. `porque` explica a resposta certa.

## Regras de progresso

- Cada lição libera a seguinte dentro da mesma trilha.
- Pontos são dados só na primeira conclusão (bônus de 10 sem erros).
- Estrelas: 3 sem erros, 2 com até 2 erros, 1 com mais.
- Sequência: um dia sem estudar não quebra a sequência. Depois disso ela recomeça, sem penalidade em pontos, e o melhor recorde é mantido.

## Para virar app nativo

A lógica de conteúdo (`content/*.js`) é dados puros e pode ser reaproveitada em React Native ou Flutter, ou empacotada com Capacitor.
