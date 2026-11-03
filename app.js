/* Bitinho: motor do app. O conteúdo vem de content/*.js (window.BITINHO.disciplinas). */
(function () {
  'use strict';

  var APP = document.getElementById('app');
  var DISC = ((window.BITINHO && window.BITINHO.disciplinas) || []).slice().sort(function (a, b) { return a.ordem - b.ordem; });
  var KEY = 'bitinho-v1';
  var USERS_KEY = 'bitinho-users-v1';
  var auth = { mode: 'login', user: localStorage.getItem('bitinho-session-v1') || '' };
  function users() { try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); } catch (_) { return {}; } }
  function dataKey() { return KEY + ':' + (auth.user || 'guest'); }

  /* ---------- Índice das lições ---------- */
  var LIC = {};
  DISC.forEach(function (d) {
    d.trilhas.forEach(function (t) {
      var flat = [];
      t.modulos.forEach(function (m) { (m.licoes || []).forEach(function (l) { flat.push({ d: d, t: t, m: m, l: l }); }); });
      flat.forEach(function (x, i) {
        LIC[x.l.id] = { d: x.d, t: x.t, m: x.m, l: x.l, prev: i > 0 ? flat[i - 1].l.id : null, next: i < flat.length - 1 ? flat[i + 1].l.id : null };
      });
      t._flat = flat.map(function (x) { return x.l.id; });
    });
  });

  /* ---------- Datas ---------- */
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function hoje() { return iso(new Date()); }
  function deslocar(dias) { var d = new Date(); d.setDate(d.getDate() + dias); return iso(d); }
  function diasEntre(a, b) { return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5); }

  /* ---------- Estado ---------- */
  function estadoDemo() {
    return {
      nome: 'Aprendiz',
      apelido: '',
      bio: '',
      nota: '',
      xp: 70,
      streak: 3,
      melhor: 3,
      diasEstudo: 5,
      ultimoDia: deslocar(-1),
      hojeData: hoje(),
      hojeQtd: 0,
      concluidas: { 'html-1': { estrelas: 3 }, 'html-2': { estrelas: 2 } },
      skinsBitinho: { classico: true },
      desafiosBitinho: {},
      skinEquipada: 'classico',
      ultima: { disc: 'programacao', trilha: 'html' },
      config: { tema: 'auto', plataforma: /Android/i.test(navigator.userAgent) ? 'android' : 'ios', lembrete: true, meta: 1 }
    };
  }
  function carregar() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(dataKey())); } catch (e) { s = null; }
    if (!s || typeof s !== 'object' || !s.concluidas) s = estadoDemo();
    s.apelido = s.apelido || '';
    s.bio = s.bio || '';
    s.nota = s.nota || '';
    s.skinsBitinho = Object.assign({ classico: true }, s.skinsBitinho || {});
    s.desafiosBitinho = s.desafiosBitinho || {};
    s.skinEquipada = s.skinEquipada || 'classico';
    s.config = Object.assign({ tema: 'auto', plataforma: 'ios', lembrete: true, meta: 1 }, s.config || {});
    return s;
  }
  var S = carregar();
  var retorno = false;
  (function ajustarDia() {
    if (S.hojeData !== hoje()) { S.hojeData = hoje(); S.hojeQtd = 0; }
    if (S.ultimoDia && S.streak > 0 && diasEntre(S.ultimoDia, hoje()) > 2) { S.streak = 0; retorno = true; }
  })();
  function salvar() { try { localStorage.setItem(dataKey(), JSON.stringify(S)); } catch (e) { /* sem armazenamento */ } }

  var ui = { tab: 'inicio', screen: 'inicio', params: {}, from: null, trilhaSel: {}, lesson: null, result: null };
  var secaoBitinho = 'acessorios', respostaSkinSel = null, feedbackSkin = null, desafioSkinAtual = 'html', skinErroId = '';
  var fundoInterativo = { canvas: null, ctx: null, pontos: [], ondas: [], ponteiro: { x: -1000, y: -1000 }, largura: 0, altura: 0, escala: 1, quadro: 0, ultimoDesenho: 0, eventosLigados: false, movimentoReduzido: false };
  var reacaoBitinhoTimer = null, reacaoBitinhoLimpeza = null;

  /* ---------- Utilidades ---------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function fmt(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="ic-inline">$1</code>')
      .replace(/\n/g, '<br>');
  }
  function shuffle(arr, igual) {
    var a = arr.slice(), tent = 0;
    do {
      for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
      tent++;
    } while (igual && a.every(function (v, k) { return v === arr[k]; }) && tent < 10);
    return a;
  }
  function bar(pct, from) { return '<div class="bar"><i style="width:' + pct + '%;--from:' + (from || 0) + '%"></i></div>'; }
  function saudacao() { var h = new Date().getHours(); return h < 5 ? 'Boa madrugada' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; }
  function nivel() { return Math.floor(S.xp / 100) + 1; }

  /* ---------- Ícones ---------- */
  var P = {
    home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
    code: '<path d="M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    sparkle: '<path d="M11 3l1.9 5.6L18.5 10.5l-5.6 1.9L11 18l-1.9-5.6L3.5 10.5l5.6-1.9z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="3"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>',
    flame: '<path d="M12 3c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z"/>',
    bolt: '<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>',
    star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8z"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    chevL: '<path d="M15 5l-7 7 7 7"/>',
    medal: '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5L7 21l5-3 5 3-1.5-7.5"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    retry: '<path d="M4 12a8 8 0 1 0 3-6.2M4 4v4.5h4.5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    terminal: '<rect x="3" y="4.5" width="18" height="15" rx="3"/><path d="M7 10l3 2.5L7 15M12.5 15H17"/>',
    ok: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
    no: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>'
  };
  function ic(n, cls) { return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + P[n] + '</svg>'; }

  var SKINS_BITINHO = [
    { id: 'classico', nome: 'Bitinho clássico', emoji: '✨', origem: 'Sempre disponível', svg: '' },
    { id: 'cap1', nome: 'Aprendiz', emoji: '🎓', capitulo: 1, svg: '<path d="M17 17h34l-4-12H21z" fill="#29c3a6" stroke="#136b62" stroke-width="2"/><path d="M13 17q21 7 42 0v5q-21 8-42 0z" fill="#49e0bd" stroke="#136b62" stroke-width="2"/><path d="M48 8l4 4" stroke="#f6ce52" stroke-width="3"/>' },
    { id: 'cap2', nome: 'Óculos Hacker', emoji: '🕶️', capitulo: 2, svg: '<path d="M17 29h12l2 7q-7 5-13 0zm22 0h12l-1 7q-6 5-13 0zM29 32h10" fill="#53e0c2" stroke="#10202e" stroke-width="2.5" stroke-linejoin="round"/>' },
    { id: 'cap3', nome: 'Coroa de Bits', emoji: '👑', capitulo: 3, svg: '<path d="M18 19l-3-11 10 7 9-12 9 12 10-7-3 11z" fill="#ffd45b" stroke="#b87516" stroke-width="2.5" stroke-linejoin="round"/><path d="M19 21h30" stroke="#fff0a6" stroke-width="2"/>' },
    { id: 'cap4', nome: 'Faixa Ninja', emoji: '🥷', capitulo: 4, svg: '<path d="M13 25q21-6 42 0v8q-21-6-42 0z" fill="#ff647c" stroke="#9e2448" stroke-width="2"/><path d="M48 30q9 1 10 8l-8-2" fill="none" stroke="#ff647c" stroke-width="3" stroke-linecap="round"/>' },
    { id: 'cap5', nome: 'Capacete Espacial', emoji: '🚀', capitulo: 5, svg: '<circle cx="34" cy="34" r="27" fill="none" stroke="#8de7ff" stroke-width="3" opacity=".88"/><path d="M13 42q20 13 42 0" fill="none" stroke="#d7faff" stroke-width="2"/>' },
    { id: 'cap6', nome: 'Fone Criativo', emoji: '🎧', capitulo: 6, svg: '<path d="M12 32a22 22 0 0 1 44 0" fill="none" stroke="#ff8fc0" stroke-width="5"/><rect x="8" y="29" width="9" height="17" rx="4" fill="#ff8fc0"/><rect x="51" y="29" width="9" height="17" rx="4" fill="#ff8fc0"/>' },
    { id: 'cap7', nome: 'Chifrinhos Pixel', emoji: '🐉', capitulo: 7, svg: '<path d="M19 21Q11 9 20 8l9 14m20-1Q57 9 48 8l-9 14" fill="#9be26d" stroke="#438839" stroke-width="2.5" stroke-linejoin="round"/>' },
    { id: 'cap8', nome: 'Chapéu de Mago', emoji: '🧙', capitulo: 8, svg: '<path d="M19 21L28 3q3-5 7 0l15 18z" fill="#8662ed" stroke="#4b319d" stroke-width="2.5"/><path d="M18 21h34v5H18z" fill="#ffd45b"/><path d="M31 10l2 3 3-2" fill="none" stroke="#fff" stroke-width="2"/>' },
    { id: 'cap9', nome: 'Mochila Dragão', emoji: '🐲', capitulo: 9, svg: '<path d="M13 31q-8 5-2 13l8-4m35-9q8 5 2 13l-8-4" fill="none" stroke="#ff8d4d" stroke-width="4" stroke-linecap="round"/><path d="M21 53q13 8 26 0" fill="none" stroke="#ff8d4d" stroke-width="4" stroke-linecap="round"/>' },
    { id: 'cap10', nome: 'Look de Formatura', emoji: '🎉', capitulo: 10, svg: '<path d="M16 23l18-15 18 15H16z" fill="#343047" stroke="#191627" stroke-width="2"/><path d="M34 9v16m0 0q7 2 8-3" fill="none" stroke="#ffd45b" stroke-width="2.5"/><circle cx="43" cy="21" r="2.5" fill="#ffd45b"/>' },
    { id: 'cap11', nome: 'Estilista CSS', emoji: '🎨', capitulo: 11, svg: '<path d="M18 18h32v25H18z" fill="#a78bfa" stroke="#5837a7" stroke-width="2.5"/><path d="M25 26h18M25 32h13M25 38h8" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>' },
    { id: 'cap12', nome: 'Mestre dos Seletores', emoji: '🎯', capitulo: 12, svg: '<circle cx="34" cy="33" r="22" fill="#f472b6" stroke="#9d286c" stroke-width="2.5"/><circle cx="34" cy="33" r="13" fill="none" stroke="#fff" stroke-width="3"/><circle cx="34" cy="33" r="4" fill="#fff"/>' },
    { id: 'cap13', nome: 'Guardião Responsivo', emoji: '📱', capitulo: 13, svg: '<rect x="21" y="8" width="26" height="50" rx="6" fill="#38bdf8" stroke="#155e91" stroke-width="3"/><path d="M27 17h14M27 23h14M28 48h12" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>' },
    { id: 'cap14', nome: 'Herói Acessível', emoji: '♿', capitulo: 14, svg: '<circle cx="34" cy="34" r="22" fill="#34d399" stroke="#167a63" stroke-width="2.5"/><path d="M24 34l7 7 14-16" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' },
    { id: 'cap15', nome: 'Lenda do Portfólio', emoji: '🚀', capitulo: 15, svg: '<path d="M34 8q17 10 14 31L34 53 20 39Q17 18 34 8z" fill="#fb923c" stroke="#a94419" stroke-width="2.5"/><circle cx="34" cy="27" r="6" fill="#fff"/><path d="M22 39l-7 9 13-3m20-6 7 9-13-3" fill="#ffcf5c" stroke="#a94419" stroke-width="2"/>' },
    { id: 'bonus_html', nome: 'Mestre HTML', emoji: '🌐', exclusiva: true, desafio: 'html', svg: '<path d="M15 24q19-9 38 0l-3 29q-16 9-32 0z" fill="#ff8c52" stroke="#b44c23" stroke-width="2.5"/><path d="M24 33h20M24 40h16M24 47h11" stroke="#fff4e8" stroke-width="2.5" stroke-linecap="round"/>' },
    { id: 'bonus_python', nome: 'Mestre Python', emoji: '🐍', exclusiva: true, desafio: 'python', svg: '<path d="M17 30q0-12 17-12h8q11 0 11 10v6H30q-13 0-13 11v-15z" fill="#ffd45b" stroke="#a8751d" stroke-width="2.5"/><path d="M51 39q0 12-17 12h-8q-11 0-11-10v-6h23q13 0 13-11z" fill="#62a9ff" stroke="#3267b4" stroke-width="2.5"/><circle cx="42" cy="24" r="1.8" fill="#342657"/><circle cx="26" cy="47" r="1.8" fill="#342657"/>' },
    { id: 'bonus_logica', nome: 'Guardião da Lógica', emoji: '🛡️', exclusiva: true, desafio: 'logica', svg: '<path d="M34 13l20 7v14q-2 14-20 21Q16 48 14 34V20z" fill="#6cdb9b" stroke="#258b58" stroke-width="2.5"/><path d="M25 34l6 6 12-14" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' },
    { id: 'bonus_pixel', nome: 'Lenda Pixel', emoji: '💎', exclusiva: true, desafio: 'pixel', svg: '<path d="M14 25l9-11h22l9 11-20 29z" fill="#8edbff" stroke="#3579c4" stroke-width="2.5" stroke-linejoin="round"/><path d="M14 25h40M23 14l11 40 11-40" fill="none" stroke="#e7faff" stroke-width="2"/>' },
    { id: 'bonus_codexa', nome: 'Estrela Codexa', emoji: '⭐', exclusiva: true, desafio: 'codexa', svg: '<path d="M34 12l6 14 15 1-12 10 4 15-13-8-13 8 4-15-12-10 15-1z" fill="#d6b0ff" stroke="#7649c9" stroke-width="2.5" stroke-linejoin="round"/><circle cx="34" cy="34" r="4" fill="#fff"/>' }
  ];
  ['Novato', 'Óculos de Código', 'Coroa Pixel', 'Ninja', 'Astronauta', 'Criador', 'Guardião', 'Mago', 'Dragão', 'Formando'].forEach(function (nome, i) {
    var base = SKINS_BITINHO[i + 1];
    SKINS_BITINHO.push({ id: 'pycap' + (i + 1), nome: nome + ' Python', emoji: base.emoji, capitulo: i + 11, svg: base.svg, variantePython: true });
  });
  ['Estilista CSS', 'Mestre dos Seletores', 'Guardião Responsivo', 'Herói Acessível', 'Lenda do Portfólio'].forEach(function (nome, i) {
    var base = SKINS_BITINHO[11 + i];
    SKINS_BITINHO.push({ id: 'pycap' + (i + 11), nome: nome + ' Python', emoji: base.emoji, capitulo: i + 21, svg: base.svg, variantePython: true });
  });
  var DESAFIOS_SKIN = [
    { id: 'html', titulo: 'Estrutura HTML', pergunta: 'Qual tag cria um parágrafo em uma página?', opcoes: ['<p>', '<img>', '<head>'], certa: 0, explicacao: 'A tag <p> representa um parágrafo de texto.', dica: 'Pense na tag cujo nome vem de “paragraph”.' },
    { id: 'python', titulo: 'Saída em Python', pergunta: 'Qual comando mostra uma mensagem na tela?', opcoes: ['input("Olá")', 'print("Olá")', 'show("Olá")'], certa: 1, explicacao: 'print() escreve o valor no terminal. input() faz o caminho inverso: recebe texto.', dica: 'O nome do comando parece com “imprimir”.' },
    { id: 'logica', titulo: 'Decisão lógica', pergunta: 'Qual símbolo compara se dois valores são iguais em Python?', opcoes: ['=', '==', '=>'], certa: 1, explicacao: '= atribui um valor; == compara dois valores.', dica: 'Para comparar, use dois sinais de igual.' },
    { id: 'pixel', titulo: 'Link seguro', pergunta: 'Qual atributo de HTML informa o destino de um link?', opcoes: ['src', 'href', 'alt'], certa: 1, explicacao: 'href guarda o endereço que será aberto quando a pessoa clicar no link.', dica: 'Ele aparece dentro da tag <a>.' },
    { id: 'codexa', titulo: 'Laço de repetição', pergunta: 'Qual estrutura em Python repete um bloco para cada item de uma sequência?', opcoes: ['for', 'if', 'def'], certa: 0, explicacao: 'for percorre os itens de uma sequência e executa o bloco para cada um deles.', dica: 'A palavra em inglês significa “para cada”.' }
  ];
  function skinPorId(id) { return SKINS_BITINHO.find(function (s) { return s.id === id; }) || SKINS_BITINHO[0]; }
  function skinCapitulo(id) { var m = /^(html|python)-(b|i|a)([1-5])$/.exec(id); if (!m) return 0; var n = m[2] === 'b' ? Number(m[3]) : m[2] === 'i' ? Number(m[3]) + 5 : Number(m[3]) + 10; return m[1] === 'python' ? n + 10 : n; }
  function sincronizarSkinsCapitulos() {
    var ids = S.apostila || {}, mudou = false;
    Object.keys(ids).forEach(function (id) { var n = skinCapitulo(id), linguagem = id.indexOf('python-') === 0, skin = n && (linguagem ? 'pycap' + (n - 10) : 'cap' + n); if (skin && !S.skinsBitinho[skin]) { S.skinsBitinho[skin] = true; mudou = true; } });
    if (mudou) salvar();
  }

  /* ---------- Mascote: Bit ---------- */
  function mascote(humor, tam, skinId) {
    var olhos = humor === 'festa'
      ? '<path d="M22 31q4-6 8 0M38 31q4-6 8 0" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round"/>'
      : '<g class="blink"><ellipse cx="27" cy="31" rx="4.6" ry="5.4" fill="#fff"/><ellipse cx="41" cy="31" rx="4.6" ry="5.4" fill="#fff"/><circle cx="28" cy="32" r="2.3" fill="#1b1033"/><circle cx="42" cy="32" r="2.3" fill="#1b1033"/></g>';
    var boca = humor === 'festa'
      ? '<path d="M27 42q7 9 14 0z" fill="#1b1033"/>'
      : '<path d="M28 42q6 5 12 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>';
    var classeVisual = skinId && skinPorId(skinId).variantePython ? ' skin-python-variant' : '';
    return '<svg class="mascot ' + (humor === 'festa' ? '' : 'bob') + classeVisual + '" width="' + tam + '" height="' + tam + '" viewBox="0 0 68 68" role="img" aria-label="Bit, o mascote">' +
      '<path d="M34 12V6" stroke="#8d6bff" stroke-width="3" stroke-linecap="round"/><circle cx="34" cy="5" r="3.6" fill="#f2b01e"/>' +
      '<rect x="8" y="12" width="52" height="46" rx="18" fill="#6a3df0"/>' +
      '<rect x="8" y="12" width="52" height="46" rx="18" fill="none" stroke="#4a22c2" stroke-width="2"/>' +
      '<rect x="14" y="19" width="40" height="30" rx="13" fill="#2a1768"/>' +
      olhos + boca +
      '<circle cx="19" cy="42" r="3" fill="#ff8fc0" opacity=".55"/><circle cx="49" cy="42" r="3" fill="#ff8fc0" opacity=".55"/>' +
      '<path d="M4 34h5M59 34h5" stroke="#8d6bff" stroke-width="4" stroke-linecap="round"/>' + (skinId && skinPorId(skinId).svg ? skinPorId(skinId).svg : '') + '</svg>';
  }

  /* ---------- Realce de código ---------- */
  function realcar(linha, lang) {
    var re, out = '', last = 0, m;
    if (lang === 'html') re = /(<\/?)([a-zA-Z][\w-]*)|("[^"]*"|'[^']*')|([a-zA-Z-]+)(?==)|(\/?>)/g;
    else if (lang === 'python') re = /(#.*$)|("[^"\n]*"|'[^'\n]*')|\b(if|else|elif|for|in|while|def|return|True|False|and|or|not)\b|\b(print|input|len|range)\b(?=\()|\b(\d+(?:\.\d+)?)\b|(>=|<=|==|!=|[+\-*\/=<>])/g;
    else return esc(linha);
    while ((m = re.exec(linha)) !== null) {
      out += esc(linha.slice(last, m.index));
      var t = m[0], cls = '';
      if (lang === 'html') {
        if (m[2]) { out += '<span class="t-tag">' + esc(m[1]) + esc(m[2]) + '</span>'; last = re.lastIndex; continue; }
        cls = m[3] ? 't-str' : m[4] ? 't-attr' : 't-tag';
      } else {
        cls = m[1] ? 't-com' : m[2] ? 't-str' : m[3] ? 't-kw' : m[4] ? 't-fn' : m[5] ? 't-num' : 't-op';
      }
      out += '<span class="' + cls + '">' + esc(t) + '</span>';
      last = re.lastIndex;
      if (t.length === 0) re.lastIndex++;
    }
    return out + esc(linha.slice(last));
  }
  /* Uma linha com lacunas opcionais. */
  function linhaHTML(linha, lang, slotFn) {
    if (!slotFn) return realcar(linha, lang);
    var partes = linha.split(/\{\{(\d+)\}\}/), out = '';
    for (var i = 0; i < partes.length; i++) out += i % 2 === 0 ? realcar(partes[i], lang) : slotFn(parseInt(partes[i], 10));
    return out;
  }
  function cartaoCodigo(c, slotFn) {
    var linhas = c.texto.split('\n'), dest = c.destaque || [];
    var corpo = linhas.map(function (l, i) {
      return '<div class="ln' + (dest.indexOf(i + 1) >= 0 ? ' hl' : '') + '"><b>' + (i + 1) + '</b><code>' + (linhaHTML(l, c.lang, slotFn) || ' ') + '</code></div>';
    }).join('');
    return '<div class="code"><div class="code-bar"><div class="dots"><i></i><i></i><i></i></div><div class="code-tab"><span>' + esc(c.arquivo || 'exemplo') + '</span></div></div><pre class="code-body">' + corpo + '</pre></div>';
  }

  /* ---------- Progresso ---------- */
  function feita(id) { return !!S.concluidas[id]; }
  function travada(id) { var p = LIC[id].prev; return !!p && !feita(p); }
  function totais(d) {
    var tot = 0, ok = 0;
    d.trilhas.forEach(function (t) { t._flat.forEach(function (id) { tot++; if (feita(id)) ok++; }); });
    return { tot: tot, ok: ok, pct: tot ? Math.round((ok / tot) * 100) : 0 };
  }
  function estrelasDe(id) { return S.concluidas[id] ? S.concluidas[id].estrelas : 0; }
  function proximaDaTrilha(t) { return t._flat.find(function (id) { return !feita(id); }) || null; }
  function alvoContinuar() {
    var d, t, id;
    if (S.ultima) {
      d = DISC.find(function (x) { return x.id === S.ultima.disc; });
      t = d && d.trilhas.find(function (x) { return x.id === S.ultima.trilha; });
      if (t && (id = proximaDaTrilha(t))) return id;
      if (d) { for (var i = 0; i < d.trilhas.length; i++) { id = proximaDaTrilha(d.trilhas[i]); if (id) return id; } }
    }
    for (var a = 0; a < DISC.length; a++) for (var b = 0; b < DISC[a].trilhas.length; b++) { id = proximaDaTrilha(DISC[a].trilhas[b]); if (id) return id; }
    return null;
  }
  function moduloCompleto(m) { return m.licoes.length > 0 && m.licoes.every(function (l) { return feita(l.id); }); }

  /* ---------- Medalhas ---------- */
  var MEDALHAS = [
    { id: 'primeiro', nome: 'Primeiro passo', desc: 'Conclua sua primeira lição.', icone: 'play', ok: function () { return Object.keys(S.concluidas).length >= 1; } },
    { id: 'ritmo', nome: 'Ritmo de 3 dias', desc: 'Estude em 3 dias seguidos.', icone: 'flame', ok: function () { return S.melhor >= 3; } },
    { id: 'xp100', nome: '100 pontos', desc: 'Some 100 pontos de experiência.', icone: 'bolt', ok: function () { return S.xp >= 100; } },
    { id: 'semerro', nome: 'Sem errar', desc: 'Termine uma lição sem nenhum erro.', icone: 'target', ok: function () { return Object.keys(S.concluidas).some(function (k) { return S.concluidas[k].estrelas === 3; }); } },
    { id: 'modulo', nome: 'Módulo completo', desc: 'Conclua todas as lições de um módulo.', icone: 'book', ok: function () { return DISC.some(function (d) { return d.trilhas.some(function (t) { return t.modulos.some(moduloCompleto); }); }); } },
    { id: 'curioso', nome: 'Mente curiosa', desc: 'Estude em todas as disciplinas.', icone: 'compass', ok: function () { return DISC.every(function (d) { return d.trilhas.some(function (t) { return t._flat.some(feita); }); }); } }
  ];
  function medalhasAtuais() { return MEDALHAS.filter(function (m) { return m.ok(); }).map(function (m) { return m.id; }); }

  /* ---------- Navegação ---------- */
  function ir(tela, params, anim) {
    ui.screen = tela; ui.params = params || {};
    if (tela === 'inicio' || tela === 'disciplinas' || tela === 'apostila' || tela === 'bitinho' || tela === 'perfil') ui.tab = tela;
    if (tela === 'trilha') ui.tab = 'disciplinas';
    render(anim || 'fwd');
  }
  function toast(msg) {
    var t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; t.setAttribute('role', 'status');
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2400);
  }

  /* ---------- Lição ---------- */
  function iniciarLicao(id, voltarPara) {
    var info = LIC[id];
    S.ultima = { disc: info.d.id, trilha: info.t.id }; salvar();
    ui.from = voltarPara || { screen: 'inicio', params: {} };
    ui.lesson = { id: id, idx: 0, erros: 0, errosEx: 0, prevPct: 0, fb: null };
    ir('licao', {}, 'fwd');
  }
  function exAtual() { var L = ui.lesson; return L.idx > 0 ? LIC[L.id].l.exercicios[L.idx - 1] : null; }
  function prepararEx() {
    var L = ui.lesson, ex = exAtual();
    L.fb = null; L.tent = 0; L.sel = null; L.texto = ''; L.hint = false;
    if (!ex) return;
    if (ex.tipo === 'lacunas') {
      var n = (ex.modelo.match(/\{\{\d+\}\}/g) || []).length;
      L.slots = []; for (var i = 0; i < n; i++) L.slots.push(null);
    }
    if (ex.tipo === 'ordenar') {
      var ordem = ex.etapas.map(function (_, i) { return i; });
      L.pool = shuffle(ordem, true); L.ordem = [];
    }
  }
  function pctLicao() { var L = ui.lesson, n = LIC[L.id].l.exercicios.length + 1; return Math.round((L.idx / n) * 100); }
  function respostaCompleta() {
    var L = ui.lesson, ex = exAtual();
    if (!ex) return true;
    if (['multipla', 'prever', 'corrigir'].indexOf(ex.tipo) >= 0) return L.sel !== null;
    if (ex.tipo === 'lacunas') return L.slots.every(function (s) { return s !== null; });
    if (ex.tipo === 'ordenar') return L.ordem.length === ex.etapas.length;
    return L.texto.trim().length > 0;
  }
  function conferir() {
    var L = ui.lesson, ex = exAtual(), ok = false;
    if (['multipla', 'prever', 'corrigir'].indexOf(ex.tipo) >= 0) ok = L.sel === ex.certa;
    else if (ex.tipo === 'lacunas') ok = L.slots.every(function (b, i) { return ex.banco[b] === ex.respostas[i]; });
    else if (ex.tipo === 'ordenar') ok = L.ordem.every(function (p, i) { return p === i; });
    else {
      var txt = L.texto.trim().replace(/\s+/g, ' ');
      ok = ex.aceita.some(function (r) { return new RegExp(r, 'i').test(txt); });
    }
    L.tent++;
    if (!ok) { L.erros++; L.errosEx++; }
    L.fb = { ok: ok };
  }
  function textoResposta(ex) {
    if (['multipla', 'prever', 'corrigir'].indexOf(ex.tipo) >= 0) return ex.opcoes[ex.certa];
    if (ex.tipo === 'lacunas') return ex.respostas.join('  ·  ');
    if (ex.tipo === 'ordenar') return ex.etapas.map(function (e) { return e.trim(); }).join('  →  ');
    return ex.solucao;
  }
  function finalizar() {
    var L = ui.lesson, info = LIC[L.id], jaTinha = feita(L.id), antes = medalhasAtuais();
    var estrelas = L.erros === 0 ? 3 : L.erros <= 2 ? 2 : 1;
    var ganho = 0;
    if (!jaTinha) { ganho = info.l.xp + (L.erros === 0 ? 10 : 0); S.xp += ganho; }
    if (!jaTinha || estrelas > estrelasDe(L.id)) S.concluidas[L.id] = { estrelas: Math.max(estrelas, estrelasDe(L.id)) };
    var h = hoje();
    if (S.ultimoDia !== h) {
      S.streak = S.ultimoDia && diasEntre(S.ultimoDia, h) <= 2 && S.streak > 0 ? S.streak + 1 : 1;
      S.diasEstudo++; S.ultimoDia = h;
    }
    S.melhor = Math.max(S.melhor, S.streak);
    if (S.hojeData !== h) { S.hojeData = h; S.hojeQtd = 0; }
    S.hojeQtd++;
    retorno = false;
    salvar();
    var novas = medalhasAtuais().filter(function (id) { return antes.indexOf(id) < 0; });
    ui.result = { id: L.id, estrelas: estrelas, ganho: ganho, erros: L.erros, total: info.l.exercicios.length, jaTinha: jaTinha, novas: novas };
    ir('resultado', {}, 'fade');
  }

  /* ---------- Telas ---------- */
  function telaInicio() {
    var alvo = alvoContinuar(), p = S.hojeQtd, meta = S.config.meta;
    var bitinho = '<button type="button" class="home-mascot" data-act="bitinhoSurpresa" aria-label="Bitinho, tocar para ver uma surpresa"><span class="mascot-reaction-bubble" aria-hidden="true"></span><span class="mascot-sparkles" aria-hidden="true">✦　✧　✦</span>' + mascote('feliz', 64, S.skinEquipada) + '</button>';
    var h = '<header class="top pad home-header"><div class="stack"><span class="eyebrow">' + saudacao() + '</span><h1 class="title-xl">Olá, ' + esc(S.nome || 'Aprendiz') + '!</h1><p class="home-subtitle">Sua próxima conquista começa com um passo.</p></div>' + bitinho + '</header>';
    h += '<div class="chips pad home-metrics"><span class="pill fire">' + ic('flame') + S.streak + (S.streak === 1 ? ' dia' : ' dias') + '</span><span class="pill bolt">' + ic('bolt') + S.xp + ' pontos</span><span class="pill">' + ic('star') + 'Nível ' + nivel() + '</span></div>';
    var dicasPc = ['Use Ctrl + Z para desfazer uma ação que acabou de fazer. Funciona em muitos editores e aplicativos.','Faça cópias dos arquivos importantes em outro local ou na nuvem. Assim, um problema no computador não apaga tudo.','Antes de clicar num link recebido por mensagem, confira quem enviou e para onde o endereço realmente aponta.','Use nomes claros para arquivos e pastas. Exemplo: trabalho-historia-outubro.docx.'];
    h += '<div class="pad home-tip"><div class="tip tip-card">' + ic('bulb') + '<div><strong>Dica de computador</strong><br>' + dicasPc[(new Date().getDate() + S.hojeQtd) % dicasPc.length] + '</div></div></div>';
    if (retorno) {
      h += '<div class="pad"><div class="notice">' + ic('sparkle') + '<div><strong>Que bom ter você de volta!</strong><br>Sua sequência recomeça hoje, sem pressa. Você já estudou em ' + S.diasEstudo + ' dias e isso continua valendo.</div></div></div>';
    }
    if (alvo) {
      var i = LIC[alvo], tot = totais(i.d);
      h += '<div class="pad home-continue"><div class="hero"><span class="kicker">Continue de onde parou</span><div><h2>' + esc(i.l.titulo) + '</h2><p class="meta">' + esc(i.t.nome) + ' · ' + esc(i.m.nome) + '</p></div>' +
        '<div class="tagrow"><span class="tag">' + ic('bolt') + ' +' + i.l.xp + ' pontos</span><span class="tag">' + i.l.minutos + ' min</span></div>' +
        bar(tot.pct) + '<button class="btn light" data-act="comecar" data-id="' + alvo + '" data-from="inicio">' + ic('play') + 'Continuar aprendendo</button></div></div>';
    } else {
      h += '<div class="pad home-continue"><div class="hero hero-complete"><span class="complete-mark" aria-hidden="true">✦</span><span class="kicker">Jornada concluída</span><h2>Você terminou todas as lições disponíveis!</h2><p class="meta">Seu esforço merece ser celebrado. Que tal revisar ou explorar outra disciplina?</p><button class="btn light" data-act="tab" data-t="disciplinas">Rever as disciplinas</button></div></div>';
    }
    var pct = Math.min(100, Math.round((p / meta) * 100));
    h += '<div class="pad home-goal-wrap"><section class="home-goal"><div class="home-goal-copy"><span class="eyebrow">UM POUCO POR DIA</span><strong>Meta de hoje</strong><span class="home-goal-count">' + Math.min(p, meta) + ' de ' + meta + (meta === 1 ? ' lição' : ' lições') + '</span><p>' + (p >= meta ? 'Meta cumprida. Continue no seu ritmo!' : 'Uma lição curta já conta como um bom dia de estudo.') + '</p></div><div class="home-goal-ring" style="--goal-pct:' + pct + '%" role="img" aria-label="' + pct + '% da meta diária concluída"><span>' + pct + '<small>%</small></span></div></section></div>';
    h += '<div class="pad list home-disciplines"><div class="section-h"><div><span class="eyebrow">SEU APRENDIZADO</span><h2 class="title-md">Suas disciplinas</h2></div><button class="linkbtn" data-act="tab" data-t="disciplinas">Ver todas</button></div>';
    DISC.forEach(function (d) {
      var t = totais(d);
      h += '<button class="disc discipline-card" data-discipline="' + esc(d.id) + '" data-act="disc" data-id="' + d.id + '"><span class="badge-ic">' + ic(d.icone) + '</span><span style="min-width:0"><span class="name">' + esc(d.nome) + '</span>' + bar(t.pct) + '</span><span class="pct">' + t.pct + '%</span></button>';
    });
    return h + '</div>';
  }

  function telaDisciplinas() {
    var h = '<header class="pad stack" style="display:flex;flex-direction:column;gap:4px"><span class="eyebrow">Escolha por onde começar</span><h1 class="title-xl">Disciplinas</h1></header><div class="pad list">';
    DISC.forEach(function (d) {
      var t = totais(d);
      h += '<button class="discbig discipline-card" data-discipline="' + esc(d.id) + '" data-act="disc" data-id="' + d.id + '"><span class="row"><span class="badge-ic">' + ic(d.icone) + '</span><span style="min-width:0"><span class="name">' + esc(d.nome) + '</span><span class="small muted" style="display:block;margin-top:4px">' + esc(d.descricao) + '</span></span></span>' +
        '<span class="trilha-tags">' + d.trilhas.map(function (tr) { return '<span class="soft-tag">' + esc(tr.nome) + '</span>'; }).join('') + '</span>' +
        '<span class="foot">' + bar(t.pct) + '<span>' + t.ok + '/' + t.tot + ' lições</span></span></button>';
    });
    return h + '</div>';
  }

  function telaTrilha() {
    var d = DISC.find(function (x) { return x.id === ui.params.disc; });
    if (!d) return telaDisciplinas();
    var tid = ui.trilhaSel[d.id] || d.trilhas[0].id;
    var t = d.trilhas.find(function (x) { return x.id === tid; }) || d.trilhas[0];
    var prog = t._flat.filter(feita).length, tot = t._flat.length, pct = tot ? Math.round(prog / tot * 100) : 0;
    var atual = proximaDaTrilha(t);
    var h = '<header class="pad" style="display:flex;flex-direction:column;gap:6px"><button class="backbtn" data-act="voltar">' + ic('chevL') + '<span>Disciplinas</span></button><span class="eyebrow">' + esc(d.nome) + '</span><h1 class="title-lg">' + esc(t.nome) + '</h1></header>';
    if (d.trilhas.length > 1) h += '<div class="pad"><div class="seg" role="tablist">' + d.trilhas.map(function (x) { return '<button role="tab" class="' + (x.id === t.id ? 'on' : '') + '" data-act="trilha" data-d="' + d.id + '" data-id="' + x.id + '">' + esc(x.nome) + '</button>'; }).join('') + '</div></div>';
    h += '<div class="pad"><div class="card plain"><div class="section-h"><strong>Seu progresso</strong><span class="small muted">' + prog + ' de ' + tot + ' lições</span></div><div style="height:10px"></div>' + bar(pct) + '</div></div>';
    h += '<div class="pad" style="display:flex;flex-direction:column;gap:20px">';
    t.modulos.forEach(function (m, mi) {
      h += '<section class="mod"><div class="mod-h"><span class="n">' + (mi + 1) + '</span><h3>' + esc(m.nome) + '</h3></div>';
      if (m.emBreve || !m.licoes.length) h += '<div class="soon">' + ic('lock') + 'Em breve: novas lições chegando</div>';
      m.licoes.forEach(function (l) {
        var f = feita(l.id), lk = travada(l.id), agora = l.id === atual && !lk;
        var st = lk ? 'locked' : f ? 'done' : agora ? 'now' : '';
        var stars = f ? '<span class="stars" aria-label="' + estrelasDe(l.id) + ' de 3 estrelas">' + [1, 2, 3].map(function (n) { return ic('star', n <= estrelasDe(l.id) ? 'on' : ''); }).join('') + '</span>' : '<span class="small muted">+' + l.xp + ' pts</span>';
        h += '<button class="lrow ' + st + '" data-act="' + (lk ? 'travada' : 'comecar') + '" data-id="' + l.id + '" data-from="trilha" data-d="' + d.id + '"><span class="node">' + ic(lk ? 'lock' : f ? 'check' : 'play') + '</span><span style="min-width:0"><span class="t" style="display:block">' + esc(l.titulo) + '</span><span class="s" style="display:block">' + l.minutos + ' min · ' + (f ? 'Concluída, toque para rever' : lk ? 'Conclua a anterior' : agora ? 'Próxima lição' : 'Disponível') + '</span></span>' + stars + '</button>';
      });
      h += '</section>';
    });
    return h + '</div>';
  }

  /* --- Exercícios --- */
  function viewIntro(l) {
    var i = l.intro, h = '<div class="speech">' + mascote('feliz', 64) + '<div class="bubble">' + fmt(l.fala) + '</div></div>';
    h += '<span class="eyebrow">Explicação</span><h2 class="title-lg">' + esc(i.titulo) + '</h2>';
    h += '<div class="prose">' + i.paragrafos.map(function (p) { return '<p>' + fmt(p) + '</p>'; }).join('') + '</div>';
    if (i.codigo) h += cartaoCodigo(i.codigo);
    if (i.dica) h += '<div class="tip">' + ic('bulb') + '<div>' + fmt(i.dica) + '</div></div>';
    return h;
  }
  function viewMultipla(ex, L) {
    var h = '<span class="eyebrow">Escolha uma resposta</span><h2 class="q">' + fmt(ex.enunciado) + '</h2><div class="opts">';
    ex.opcoes.forEach(function (o, i) {
      var cls = L.sel === i ? ' sel' : '';
      if (L.fb) { if (L.fb.ok && i === ex.certa) cls = ' right'; else if (!L.fb.ok && L.sel === i) cls = ' wrong'; }
      h += '<button class="opt' + cls + '" data-act="opt" data-i="' + i + '"' + (L.fb ? ' disabled' : '') + '><span class="k">' + 'ABCD'[i] + '</span><span>' + fmt(o) + '</span></button>';
    });
    return h + '</div>';
  }
  function viewPrever(ex, L) {
    var h = '<span class="eyebrow">🔍 Preveja a saída</span><h2 class="q">' + fmt(ex.enunciado) + '</h2>';
    h += cartaoCodigo({ arquivo: ex.arquivo || 'programa', lang: ex.lang || 'python', texto: ex.codigo });
    h += '<div class="opts">' + ex.opcoes.map(function (o, i) { var cls = L.sel === i ? ' sel' : ''; if (L.fb) { if (L.fb.ok && i === ex.certa) cls = ' right'; else if (!L.fb.ok && L.sel === i) cls = ' wrong'; } return '<button class="opt' + cls + '" data-act="opt" data-i="' + i + '"' + (L.fb ? ' disabled' : '') + '><span class="k">' + 'ABCD'[i] + '</span><span>' + fmt(o) + '</span></button>'; }).join('') + '</div>';
    return h;
  }
  function viewCorrigir(ex, L) {
    var h = '<span class="eyebrow">🛠️ Encontre e corrija o erro</span><h2 class="q">' + fmt(ex.enunciado) + '</h2>';
    h += cartaoCodigo({ arquivo: ex.arquivo || 'trecho-com-erro', lang: ex.lang || 'python', texto: ex.codigo });
    h += '<span class="small muted">Escolha a versão corrigida:</span><div class="code-fixes">' + ex.opcoes.map(function (o, i) { var cls = L.sel === i ? ' sel' : ''; if (L.fb) { if (L.fb.ok && i === ex.certa) cls = ' right'; else if (!L.fb.ok && L.sel === i) cls = ' wrong'; } return '<button class="code-fix' + cls + '" data-act="opt" data-i="' + i + '"' + (L.fb ? ' disabled' : '') + '><span class="k">' + 'ABCD'[i] + '</span><pre><code>' + esc(o) + '</code></pre></button>'; }).join('') + '</div>';
    return h;
  }
  function viewLacunas(ex, L) {
    var slotFn = function (n) {
      var b = L.slots[n];
      return '<button class="slot' + (b !== null ? ' on' : '') + '" data-act="slot" data-i="' + n + '"' + (L.fb ? ' disabled' : '') + ' aria-label="Lacuna ' + (n + 1) + '">' + (b !== null ? esc(ex.banco[b]) : '&nbsp;&nbsp;&nbsp;') + '</button>';
    };
    var alvo;
    if (ex.lang === 'frase') alvo = '<div class="frase">' + ex.modelo.split('\n').map(function (l) { return '<div>' + linhaHTML(l, 'frase', slotFn) + '</div>'; }).join('') + '</div>';
    else alvo = cartaoCodigo({ arquivo: ex.arquivo, lang: ex.lang, texto: ex.modelo }, slotFn);
    var usados = L.slots.filter(function (s) { return s !== null; });
    var h = '<span class="eyebrow">Complete a lacuna</span><h2 class="q">' + fmt(ex.enunciado) + '</h2>' + alvo + '<div class="bank">';
    ex.banco.forEach(function (b, i) { h += '<button class="chip' + (ex.lang === 'frase' ? '' : ' mono') + '" data-act="chip" data-i="' + i + '"' + (usados.indexOf(i) >= 0 || L.fb ? ' disabled' : '') + '>' + esc(b) + '</button>'; });
    return h + '</div>';
  }
  function viewOrdenar(ex, L) {
    var mono = ex.lang !== 'frase' ? ' mono' : '';
    var h = '<span class="eyebrow">Toque para ordenar</span><h2 class="q">' + fmt(ex.enunciado) + '</h2>';
    h += '<div class="zone" aria-label="Sua ordem">' + (L.ordem.length ? L.ordem.map(function (p, pos) {
      return '<button class="step placed' + mono + '" data-act="desfaz" data-pos="' + pos + '"' + (L.fb ? ' disabled' : '') + '><span class="num">' + (pos + 1) + '</span><span>' + esc(ex.etapas[p]) + '</span></button>';
    }).join('') : '<div class="hint">Toque nas etapas abaixo, na ordem certa</div>') + '</div>';
    h += '<div class="zone" style="border-style:solid;background:var(--bg)">' + L.pool.map(function (p) {
      var usado = L.ordem.indexOf(p) >= 0;
      return usado ? '' : '<button class="step' + mono + '" data-act="poe" data-p="' + p + '"' + (L.fb ? ' disabled' : '') + '><span></span><span>' + esc(ex.etapas[p]) + '</span></button>';
    }).join('') + '</div>';
    return h;
  }
  function viewDesafio(ex, L) {
    var codigo = ex.lang !== 'frase';
    var h = '<span class="eyebrow">Desafio prático</span><h2 class="q">' + fmt(ex.enunciado) + '</h2>';
    h += '<div class="input-wrap' + (codigo ? ' code-in' : '') + '"><textarea id="resposta" rows="3" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off" placeholder="' + esc(ex.placeholder || '') + '" aria-label="Sua resposta"' + (L.fb ? ' disabled' : '') + '>' + esc(L.texto) + '</textarea></div>';
    return h;
  }

  function viewDicas(l, ex, L) {
    var introdica = l.intro && l.intro.dica || '';
    var pistas = [ex.pista || introdica, ex.dica || ''].filter(function (x, i, a) { return x && a.indexOf(x) === i; });
    if (!pistas.length) return '';
    var n = Math.min(Number(L.hint) || 0, pistas.length), h = '';
    for (var i = 0; i < n; i++) h += '<div class="tip exercise-step-hint"><span class="hint-step-label">DICA ' + (i + 1) + '</span>' + ic('bulb') + '<div>' + fmt(pistas[i]) + '</div></div>';
    if (n < pistas.length) h += '<button class="hintbtn" data-act="dica">' + ic('bulb') + (n ? 'Mostrar próxima dica' : 'Preciso de uma dica') + '</button>';
    return h;
  }

  function apoioExercicio(l) {
    var intro = l.intro || {}, h = '';
    h += '<details class="exercise-review"><summary><span>📘</span><span><strong>Rever a explicação</strong><small>Abra para consultar o conceito e um exemplo</small></span><b aria-hidden="true">⌄</b></summary><div class="exercise-review-body">';
    if (intro.titulo) h += '<h3>' + esc(intro.titulo) + '</h3>';
    if (intro.paragrafos) h += '<div class="prose">' + intro.paragrafos.map(function (p) { return '<p>' + fmt(p) + '</p>'; }).join('') + '</div>';
    if (intro.codigo) h += '<div class="exercise-example-label">Exemplo de código</div>' + cartaoCodigo(intro.codigo);
    if (intro.dica) h += '<div class="tip">' + ic('bulb') + '<div>' + fmt(intro.dica) + '</div></div>';
    h += '</div></details>';
    return h;
  }

  function gabaritoExercicio(ex) {
    var resposta = textoResposta(ex) || 'Revise o exemplo e tente novamente.';
    var h = '<details class="exercise-answer"><summary><span>✅</span><span><strong>Ver gabarito completo</strong><small>Resposta e explicação do exercício</small></span><b aria-hidden="true">⌄</b></summary><div class="exercise-answer-body">';
    if (ex.tipo === 'desafio' || ex.lang) h += '<pre><code>' + esc(resposta) + '</code></pre>';
    else h += '<p><strong>Resposta:</strong> ' + esc(resposta) + '</p>';
    if (ex.porque) h += '<p>' + fmt(ex.porque) + '</p>';
    h += '</div></details>';
    return h;
  }

  function copiarTexto(texto) {
    function fallback() {
      var campo = document.createElement('textarea');
      campo.value = texto; campo.setAttribute('readonly', ''); campo.style.position = 'fixed'; campo.style.opacity = '0';
      document.body.appendChild(campo); campo.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
      campo.remove(); toast(ok ? 'Código copiado!' : 'Não foi possível copiar o código.');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).then(function () { toast('Código copiado!'); }).catch(fallback);
    else fallback();
  }

  function telaLicao() {
    var L = ui.lesson, info = LIC[L.id], l = info.l, ex = exAtual(), n = l.exercicios.length;
    var h = '<div class="l-top pad"><button class="xbtn" data-act="sair" aria-label="Sair da lição">' + ic('close') + '</button>' + bar(pctLicao(), L.prevPct) + '<span class="pts">' + ic('bolt') + l.xp + '</span></div>';
    h += '<div class="l-body pad' + (ui.keepAnim ? '' : ' static') + '">';
    if (!ex) h += viewIntro(l);
    else if (ex.tipo === 'multipla') h += viewMultipla(ex, L);
    else if (ex.tipo === 'prever') h += viewPrever(ex, L);
    else if (ex.tipo === 'corrigir') h += viewCorrigir(ex, L);
    else if (ex.tipo === 'lacunas') h += viewLacunas(ex, L);
    else if (ex.tipo === 'ordenar') h += viewOrdenar(ex, L);
    else h += viewDesafio(ex, L);
    if (ex) h += viewDicas(l, ex, L) + apoioExercicio(l);
    h += '</div>';
    if (!ex) {
      h += '<div class="l-foot pad"><button class="btn primary" data-act="avancar">Entendi, vamos praticar</button></div>';
    } else if (!L.fb) {
      h += '<div class="l-foot pad"><button class="btn primary" data-act="conferir"' + (respostaCompleta() ? '' : ' disabled') + '>Verificar</button></div>';
    } else if (L.fb.ok) {
      h += '<div class="sheet ok pad" role="status"><h3>' + ic('ok') + ['Muito bem!', 'Isso mesmo!', 'Acertou!', 'Ótimo trabalho!'][(L.idx + L.tent) % 4] + '</h3><p>' + fmt(ex.porque) + '</p>' + gabaritoExercicio(ex) + '<button class="btn primary" data-act="avancar">' + (L.idx === n ? 'Concluir lição' : 'Continuar') + '</button></div>';
    } else {
      var revelar = L.tent >= 2;
      h += '<div class="sheet no pad" role="status"><h3>' + ic('no') + 'Quase lá!</h3><p>' + fmt(!revelar && ex.pista ? ex.pista : ex.porque) + '</p>' +
        (revelar ? gabaritoExercicio(ex) : '') +
        '<div class="btn-row">' + (revelar
          ? '<button class="btn primary" data-act="avancar">' + (L.idx === n ? 'Concluir lição' : 'Continuar') + '</button><button class="btn soft" data-act="repetir">Tentar de novo</button>'
          : '<button class="btn primary" data-act="repetir">Tentar de novo</button>') + '</div></div>';
    }
    return h;
  }

  function telaResultado() {
    var R = ui.result, info = LIC[R.id], prox = info.next, h = '';
    var conf = '';
    for (var i = 0; i < 16; i++) conf += '<i style="--x:' + Math.round(Math.random() * 96) + '%;--d:' + (Math.random() * .8).toFixed(2) + 's;--r:' + Math.round(Math.random() * 90) + 'deg"></i>';
    h += '<div class="confetti" aria-hidden="true">' + conf + '</div>';
    h += '<div class="pad" style="display:flex;flex-direction:column;align-items:center;gap:18px;text-align:center">' + mascote('festa', 96);
    h += '<div><span class="eyebrow">' + (R.erros === 0 ? 'Sem nenhum erro' : 'Lição concluída') + '</span><h1 class="title-lg" style="margin-top:4px">' + esc(info.l.titulo) + '</h1></div>';
    h += '<div class="bigstars" aria-label="' + R.estrelas + ' de 3 estrelas">' + [1, 2, 3].map(function (n) { return ic('star', n <= R.estrelas ? 'on' : '').replace('class="ic ', 'style="--d:' + (n * .18) + 's" class="ic '); }).join('') + '</div>';
    h += '<p class="muted" style="max-width:30ch">' + (R.erros === 0 ? 'Você acertou tudo de primeira. Impressionante!' : R.erros <= 2 ? 'Boa! Errar faz parte de aprender, e você corrigiu no caminho.' : 'Você concluiu a lição. Que tal tentar de novo para fixar melhor?') + '</p>';
    h += '<div class="tiles"><div class="tile"><b>+' + R.ganho + '</b><span>pontos</span></div><div class="tile"><b>' + Math.max(0, R.total - Math.min(R.erros, R.total)) + '/' + R.total + '</b><span>de primeira</span></div><div class="tile"><b>' + S.streak + '</b><span>' + (S.streak === 1 ? 'dia seguido' : 'dias seguidos') + '</span></div></div>';
    if (R.jaTinha) h += '<p class="small muted">Você já tinha concluído esta lição, então os pontos não se repetem.</p>';
    R.novas.forEach(function (id) {
      var m = MEDALHAS.find(function (x) { return x.id === id; });
      h += '<div class="newbadge"><span class="badge-ic" style="width:46px;height:46px;border-radius:50%">' + ic(m.icone) + '</span><div><strong>Nova medalha: ' + esc(m.nome) + '</strong><div class="small muted">' + esc(m.desc) + '</div></div></div>';
    });
    h += '<div class="btn-row" style="width:100%;margin-top:6px">';
    if (prox && !travada(prox)) h += '<button class="btn primary" data-act="comecar" data-id="' + prox + '" data-from="' + (ui.from && ui.from.screen) + '" data-d="' + info.d.id + '">Próxima lição</button>';
    else h += '<button class="btn primary" data-act="fecharResultado">Voltar à trilha</button>';
    h += '<button class="btn soft" data-act="comecar" data-id="' + R.id + '" data-from="' + (ui.from && ui.from.screen) + '" data-d="' + info.d.id + '">' + ic('retry') + 'Tentar novamente</button>';
    if (prox) h += '<button class="btn ghost" data-act="fecharResultado">Voltar à trilha</button>';
    return h + '</div></div>';
  }

  var temaApostila = '', capituloApostila = 'basico';
  var conteudoApostila = {
    basico: {
      nome: 'Básico', resumo: 'Comece do começo: conheça as peças fundamentais e entenda cada linha antes de avançar.',
      python: [
        { titulo: '1. Mostrar informações na tela', objetivo: 'O primeiro passo é dar uma instrução ao computador e ver o resultado. Em Python, print() mostra uma mensagem ou o valor de uma variável.', codigo: 'print("Olá, mundo!")\nprint(2 + 3)', partes: [['print(...)', 'É o comando que pede ao Python para mostrar alguma coisa na tela.'], ['"Olá, mundo!"', 'É um texto. As aspas indicam onde o texto começa e termina.'], ['2 + 3', 'É uma conta. O Python calcula a soma antes de mostrar o resultado.'], ['Parênteses ( )', 'Guardam aquilo que será enviado ao comando print.']], resultado: 'A primeira linha mostra Olá, mundo! e a segunda mostra 5.', pratica: 'Troque a mensagem por seu nome e faça o programa mostrar também uma conta simples.', dica: 'Texto precisa estar entre aspas. Números usados em contas ficam sem aspas.' },
        { titulo: '2. Variáveis e tipos de informação', objetivo: 'Uma variável é um nome que guarda uma informação para o programa usar depois. O tipo da informação ajuda o Python a saber o que pode fazer com ela.', codigo: 'nome = "Lia"\nidade = 15\naltura = 1.62\nestuda_programacao = True\nprint(nome, idade)', partes: [['nome, idade, altura', 'São nomes de variáveis. Prefira nomes que expliquem o que cada valor representa.'], ['=', 'É o sinal de atribuição: guarda o valor da direita dentro do nome da esquerda.'], ['"Lia"', 'É uma string (str), ou seja, um texto. Textos ficam entre aspas.'], ['15', 'É um inteiro (int), um número sem parte decimal.'], ['1.62', 'É um número decimal (float). Em Python, a parte decimal usa ponto.'], ['True', 'É um valor booleano (bool): representa verdadeiro. O outro valor possível é False.']], resultado: 'nome guarda um texto, idade guarda um inteiro, altura guarda um decimal e estuda_programacao guarda um valor verdadeiro ou falso.', pratica: 'Crie variáveis para sua cidade, sua idade e se você gosta de tecnologia. Depois mostre todas com print().', dica: 'O sinal = não significa “é igual” numa comparação; aqui ele significa “guarde este valor”.' },
        { titulo: '3. Receber informações e converter valores', objetivo: 'input() pausa o programa e espera a pessoa digitar uma resposta. Tudo que input() recebe começa como texto; para fazer contas, converta esse texto para número.', codigo: 'nome = input("Qual é seu nome? ")\nidade = int(input("Qual é sua idade? "))\nprint("Olá,", nome)\nprint("No ano que vem você terá", idade + 1)', partes: [['input("pergunta")', 'Mostra a pergunta e espera a pessoa digitar uma resposta.'], ['nome = ...', 'Guarda a resposta na variável nome para reutilizá-la depois.'], ['int(...)', 'Converte o texto digitado para um número inteiro, permitindo somar ou comparar.'], ['print("Olá,", nome)', 'Mostra texto e o valor da variável na mesma linha. A vírgula separa os itens.']], resultado: 'Se a pessoa digitar Lia e depois 15, o programa cumprimenta Lia e calcula que no próximo ano ela terá 16.', pratica: 'Peça dois números usando int(input(...)) e mostre a soma deles.', dica: 'Se tentar somar um texto diretamente a um número, o Python reclama. Converta o valor antes com int() ou float().' },
        { titulo: '4. Operadores: fazer contas e comparar valores', objetivo: 'Operadores são símbolos que pedem ao Python para calcular ou comparar valores. Aprender a lê-los ajuda a montar fórmulas e regras.', codigo: 'a = 10\nb = 3\nprint(a + b)   # soma: 13\nprint(a / b)   # divisão: 3.333...\nprint(a // b)  # divisão inteira: 3\nprint(a % b)   # resto: 1\nprint(a ** b)  # potência: 1000', partes: [['+', 'Soma os valores.'], ['-', 'Subtrai o segundo valor do primeiro.'], ['*', 'Multiplica os valores.'], ['/', 'Divide e retorna o resultado da divisão, inclusive com casas decimais.'], ['//', 'Divide e descarta a parte decimal, retornando a parte inteira.'], ['%', 'Retorna o resto da divisão. É útil para verificar se um número é par.'], ['**', 'Calcula potência. 10 ** 3 significa 10 elevado a 3.'], ['# comentário', 'Tudo depois de # na linha é uma anotação para quem lê o código; não é executado.']], resultado: 'Com a=10 e b=3, o resto é 1. Se o resto de uma divisão por 2 for 0, o número é par.', pratica: 'Crie dois números e mostre a soma, a subtração, a multiplicação e o resto da divisão entre eles.', dica: 'Use parênteses para deixar a ordem da conta explícita, como (2 + 3) * 4. Isso também deixa sua intenção mais fácil de entender.' },
        { titulo: '5. Comentários e nomes claros', objetivo: 'Um programa fica mais fácil de aprender quando os nomes explicam os dados e os comentários explicam decisões importantes. O código deve contar sua própria história.', codigo: '# Dados de uma compra\npreco_produto = 25.0\nquantidade = 2\ntotal = preco_produto * quantidade\n\n# Mostra o total calculado\nprint("Total: R$", total)', partes: [['#', 'Começa um comentário. O Python ignora o comentário ao executar.'], ['preco_produto', 'Nome de variável escrito em snake_case: palavras separadas por sublinhado.'], ['25.0', 'Valor decimal. O ponto é o separador decimal em Python.'], ['quantidade', 'Guarda quantas unidades serão compradas.'], ['total = ...', 'Calcula o preço vezes a quantidade e guarda o resultado.'], ['print(...)', 'Apresenta o valor calculado para a pessoa.']], resultado: 'O total é 50.0. Os comentários dizem qual é o objetivo de cada trecho.', pratica: 'Escreva um pequeno programa de lanche com preço, quantidade e total. Adicione um comentário antes de cada etapa.', dica: 'Evite nomes como x ou coisa em programas maiores. Nomes como total_da_compra deixam a intenção clara.' }
      ],
      html: [
        { titulo: '1. A estrutura de uma página', objetivo: 'HTML é a linguagem que organiza o conteúdo de uma página. As tags dizem ao navegador qual é o papel de cada parte.', codigo: '<!doctype html>\n<html lang="pt-BR">\n  <head>\n    <meta charset="UTF-8">\n    <title>Minha página</title>\n  </head>\n  <body>\n    <h1>Olá, mundo!</h1>\n    <p>Esta é minha primeira página.</p>\n  </body>\n</html>', partes: [['<!doctype html>', 'Informa ao navegador que o documento usa o HTML moderno.'], ['<html lang="pt-BR">', 'Abre a página. lang informa que o idioma principal é português do Brasil.'], ['<head> ... </head>', 'Guarda configurações e informações da página que não aparecem como conteúdo principal.'], ['<meta charset="UTF-8">', 'Permite exibir corretamente acentos e outros caracteres.'], ['<title> ... </title>', 'Define o nome que aparece na aba do navegador.'], ['<body> ... </body>', 'Contém o conteúdo que a pessoa vê na página.'], ['<h1> e <p>', 'h1 cria o título principal; p cria um parágrafo.']], resultado: 'O navegador usa head para preparar a página e body para mostrar o título e o parágrafo.', pratica: 'Troque o título da aba, escreva seu próprio título principal e acrescente um parágrafo sobre você.', dica: 'A maioria das tags tem abertura, como <p>, e fechamento, como </p>. O fechamento tem uma barra antes do nome.' },
        { titulo: '2. Títulos, parágrafos e destaque', objetivo: 'Use títulos para organizar as seções e parágrafos para os textos. Uma hierarquia correta ajuda tanto quem lê quanto ferramentas de acessibilidade.', codigo: '<h1>Meu projeto</h1>\n<h2>Sobre a ideia</h2>\n<p>Estou aprendendo a criar páginas.</p>\n<p><strong>Este trecho é importante.</strong></p>', partes: [['<h1>', 'Marca o título principal da página. Em geral, use um h1 para o assunto principal.'], ['<h2>', 'Marca uma seção dentro do assunto principal. h3 pode criar uma subseção de h2, e assim por diante.'], ['<p>', 'Agrupa uma ideia em forma de parágrafo e cria espaçamento apropriado.'], ['<strong>', 'Indica que o texto tem importância. O navegador costuma exibi-lo em negrito.'], ['Tag de abertura e fechamento', 'O conteúdo fica entre as duas tags: <strong>texto</strong>.']], resultado: 'A página mostra um título principal, um subtítulo e dois parágrafos; o último destaca uma informação importante.', pratica: 'Crie uma página com um h1, dois h2 e um parágrafo dentro de cada seção.', dica: 'Escolha o nível do título pela estrutura do conteúdo, não apenas pelo tamanho visual. A aparência pode ser ajustada depois com CSS.' },
        { titulo: '3. Links e imagens', objetivo: 'Links levam a outra página ou lugar. Imagens ilustram o conteúdo. Os atributos fornecem informações adicionais às tags.', codigo: '<a href="https://exemplo.com">Visite o site</a>\n<img src="bitinho.png" alt="Mascote Bitinho sorrindo">', partes: [['<a> ... </a>', 'Cria um link. O texto entre as tags é a parte clicável.'], ['href="..."', 'É um atributo que informa o endereço para onde o link deve levar.'], ['<img>', 'Insere uma imagem. É uma tag sem fechamento separado.'], ['src="bitinho.png"', 'Indica o caminho do arquivo da imagem.'], ['alt="..."', 'Descreve a imagem para leitores de tela e aparece se o arquivo não carregar.']], resultado: 'A primeira linha mostra um link. A segunda tenta carregar bitinho.png e fornece uma descrição alternativa.', pratica: 'Faça um link para um site que você usa e adicione uma imagem com uma descrição que explique o que ela mostra.', dica: 'Escreva um alt útil. Se a imagem for apenas decorativa, use alt="".' },
        { titulo: '4. Listas e agrupamento de conteúdo', objetivo: 'Listas ajudam a organizar itens relacionados. Elementos de agrupamento deixam claro quais conteúdos pertencem à mesma seção.', codigo: '<h2>O que vou estudar</h2>\n<ul>\n  <li>HTML</li>\n  <li>Python</li>\n</ul>\n<section>\n  <h2>Meu objetivo</h2>\n  <p>Praticar um pouco todo dia.</p>\n</section>', partes: [['<ul>', 'Abre uma lista sem uma ordem numérica, geralmente apresentada com marcadores.'], ['<li>', 'É um item da lista. Cada li precisa estar dentro de ul ou ol.'], ['<ol>', 'Cria uma lista numerada quando a sequência dos itens importa.'], ['<section>', 'Agrupa conteúdo que trata de um assunto próprio. Muitas vezes começa com um título.'], ['Nesting (aninhamento)', 'Uma tag pode ficar dentro de outra. Feche primeiro a tag que foi aberta por último.']], resultado: 'O navegador mostra uma lista de tecnologias e uma seção separada com o objetivo de estudo.', pratica: 'Crie uma lista de três hobbies e uma seção com título e parágrafo para explicar seu favorito.', dica: 'A estrutura fica mais fácil de ler quando você indenta as tags internas alinhadas. Indentação é o recuo que mostra quem está dentro de quem.' },
        { titulo: '5. Atributos e caminhos de arquivos', objetivo: 'Atributos configuram uma tag. Caminhos mostram ao navegador onde encontrar imagens, páginas ou outros arquivos do projeto.', codigo: '<a href="contato.html">Fale comigo</a>\n<img src="imagens/foto-perfil.png" alt="Foto de perfil">\n<a href="https://exemplo.com" target="_blank" rel="noopener">Site externo</a>', partes: [['href', 'Atributo do link que informa o destino. Pode ser uma página local ou um endereço completo.'], ['src', 'Atributo da imagem que indica onde está o arquivo.'], ['imagens/foto-perfil.png', 'Caminho relativo: começa na pasta atual e entra na pasta imagens.'], ['target="_blank"', 'Abre o destino em outra aba do navegador.'], ['rel="noopener"', 'Protege a página de origem quando o link abre uma nova aba.'], ['alt', 'Descrição textual da imagem para acessibilidade e para falhas no carregamento.']], resultado: 'Um link abre contato.html, uma imagem é buscada na pasta imagens e o link externo abre em nova aba.', pratica: 'Imagine esta estrutura: index.html e uma pasta imagens com logo.png. Escreva a tag img com o caminho correto.', dica: 'No caminho relativo, ./ significa “nesta pasta” e ../ significa “voltar uma pasta”. Confira maiúsculas, minúsculas e extensão do arquivo.' }
      ]
    },
    intermediario: {
      nome: 'Intermediário', resumo: 'Agora combine os fundamentos para criar programas com decisões e repetições e páginas organizadas e interativas.',
      python: [
        { titulo: '1. Condições: escolher um caminho', objetivo: 'Uma condição permite que o programa tome decisões. if testa uma regra; elif testa outra possibilidade; else cobre os casos que sobraram.', codigo: 'idade = int(input("Sua idade: "))\nif idade >= 18:\n    print("Maior de idade")\nelif idade >= 16:\n    print("Pode votar, mas não é obrigatório")\nelse:\n    print("Ainda não pode votar")', partes: [['if', 'Inicia o primeiro teste. O bloco abaixo só roda se a condição for verdadeira.'], ['idade >= 18', 'Compara idade com 18. >= significa “maior ou igual”.'], [':', 'Os dois-pontos avisam que o bloco da condição começa na linha seguinte.'], ['Indentação', 'Os espaços no início identificam as linhas que pertencem ao bloco. Mantenha a mesma quantidade dentro dele.'], ['elif', 'Significa “senão, se”. É testado quando o if anterior foi falso.'], ['else', 'Executa quando nenhum teste anterior foi verdadeiro.']], resultado: 'Com 20, aparece “Maior de idade”; com 17, aparece a mensagem do elif; com 15, aparece a mensagem do else.', pratica: 'Crie uma regra que diga se uma nota é suficiente para passar e outra mensagem para nota abaixo do mínimo.', dica: 'Comparações comuns: == igual, != diferente, > maior, < menor, >= maior ou igual e <= menor ou igual.' },
        { titulo: '2. Repetições: fazer uma tarefa várias vezes', objetivo: 'Laços repetem instruções. Use for quando sabe quais itens ou quantas repetições quer percorrer. Use while quando a repetição depende de uma condição.', codigo: 'for numero in range(1, 4):\n    print("Rodada", numero)\n\ntentativa = 1\nwhile tentativa <= 3:\n    print("Tentativa", tentativa)\n    tentativa = tentativa + 1', partes: [['for numero in ...', 'Pega um valor por vez da sequência e guarda temporariamente em numero.'], ['range(1, 4)', 'Gera 1, 2 e 3. O valor final (4) não entra na sequência.'], ['while condição:', 'Repete o bloco enquanto a condição continuar verdadeira.'], ['tentativa = tentativa + 1', 'Aumenta o contador em 1 para que a condição um dia fique falsa.'], ['Indentação', 'As linhas recuadas pertencem ao laço e serão repetidas.']], resultado: 'Os dois exemplos mostram as rodadas 1, 2 e 3. No while, o contador precisa avançar; sem isso, a condição poderia nunca terminar.', pratica: 'Use for para mostrar os números de 1 a 5. Depois faça um while que conte de 3 até 1.', dica: 'Em range(inicio, fim), o início entra e o fim fica de fora. Confira sempre se o laço tem uma condição de parada.' },
        { titulo: '3. Funções: organizar e reutilizar código', objetivo: 'Uma função reúne instruções com um nome. Você pode enviar valores para ela por parâmetros e receber um resultado com return.', codigo: 'def dobro(numero):\n    resultado = numero * 2\n    return resultado\n\nvalor = dobro(5)\nprint(valor)', partes: [['def', 'Inicia a definição de uma função.'], ['dobro', 'É o nome escolhido para chamar essa função depois.'], ['numero', 'É um parâmetro: recebe o valor enviado na chamada.'], ['return resultado', 'Envia o resultado de volta para quem chamou a função e encerra sua execução.'], ['dobro(5)', 'Chama a função e passa 5 como argumento. Dentro dela, numero vale 5.'], ['valor = ...', 'Guarda o que a função devolveu para ser usado em outra parte do programa.']], resultado: 'dobro(5) calcula 5 vezes 2 e devolve 10. A variável valor recebe 10 e print() mostra esse resultado.', pratica: 'Crie uma função chamada saudacao(nome) que devolva uma mensagem usando o nome recebido.', dica: 'Parâmetro é o nome usado na definição. Argumento é o valor real enviado quando a função é chamada.' },
        { titulo: '4. Listas: guardar vários valores', objetivo: 'Uma lista guarda vários itens em uma única variável. Você pode acessar cada item pela posição, adicionar novos valores e percorrer a lista com um laço.', codigo: 'materias = ["HTML", "Python", "Lógica"]\nprint(materias[0])\nmaterias.append("CSS")\nfor materia in materias:\n    print("Vou estudar", materia)', partes: [['[ ... ]', 'Cria uma lista. Os itens ficam separados por vírgulas.'], ['materias[0]', 'Acessa o primeiro item. Em Python, as posições começam em zero.'], ['append(...)', 'Adiciona um item no final da lista.'], ['for materia in materias', 'Percorre a lista item por item; em cada volta, materia recebe o item atual.'], ['Indentação no for', 'A linha recuada é repetida para cada item da lista.']], resultado: 'Primeiro aparece HTML. Depois CSS é adicionado e o laço mostra uma mensagem para cada matéria.', pratica: 'Crie uma lista com três filmes e percorra-a com for, mostrando cada título.', dica: 'A posição 0 é o primeiro item, a posição 1 é o segundo. Tentar acessar uma posição que não existe causa erro.' },
        { titulo: '5. Combinar condições e operadores lógicos', objetivo: 'and, or e not juntam ou invertem condições. Eles permitem avaliar mais de uma regra antes de escolher um caminho.', codigo: 'idade = 17\nesta_matriculado = True\nif idade >= 16 and esta_matriculado:\n    print("Pode participar")\nelse:\n    print("Confira os requisitos")', partes: [['and', 'A condição completa só é verdadeira quando a regra da esquerda e a da direita são verdadeiras.'], ['or', 'A condição é verdadeira se pelo menos uma das regras for verdadeira.'], ['not', 'Inverte o resultado lógico: verdadeiro vira falso e falso vira verdadeiro.'], ['>=', 'Compara se a idade é maior ou igual a 16.'], ['True', 'Representa uma condição verdadeira. O valor precisa começar com letra maiúscula.'], ['if ... else', 'Escolhe qual bloco será executado conforme o resultado da condição.']], resultado: 'A mensagem “Pode participar” aparece apenas quando a idade é pelo menos 16 e a matrícula está ativa.', pratica: 'Crie uma regra em que uma pessoa recebe acesso se tiver uma senha correta e a conta estiver ativa.', dica: 'Leia condições longas em voz alta. Use parênteses para agrupar partes e deixar claro o que precisa ser verdadeiro primeiro.' }
      ],
      html: [
        { titulo: '1. Listas e tabelas para organizar conteúdo', objetivo: 'Use listas quando itens formam um conjunto. Use tabelas para dados que precisam ser comparados por linhas e colunas.', codigo: '<h2>O que estou estudando</h2>\n<ul>\n  <li>HTML</li>\n  <li>Python</li>\n</ul>\n<table>\n  <tr><th>Matéria</th><th>Tempo</th></tr>\n  <tr><td>HTML</td><td>20 min</td></tr>\n</table>', partes: [['<ul>', 'Cria uma lista sem ordem numérica. Para uma lista numerada, use <ol>.'], ['<li>', 'Representa cada item dentro de uma lista.'], ['<table>', 'Inicia uma tabela para dados organizados em linhas e colunas.'], ['<tr>', 'Cria uma linha da tabela.'], ['<th>', 'Cria uma célula de cabeçalho, que nomeia uma coluna ou linha.'], ['<td>', 'Cria uma célula comum que contém um dado.']], resultado: 'A lista mostra duas tecnologias. A tabela relaciona cada matéria com o tempo de estudo.', pratica: 'Monte uma lista de três metas e uma tabela com duas colunas para matéria e minutos de estudo.', dica: 'Não use tabela só para alinhar elementos visuais; para isso, CSS é a ferramenta adequada.' },
        { titulo: '2. Formulários: receber dados da pessoa', objetivo: 'Formulários reúnem campos para a pessoa preencher. Cada campo precisa de um rótulo claro e um tipo apropriado.', codigo: '<form>\n  <label for="email">Seu e-mail</label>\n  <input id="email" name="email" type="email" required>\n  <button type="submit">Enviar</button>\n</form>', partes: [['<form>', 'Agrupa os campos que fazem parte do mesmo envio.'], ['<label for="email">', 'Explica o campo. O valor de for deve ser igual ao id do campo associado.'], ['id="email"', 'Identifica o campo na página e permite conectar o rótulo a ele.'], ['name="email"', 'Nome usado para identificar o dado quando o formulário for processado.'], ['type="email"', 'Informa que o campo espera um endereço de e-mail e permite uma validação básica do navegador.'], ['required', 'Avisa que o campo precisa ser preenchido antes do envio.'], ['type="submit"', 'Faz o botão enviar o formulário.']], resultado: 'O rótulo fica associado ao campo, o navegador verifica o formato básico do e-mail e impede o envio vazio.', pratica: 'Adicione um campo para nome com label e outro para mensagem. Escolha o tipo mais adequado para cada um.', dica: 'O HTML prepara os dados e a interface. Para realmente guardar ou enviar informações, também é necessário código de processamento.' },
        { titulo: '3. Atributos, classes e estrutura semântica', objetivo: 'Atributos configuram elementos. Classes ajudam o CSS a encontrar grupos de elementos. Tags semânticas explicam o papel de cada região da página.', codigo: '<header><h1>Meu diário</h1></header>\n<main>\n  <article class="cartao">\n    <h2>Hoje aprendi</h2>\n    <p>Como organizar uma página.</p>\n  </article>\n</main>\n<footer>Feito por Lia</footer>', partes: [['Atributo', 'É uma informação colocada na tag de abertura, como class="cartao".'], ['class="cartao"', 'Dá uma classe ao elemento. No CSS, .cartao seleciona os elementos com essa classe.'], ['<header>', 'Representa a área de introdução ou cabeçalho da página.'], ['<main>', 'Identifica o conteúdo principal. Deve haver um main principal por página.'], ['<article>', 'Agrupa um conteúdo que faz sentido por conta própria, como uma publicação ou cartão informativo.'], ['<footer>', 'Representa informações de encerramento da página ou de uma seção.']], resultado: 'As tags descrevem as regiões pelo seu significado. A classe cartao permite dar estilo ao artigo sem misturar aparência com estrutura.', pratica: 'Organize uma página com header, main, duas sections ou articles e footer. Depois crie uma class para destacar uma das partes.', dica: 'Prefira tags pelo significado do conteúdo. Isso deixa a página mais fácil de manter e mais compreensível para tecnologias assistivas.' },
        { titulo: '4. Conectar HTML e CSS com classes', objetivo: 'HTML define o que cada conteúdo significa; CSS controla como ele aparece. Uma class cria um nome que o CSS pode usar para aplicar o mesmo estilo em vários elementos.', codigo: '<h2 class="titulo-card">Minha meta</h2>\n<p class="titulo-card">Estudar toda semana.</p>\n\n/* No arquivo styles.css */\n.titulo-card {\n  color: purple;\n  font-weight: bold;\n}', partes: [['class="titulo-card"', 'Marca os elementos HTML que receberão esse estilo. A class pode ser reutilizada.'], ['.titulo-card', 'O ponto no início indica ao CSS que estamos selecionando uma classe com esse nome.'], ['{ ... }', 'As chaves guardam as regras de aparência que serão aplicadas.'], ['color: purple;', 'Muda a cor do texto. O ponto e vírgula encerra esta declaração.'], ['font-weight: bold;', 'Deixa o texto mais forte, normalmente em negrito.'], ['HTML e CSS', 'O HTML organiza o conteúdo; o CSS cuida da apresentação visual.']], resultado: 'Os elementos que têm class="titulo-card" ficam roxos e em negrito, sem repetir as regras de estilo em cada tag.', pratica: 'Crie uma classe destaque, aplique-a a um parágrafo e defina cor, fundo e espaçamento no CSS.', dica: 'O nome da classe no HTML precisa combinar exatamente com o seletor no CSS. Não coloque ponto no atributo class; o ponto só aparece no seletor CSS.' },
        { titulo: '5. Acessibilidade e formulários bem explicados', objetivo: 'Uma página acessível pode ser compreendida e usada por mais pessoas, inclusive quem navega por teclado ou usa leitor de tela. Formulários precisam indicar claramente o que esperam.', codigo: '<label for="nome">Seu nome</label>\n<input id="nome" name="nome" type="text" autocomplete="name">\n\n<label for="mensagem">Sua mensagem</label>\n<textarea id="mensagem" name="mensagem" rows="4"></textarea>\n<button type="submit">Enviar</button>', partes: [['<label>', 'É o rótulo visível que explica o que preencher.'], ['for="nome" e id="nome"', 'Esses valores iguais conectam o rótulo ao campo. Clicar no rótulo também foca o campo.'], ['name', 'Identifica o dado quando o formulário for processado.'], ['autocomplete="name"', 'Ajuda o navegador a sugerir o nome salvo pela própria pessoa.'], ['<textarea>', 'Cria um campo de texto com várias linhas para mensagens maiores.'], ['rows="4"', 'Sugere a altura inicial do campo em linhas de texto.'], ['Foco pelo teclado', 'Um campo deve poder ser alcançado com Tab e mostrar visualmente onde o foco está.']], resultado: 'Cada campo tem um rótulo associado, e a pessoa consegue entender o que preencher antes de enviar.', pratica: 'Crie um formulário de contato com nome, e-mail e mensagem. Associe cada campo ao seu label.', dica: 'Não use somente o placeholder como rótulo: ele desaparece enquanto a pessoa digita. Mantenha uma label visível.' }
      ]
    },
    avancado: {
      nome: 'Avançado', resumo: 'Aplique os fundamentos em componentes completos, organize melhor seus projetos e aprenda a resolver problemas reais.',
      html: [
        { titulo: '1. CSS: cores, texto e espaçamento', objetivo: 'HTML organiza o conteúdo e CSS define sua aparência. Uma folha de estilos externa permite manter cores, fontes e espaçamentos consistentes em várias páginas.', codigo: '<link rel="stylesheet" href="estilos.css">\n\n.cartao {\n  color: #24123f;\n  background: #eee5ff;\n  padding: 16px;\n  border-radius: 12px;\n}', partes: [['rel="stylesheet"', 'Informa que o arquivo conectado contém regras de estilo CSS.'], ['href="estilos.css"', 'Aponta para a folha CSS; o caminho precisa estar correto.'], ['.cartao', 'Seleciona no HTML os elementos cuja classe é cartao.'], ['color e background', 'Definem respectivamente a cor do texto e o fundo.'], ['padding', 'Cria espaço interno entre o conteúdo e as bordas do elemento.'], ['border-radius', 'Arredonda os cantos do cartão.']], resultado: 'Ao conectar a folha e usar class="cartao", o elemento recebe texto roxo, fundo claro, espaço interno e cantos arredondados.', pratica: 'Crie um cartão com uma classe própria e altere a cor, o fundo, o espaçamento interno e o arredondamento.', dica: 'O seletor .classe precisa corresponder ao valor da class no HTML. Salve os dois arquivos na pasta esperada pelo caminho href.' },
        { titulo: '2. Seletores e cascata do CSS', objetivo: 'Seletores escolhem quais elementos recebem estilos. Quando duas regras atingem o mesmo elemento, a cascata considera prioridade, especificidade e ordem para decidir qual valor prevalece.', codigo: '<h1 class="titulo">Meu projeto</h1>\n<p id="resumo">Uma ideia em construção.</p>\n\n.titulo { color: rebeccapurple; }\n#resumo { color: #444; }\np { line-height: 1.6; }', partes: [['.titulo', 'O ponto seleciona qualquer elemento que tenha class="titulo".'], ['#resumo', 'O sinal # seleciona o elemento cujo id é resumo; ids devem ser únicos na página.'], ['p', 'Seleciona todas as tags p.'], ['Especificidade', 'Um seletor de id costuma ter prioridade maior que um de classe; classe supera o seletor simples da tag.'], ['Cascata', 'Regras empatadas podem ser resolvidas pela ordem: a declaração posterior prevalece.']], resultado: 'O título fica roxo, o resumo cinza e todos os parágrafos recebem espaçamento entre linhas.', pratica: 'Estilize um título por classe, um aviso por id e todos os parágrafos com uma regra de tag.', dica: 'Prefira classes reutilizáveis para componentes. Evite acumular ids e !important; isso dificulta ajustar a aparência depois.' },
        { titulo: '3. Layout responsivo com Flexbox', objetivo: 'Um layout responsivo se adapta ao espaço disponível. Flexbox organiza itens em linhas ou colunas e permite que eles quebrem para outra linha em telas estreitas.', codigo: '<div class="lista-cartoes">\n  <article>HTML</article>\n  <article>Python</article>\n  <article>Projetos</article>\n</div>\n\n.lista-cartoes {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 12px;\n}', partes: [['display: flex', 'Ativa o modelo flexível no elemento pai.'], ['flex-wrap: wrap', 'Permite que itens passem para a linha seguinte quando faltar espaço.'], ['gap: 12px', 'Cria uma distância uniforme entre os itens sem margens extras.'], ['Elemento pai', 'A classe de layout fica no contêiner; os articles são os itens organizados por ele.'], ['Responsividade', 'O layout pode ocupar uma linha em telas largas e várias em telas estreitas.']], resultado: 'Os cartões ficam lado a lado quando há espaço e quebram para outra linha conforme a tela diminui.', pratica: 'Monte três cartões e faça com que eles se reorganizem em telas menores usando flex-wrap e gap.', dica: 'Confira o resultado em uma tela estreita. Não fixe larguras maiores que o celular; use max-width e medidas flexíveis quando fizer sentido.' },
        { titulo: '4. Formulários acessíveis e validação', objetivo: 'Formulários bons explicam cada campo, validam formatos simples e ajudam a pessoa a corrigir dados antes do envio. A validação do navegador melhora a experiência, mas não substitui validações no servidor.', codigo: '<form>\n  <label for="email">E-mail</label>\n  <input id="email" name="email" type="email" required>\n  <button type="submit">Enviar</button>\n</form>', partes: [['label for e input id', 'Os valores iguais ligam o rótulo ao campo e ajudam leitores de tela e navegação por toque.'], ['name="email"', 'É o nome usado para identificar o dado quando o formulário for processado.'], ['type="email"', 'Pede um formato de e-mail e ativa validação básica do navegador.'], ['required', 'Impede o envio vazio pelo próprio navegador.'], ['Validação no servidor', 'Um sistema real também precisa validar os dados no servidor, pois regras do navegador podem ser contornadas.']], resultado: 'O campo recebe um rótulo conectado, indica que espera um e-mail e avisa quando estiver vazio.', pratica: 'Crie um formulário de inscrição com nome, e-mail e botão. Conecte cada label ao id e escolha os tipos apropriados.', dica: 'Mostre instruções claras e mensagens específicas. Nunca confie somente na validação visual do navegador para proteger dados.' },
        { titulo: '5. Projeto final: página de portfólio', objetivo: 'Um projeto final reúne estrutura, semântica, acessibilidade e estilo. Planeje as seções antes de escrever o código e teste a navegação no teclado e em telas pequenas.', codigo: '<header><h1>Portfólio da Lia</h1></header>\n<main>\n  <section aria-labelledby="sobre">\n    <h2 id="sobre">Sobre mim</h2>\n    <p>Estou aprendendo desenvolvimento web.</p>\n  </section>\n  <a href="projetos.html">Ver projetos</a>\n</main>\n<footer>Feito para aprender</footer>', partes: [['header', 'Apresenta o site ou a introdução da página.'], ['main', 'Agrupa o conteúdo principal e deve aparecer uma vez como região principal.'], ['section e aria-labelledby', 'Agrupam um assunto e conectam a região ao seu título.'], ['a href', 'Cria um link com destino. O texto precisa explicar para onde ele leva.'], ['footer', 'Apresenta informações de encerramento.'], ['Teste final', 'Confira títulos em ordem, descrições de imagens, links e navegação por teclado.']], resultado: 'A página tem regiões com significado, um título conectado à seção e um link com destino identificável.', pratica: 'Crie uma página de portfólio com apresentação, habilidades, dois projetos e contato. Use tags semânticas e uma classe CSS para os cartões.', dica: 'Antes de adicionar detalhes visuais, confira se a estrutura faz sentido lendo apenas os títulos, textos e links.' }
      ],
      python: [
        { titulo: '1. Listas: consultar, alterar e percorrer', objetivo: 'Listas guardam vários valores em uma sequência. Você pode acessar um item pelo índice, adicionar dados com append() e percorrer tudo com for.', codigo: 'materias = ["HTML", "Python"]\nmaterias.append("Projetos")\nfor posicao, materia in enumerate(materias, start=1):\n    print(posicao, materia)', partes: [['[ ... ]', 'Cria uma lista que mantém os itens em uma sequência.'], ['append()', 'Adiciona um novo item ao final da lista.'], ['for', 'Percorre a lista e executa o bloco para cada elemento.'], ['enumerate()', 'Fornece o índice e o valor de cada item; start=1 começa a contagem em um.'], ['Indentação', 'Marca o bloco que será repetido para cada matéria.']], resultado: 'A lista recebe Projetos e o laço mostra 1 HTML, 2 Python e 3 Projetos.', pratica: 'Guarde quatro tarefas numa lista, adicione uma quinta com append() e mostre cada uma numerada.', dica: 'Índices comuns começam em zero. enumerate() evita criar e atualizar um contador manual em muitas situações.' },
        { titulo: '2. Dicionários: organizar dados nomeados', objetivo: 'Dicionários guardam pares de chave e valor. Use-os quando cada informação tem um nome, como campos de perfil, notas ou configurações.', codigo: 'aluno = {\n    "nome": "Lia",\n    "pontos": 80,\n    "ativo": True\n}\naluno["pontos"] += 10\nprint(aluno["nome"], aluno["pontos"])', partes: [['{ chave: valor }', 'As chaves organizam campos identificados por nomes.'], ['"nome"', 'É uma chave de texto que identifica um valor no dicionário.'], ['aluno["pontos"]', 'Acessa o valor guardado sob a chave pontos.'], ['+= 10', 'Soma dez ao valor atual e guarda o resultado no mesmo campo.'], ['Valor ausente', 'Antes de acessar uma chave que pode não existir, use get() ou teste se ela está no dicionário.']], resultado: 'O programa encontra Lia, soma dez aos pontos e mostra Lia 90.', pratica: 'Crie um dicionário de livro com título, autor e páginas. Atualize um campo e mostre os dados.', dica: 'Use listas para uma sequência de itens parecidos e dicionários para atributos com nomes. Eles podem ser combinados quando cada item precisa de vários campos.' },
        { titulo: '3. Funções com parâmetros e resultados', objetivo: 'Funções ajudam a dividir um problema em tarefas reutilizáveis. Parâmetros recebem dados, return devolve um valor e a chamada da função usa o resultado.', codigo: 'def calcular_media(notas):\n    total = sum(notas)\n    return total / len(notas)\n\nmedia = calcular_media([8, 9, 7])\nprint(round(media, 1))', partes: [['def', 'Começa a definição da função.'], ['notas', 'Parâmetro: nome local que recebe o valor enviado na chamada.'], ['sum() e len()', 'Calculam, respectivamente, a soma dos itens e a quantidade de itens.'], ['return', 'Entrega o resultado para quem chamou a função.'], ['calcular_media([...])', 'Chama a função com uma lista e guarda o valor devolvido.'], ['round(media, 1)', 'Arredonda a média para uma casa decimal.']], resultado: 'A função calcula 24 dividido por 3 e mostra 8.0.', pratica: 'Escreva uma função que receba preço e quantidade e devolva o total da compra.', dica: 'Pense na função como uma tarefa com entrada e saída. Evite misturar várias responsabilidades em uma única função enorme.' },
        { titulo: '4. Tratar erros e validar entradas', objetivo: 'Erros de entrada podem acontecer mesmo quando o programa está correto. try e except permitem tratar casos esperados e orientar a pessoa sem esconder falhas importantes.', codigo: 'texto = input("Digite sua idade: ")\ntry:\n    idade = int(texto)\nexcept ValueError:\n    print("Digite um número inteiro.")\nelse:\n    print("Idade registrada:", idade)', partes: [['try', 'Envolve a operação que pode falhar.'], ['int(texto)', 'Converte o texto para inteiro e pode gerar ValueError se não for número válido.'], ['except ValueError', 'Trata especificamente esse tipo de erro e mostra uma orientação.'], ['else', 'Roda se nenhuma exceção foi lançada dentro do try.'], ['Validar entrada', 'Explique o formato esperado e permita tentar novamente quando isso fizer sentido.']], resultado: 'Se a entrada for letras, aparece uma orientação. Se for 15, o programa registra a idade.', pratica: 'Peça um número e trate ValueError com uma mensagem que explique como corrigir a entrada.', dica: 'Trate apenas erros que você sabe como resolver. Um except genérico pode esconder problemas de programação que precisam ser corrigidos.' },
        { titulo: '5. Projeto final: quiz de perguntas', objetivo: 'Um quiz usa uma coleção de perguntas, um laço para exibi-las, uma condição para conferir cada resposta e uma variável para acompanhar os pontos.', codigo: 'perguntas = [\n    {"texto": "2 + 2?", "resposta": "4"},\n    {"texto": "Tag de parágrafo?", "resposta": "<p>"}\n]\npontos = 0\nfor pergunta in perguntas:\n    resposta = input(pergunta["texto"] + " ")\n    if resposta.strip().lower() == pergunta["resposta"].lower():\n        pontos += 1\nprint("Pontuação:", pontos, "/", len(perguntas))', partes: [['Lista de dicionários', 'Cada pergunta é um dicionário; a lista mantém todas as perguntas do quiz.'], ['for pergunta in perguntas', 'Visita cada pergunta uma vez.'], ['input()', 'Recebe a resposta digitada pela pessoa.'], ['strip() e lower()', 'Removem espaços nas pontas e ignoram diferenças entre maiúsculas e minúsculas.'], ['if e +=', 'Comparam a resposta e aumentam os pontos quando está correta.'], ['len(perguntas)', 'Conta quantas perguntas foram aplicadas para mostrar o resultado.']], resultado: 'O quiz apresenta duas perguntas, soma um ponto para cada resposta certa e mostra a pontuação final.', pratica: 'Adicione mais duas perguntas, mostre quantas foram acertadas e exiba uma mensagem diferente conforme a pontuação.', dica: 'Teste respostas certas, erradas e com espaços extras. Um projeto fica mais confiável quando você pensa nos casos diferentes antes de terminar.' }
      ]
    },
  };
  var mapaMentalApostila = {
    basico: {
      python: [
        { icone: '🖥️', titulo: 'Mostrar e calcular', resumo: 'Dê uma instrução e confira o resultado.', mini: ['print()', 'textos com aspas', 'números e contas', 'parênteses'], extra: 'O programa executa as linhas na ordem. Experimente mudar o texto ou os números e observe o resultado que aparece.' },
        { icone: '📦', titulo: 'Variáveis e tipos', resumo: 'Dê nomes para as informações que o programa usa.', mini: ['str · texto', 'int · inteiro', 'float · decimal', 'bool · verdadeiro/falso'], extra: 'Pense numa variável como uma caixa identificada. O nome ajuda você a lembrar o que guardou e o tipo indica quais operações fazem sentido.' },
        { icone: '💬', titulo: 'Entrada e conversão', resumo: 'Receba uma resposta e prepare o valor para usar.', mini: ['input()', 'print()', 'int() e float()', 'conversão de dados'], extra: 'Uma sequência comum é: perguntar com input(), guardar a resposta, converter quando for número, calcular e exibir com print().' },
        { icone: '🧮', titulo: 'Operadores e contas', resumo: 'Transforme valores com cálculos e comparações.', mini: ['+  −  *', '/  //  %', '** potência', 'parênteses'], extra: 'O operador % retorna o resto. Por isso, numero % 2 == 0 é um jeito conhecido de verificar se um inteiro é par.' },
        { icone: '🧭', titulo: 'Código bem explicado', resumo: 'Use comentários e nomes para deixar sua intenção clara.', mini: ['snake_case', '# comentário', 'nomes descritivos', 'uma etapa por vez'], extra: 'Código claro ajuda você a encontrar erros e ajuda outra pessoa a entender o programa sem precisar adivinhar o que cada variável significa.' }
      ],
      html: [
        { icone: '🏗️', titulo: 'Estrutura do documento', resumo: 'A página tem uma base organizada em head e body.', mini: ['doctype', 'html e idioma', 'head e title', 'body'], extra: 'A estrutura funciona como o esqueleto da página: primeiro as configurações; depois, o conteúdo que aparece para a pessoa.' },
        { icone: '📝', titulo: 'Texto com hierarquia', resumo: 'Títulos e parágrafos dão ordem ao conteúdo.', mini: ['h1 · assunto principal', 'h2 e h3 · seções', 'p · parágrafo', 'strong · importância'], extra: 'A hierarquia deve fazer sentido mesmo sem estilos visuais. Isso melhora a leitura, a navegação por leitor de tela e a organização do documento.' },
        { icone: '🔗', titulo: 'Navegação e imagens', resumo: 'Links levam a destinos; imagens precisam de descrição.', mini: ['a e href', 'img e src', 'alt descritivo', 'caminho de arquivo'], extra: 'Antes de publicar, confira se o destino do link existe e se o caminho da imagem aponta para o arquivo correto.' },
        { icone: '🧩', titulo: 'Agrupar informações', resumo: 'Listas e seções mostram como as partes se relacionam.', mini: ['ul · lista com marcadores', 'ol · lista numerada', 'li · item', 'section · assunto'], extra: 'As tags podem ficar dentro umas das outras. Mantenha a ordem de abertura e fechamento para a estrutura continuar válida.' },
        { icone: '⚙️', titulo: 'Configurar elementos', resumo: 'Atributos ajustam links, imagens e caminhos.', mini: ['href', 'src', 'alt', 'caminho relativo'], extra: 'Atributos ficam na tag de abertura. Confira cada valor com atenção: um caminho ou nome errado pode impedir a imagem de aparecer.' }
      ]
    },
    intermediario: {
      python: [
        { icone: '🔀', titulo: 'Tomar decisões', resumo: 'Condições escolhem qual bloco será executado.', mini: ['if', 'elif', 'else', 'and · or · not'], extra: 'Leia cada condição como uma pergunta que só pode ser verdadeira ou falsa. A indentação mostra qual instrução pertence a cada resposta.' },
        { icone: '🔁', titulo: 'Repetir instruções', resumo: 'Laços percorrem sequências ou repetem até uma condição mudar.', mini: ['for', 'while', 'range()', 'contador e parada'], extra: 'Um while precisa de uma condição que eventualmente fique falsa. Se nada alterar essa condição, o programa pode ficar preso numa repetição sem fim.' },
        { icone: '🧱', titulo: 'Criar funções', resumo: 'Funções separam tarefas e permitem reutilizar código.', mini: ['def', 'parâmetro', 'argumento', 'return'], extra: 'Uma função bem nomeada deve cuidar de uma tarefa clara. Ao separar o programa em funções, fica mais fácil testar e corrigir cada parte.' },
        { icone: '🗂️', titulo: 'Trabalhar com coleções', resumo: 'Listas reúnem itens e funcionam bem com laços.', mini: ['lista [ ]', 'índice começa em 0', 'append()', 'percorrer itens'], extra: 'Use uma lista quando os valores têm relação entre si. Um for pode visitar cada item sem você precisar escrever o mesmo comando várias vezes.' },
        { icone: '🧠', titulo: 'Juntar regras', resumo: 'Operadores lógicos combinam mais de uma condição.', mini: ['and · as duas regras', 'or · uma das regras', 'not · inverter', 'comparações'], extra: 'Escreva cada condição em uma linha mental separada. Depois combine com and ou or e confira se o resultado esperado faz sentido.' }
      ],
      html: [
        { icone: '📊', titulo: 'Organizar conjuntos de dados', resumo: 'Listas e tabelas estruturam grupos e comparações.', mini: ['ul e ol', 'li', 'table', 'tr · th · td'], extra: 'Tabelas são próprias para dados que se cruzam em linhas e colunas. Para posicionar cartões e seções na tela, use CSS em vez de tabela.' },
        { icone: '📨', titulo: 'Receber informações', resumo: 'Formulários juntam rótulos, campos e ações.', mini: ['form', 'label + for', 'input + id', 'required e type'], extra: 'Cada campo precisa de uma label visível. O atributo name identifica o dado e o type pode ajudar o navegador a validar ou sugerir conteúdo.' },
        { icone: '🧠', titulo: 'Dar significado à página', resumo: 'Tags semânticas descrevem o papel de cada região.', mini: ['header', 'main', 'article', 'footer'], extra: 'Semântica ajuda mecanismos de busca e tecnologias assistivas a reconhecer o conteúdo principal, as publicações e as áreas de navegação.' },
        { icone: '🎨', titulo: 'Separar conteúdo e aparência', resumo: 'Classes conectam elementos HTML a regras CSS.', mini: ['class no HTML', '.classe no CSS', 'seletor', 'propriedade e valor'], extra: 'Use HTML para organizar e nomear o conteúdo. Use CSS para definir cor, espaço, tamanho, alinhamento e adaptação a diferentes telas.' },
        { icone: '♿', titulo: 'Acessibilidade', resumo: 'Rótulos e foco claro ajudam mais pessoas a usar a página.', mini: ['label visível', 'id + for', 'autocomplete', 'teclado e foco'], extra: 'Teste percorrer os controles com Tab. Uma pessoa deve conseguir entender cada campo e perceber qual elemento está selecionado.' }
      ]
    },
    avancado: {
      python: [
        { icone: '📚', titulo: 'Listas em ação', resumo: 'Percorra, consulte e atualize coleções.', mini: ['append()', 'enumerate()', 'índices', 'for'], extra: 'Listas mantêm itens em sequência. Escolha entre acessar por índice, percorrer com for ou acrescentar itens conforme o programa funciona.' },
        { icone: '🗝️', titulo: 'Dados nomeados', resumo: 'Use dicionários quando cada valor tem um rótulo.', mini: ['chave e valor', 'get()', 'atualizar dados', 'listas de registros'], extra: 'Um dicionário ajuda a representar objetos do cotidiano, como uma conta, um livro ou uma pergunta de quiz.' },
        { icone: '🧱', titulo: 'Funções reutilizáveis', resumo: 'Transforme entradas em resultados com return.', mini: ['parâmetros', 'argumentos', 'return', 'responsabilidade única'], extra: 'Funções pequenas tornam um projeto mais fácil de ler. Você pode calcular um valor numa função e decidir fora dela o que fazer com o resultado.' },
        { icone: '🛟', titulo: 'Erros tratados', resumo: 'Antecipe entradas inválidas e explique como corrigir.', mini: ['try', 'except', 'ValueError', 'else'], extra: 'Trate os erros previsíveis perto da operação que pode falhar. Uma mensagem clara ajuda a pessoa a corrigir a entrada.' },
        { icone: '🏁', titulo: 'Projeto: quiz', resumo: 'Combine perguntas, laços, condições e pontuação.', mini: ['lista de perguntas', 'input()', 'comparação', 'pontuação'], extra: 'O projeto final transforma conceitos isolados num programa completo. Teste diferentes respostas, dados vazios e espaços a mais.' }
      ],
      html: [
        { icone: '🎨', titulo: 'Conectar HTML e CSS', resumo: 'Crie uma folha externa e estilos reutilizáveis.', mini: ['link rel stylesheet', 'class', 'color', 'padding'], extra: 'Separe estrutura e aparência. Um arquivo CSS compartilhado mantém as páginas do projeto consistentes.' },
        { icone: '🎯', titulo: 'Selecionar elementos', resumo: 'Entenda classes, ids e regras que se sobrepõem.', mini: ['seletor de tag', '.classe', '#id', 'especificidade'], extra: 'Quando um estilo inesperado aparece, confira quais seletores alcançam o elemento e compare sua prioridade.' },
        { icone: '📱', titulo: 'Layout que se adapta', resumo: 'Organize cartões que se reorganizam em telas estreitas.', mini: ['display: flex', 'flex-wrap', 'gap', 'teste mobile'], extra: 'Flexbox organiza itens dentro de um contêiner. A quebra de linha ajuda a interface a caber em diferentes larguras.' },
        { icone: '♿', titulo: 'Formulário confiável', resumo: 'Combine rótulos visíveis, tipos e validação.', mini: ['label + id', 'name', 'required', 'servidor também valida'], extra: 'A validação do navegador é uma ajuda de interface. Aplicações que recebem dados também precisam verificá-los no servidor.' },
        { icone: '🚀', titulo: 'Projeto: portfólio', resumo: 'Planeje uma página semântica e acessível.', mini: ['header e main', 'section nomeada', 'links claros', 'teste com teclado'], extra: 'Leia a página sem olhar os estilos e navegue com Tab. A ordem do conteúdo e o foco precisam fazer sentido.' }
      ]
    }
  };
  function trechoDoConceito(parte, codigo, linguagem) {
    if (parte[2]) return parte[2];
    var rotulo = parte[0], linhas = codigo.split('\n'), achadas = [];
    if (linguagem === 'html') {
      var tags = (rotulo.match(/<\/?[a-z][\w-]*/gi) || []).map(function (t) { return t.replace(/^<\/?/, '').toLowerCase(); });
      var attrs = rotulo.match(/\b(?:href|src|alt|class|id|for|name|type|lang|charset|target|rel|rows|required|autocomplete)\b/gi) || [];
      achadas = linhas.filter(function (linha) {
        return tags.some(function (tag) { return new RegExp('<\\/?' + tag + '(?:\\s|>|/)', 'i').test(linha); }) || attrs.some(function (attr) { return new RegExp('\\b' + attr + '\\s*=', 'i').test(linha); });
      });
    } else {
      var termos = rotulo.match(/[A-Za-z_][A-Za-z_0-9]*|==|!=|>=|<=|[+\-*\/%]+/g) || [];
      termos = termos.filter(function (t) { return t.length > 2 || /^(==|!=|>=|<=|[+\-*\/%]+)$/.test(t); });
      achadas = linhas.filter(function (linha) { return termos.some(function (t) { return linha.indexOf(t) >= 0; }); });
    }
    return (achadas.length ? achadas.slice(0, 3) : linhas.slice(0, 2)).join('\n');
  }
  /* ---------- Apostila: capítulos, código anotado e navegação ---------- */
  var apEstado = { cap: 0, aberto: false, etapa: {}, nota: {} };
  var APOSTILA_MARCA = { html: { nome: 'HTML', arq: 'index.html', icone: 'code' }, python: { nome: 'Python', arq: 'exemplo.py', icone: 'terminal' } };
  var APOSTILA_LICOES = {
    'html-b1': 'html-1', 'html-b2': 'html-2', 'html-b3': 'html-3', 'html-b4': 'html-4', 'html-b5': 'html-3',
    'html-i1': 'html-4', 'html-i2': 'html-1', 'html-i3': 'html-4', 'html-i4': 'html-2', 'html-i5': 'html-1',
    'python-b1': 'py-1', 'python-b2': 'py-2', 'python-b3': 'py-2', 'python-b4': 'py-3', 'python-b5': 'py-2',
    'python-i1': 'py-4', 'python-i2': 'py-5', 'python-i3': 'py-6', 'python-i4': 'py-2', 'python-i5': 'py-4',
    'html-a1': 'html-5', 'html-a2': 'html-6', 'html-a3': 'html-7', 'html-a4': 'html-8', 'html-a5': 'html-9',
    'python-a1': 'py-7', 'python-a2': 'py-8', 'python-a3': 'py-9', 'python-a4': 'py-10', 'python-a5': 'py-11'
  };
  var extrasApostila = {
    'python-b1': { saida: 'Olá, mundo!\n5', erros: [['print("Olá, mundo!)', 'Faltou fechar as aspas: o Python não sabe onde o texto termina.', 'print("Olá, mundo!")'], ['Print("Olá")', 'Python diferencia maiúsculas de minúsculas. O comando é print.', 'print("Olá")']] },
    'python-b3': { entrada: 'Qual é seu nome? Lia\nQual é sua idade? 15', saida: 'Olá, Lia\nNo ano que vem você terá 16', erros: [['idade = input("Idade: ")\nprint(idade + 1)', 'input() devolve texto. Somar texto com número causa um TypeError.', 'idade = int(input("Idade: "))\nprint(idade + 1)']] },
    'python-i1': { entrada: 'Sua idade: 17', saida: 'Pode votar, mas não é obrigatório', erros: [['if idade >= 18\n    print("Maior")', 'Faltaram os dois-pontos no fim da linha do if.', 'if idade >= 18:\n    print("Maior")'], ['if idade = 18:', 'O = guarda um valor. Para comparar, use ==.', 'if idade == 18:']] },
    'html-b1': { saida: 'O navegador mostra o título “Olá, mundo!” e o parágrafo. A aba se chama “Minha página”.', erros: [['<p>Olá', 'A tag foi aberta e nunca fechada; o resto da página pode sair errado.', '<p>Olá</p>'], ['<h1>Título</h2>', 'A tag de fechamento precisa ter o mesmo nome da abertura.', '<h1>Título</h1>']] },
    'html-b3': { erros: [['<img src="bitinho.png">', 'Sem alt, leitores de tela não descrevem a imagem.', '<img src="bitinho.png" alt="Mascote Bitinho">'], ['<a>Visite</a>', 'Sem href, o link não leva a lugar nenhum.', '<a href="https://exemplo.com">Visite</a>']] },
    'html-i2': { erros: [['<label>E-mail</label>\n<input type="email">', 'O rótulo não está ligado ao campo (falta for e id).', '<label for="email">E-mail</label>\n<input id="email" type="email">']] }
  };
  function capitulosApostila(lang) {
    var out = [];
    ['basico', 'intermediario', 'avancado'].forEach(function (n) { conteudoApostila[n][lang].forEach(function (t, i) { out.push({ nivel: n, t: t, id: lang + '-' + n.charAt(0) + (i + 1), titulo: t.titulo.replace(/^\d+\.\s*/, '') }); }); });
    return out;
  }
  function apLido(id) { return !!(S.apostila && S.apostila[id]); }
  function posLiteral(l, lit) { var m = new RegExp((/^\w/.test(lit) ? '(?<![\\w])' : '') + lit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).exec(l); return m ? m.index : -1; }
  function literalDaParte(p) { return p[0].replace(/\s*\.\.\.[\s\S]*$/, '').trim(); }
  function linhasDaParte(parte, linhas, lang) {
    var rotulo = parte[0], achadas = [];
    if (lang === 'html') {
      var tags = (rotulo.match(/<\/?[a-z][\w-]*/gi) || []).map(function (t) { return t.replace(/^<\/?/, '').toLowerCase(); });
      var attrs = rotulo.match(/\b(?:href|src|alt|class|id|for|name|type|lang|charset|target|rel|rows|required|autocomplete)\b/gi) || [];
      linhas.forEach(function (l, i) { if (tags.some(function (tg) { return new RegExp('<\\/?' + tg + '(?:\\s|>|/)', 'i').test(l); }) || attrs.some(function (a) { return new RegExp('\\b' + a + '\\s*=', 'i').test(l); })) achadas.push(i); });
    } else {
      var lit = literalDaParte(parte), exatas = lit.length > 1 ? linhas.map(function (l, i) { return posLiteral(l, lit) >= 0 ? i : -1; }).filter(function (i) { return i >= 0; }) : [];
      if (exatas.length) return exatas;
      var termos = (rotulo.match(/[A-Za-z_][A-Za-z_0-9]*|==|!=|>=|<=|[+\-*\/%]+/g) || []).filter(function (t) { return t.length > 2 || /^(==|!=|>=|<=|[+\-*\/%]+)$/.test(t); });
      linhas.forEach(function (l, i) { if (termos.some(function (t) { return l.indexOf(t) >= 0; })) achadas.push(i); });
    }
    return achadas;
  }
  function destacarTermos(txt, partes) {
    var lits = [];
    partes.forEach(function (p) { var l = literalDaParte(p).replace(/\(.*$/, ''); if (/^[A-Za-z_][\w]*$/.test(l) && l.length > 1 && lits.indexOf(l) < 0) lits.push(l); });
    if (!lits.length) return esc(txt);
    lits.sort(function (a, b) { return b.length - a.length; });
    var vistos = {}, re = new RegExp('(?<![\\wÀ-ÿ])(' + lits.join('|') + ')(\\(\\))?(?![\\wÀ-ÿ])', 'g');
    return esc(txt).replace(re, function (t, a) { if (vistos[a]) return t; vistos[a] = 1; return '<code class="ap-term">' + t + '</code>'; });
  }
  function linhaAnotada(linha, lang, u) {
    if (!u) return realcar(linha, lang) || ' ';
    var p = posLiteral(linha, u.lit);
    return realcar(linha.slice(0, p), lang) + '<span class="ap-ann">' + realcar(u.lit, lang) + '</span>' + realcar(linha.slice(p + u.lit.length), lang);
  }
  function blocoCodigo(txt, cls) { return '<pre class="' + cls + '"><code>' + esc(txt) + '</code></pre>'; }
  function codigoAnotado(c, lang) {
    var t = c.t, m = APOSTILA_MARCA[lang], linhas = t.codigo.split('\n'), n = linhas.length;
    var E = n >= 7 ? 4 : n >= 4 ? 3 : n >= 2 ? 2 : 1, chunk = Math.ceil(n / E); E = Math.ceil(n / chunk);
    var etapa = Math.min(apEstado.etapa[c.id] || E, E), ativa = apEstado.nota[c.id] || 0, pins = linhas.map(function () { return []; }), under = {};
    var alvos = t.partes.map(function (p, k) {
      var idx = linhasDaParte(p, linhas, lang).slice(0, 2), lit = literalDaParte(p);
      idx.forEach(function (i) { pins[i].push(k + 1); if (!under[i] && lit.length > 1 && posLiteral(linhas[i], lit) >= 0) under[i] = { lit: lit }; });
      return idx;
    });
    var corpo = linhas.map(function (l, i) {
      var st = Math.floor(i / chunk) + 1;
      return '<div class="ap-ln' + (st > etapa ? ' later' : st === etapa && E > 1 ? ' novo' : '') + (ativa && pins[i].indexOf(ativa) >= 0 ? ' on' : '') + '"><b>' + (i + 1) + '</b><code>' + linhaAnotada(l, lang, under[i]) + '</code><span class="ap-pins">' + pins[i].map(function (k) { return '<i>' + k + '</i>'; }).join('') + '</span></div>';
    }).join('');
    var a = (etapa - 1) * chunk + 1, b = Math.min(n, etapa * chunk);
    var entram = t.partes.filter(function (p, k) { return alvos[k].length && alvos[k][0] + 1 >= a && alvos[k][0] + 1 <= b; }).map(function (p) { return '<code>' + esc(literalDaParte(p)) + '</code>'; });
    var legenda = E === 1 ? 'Código completo.' : etapa === E ? '<strong>Etapa ' + etapa + ' de ' + E + ' · código completo.</strong> Entram as linhas ' + a + '–' + b + (entram.length ? ': ' + entram.join(', ') : '') + '.' : '<strong>Etapa ' + etapa + ' de ' + E + '.</strong> ' + (etapa === 1 ? 'Começamos com' : 'Agora entram') + ' as linhas ' + a + '–' + b + (entram.length ? ': ' + entram.join(', ') : '') + '. As linhas apagadas vêm depois.';
    var botoes = E > 1 ? '<div class="ap-etapas" role="group" aria-label="Etapas do código"><small>Etapa</small>' + Array.apply(null, Array(E)).map(function (_, e) { return '<button type="button" class="' + (e + 1 === etapa ? 'on' : '') + '" data-act="apostilaEtapa" data-id="' + c.id + '" data-e="' + (e + 1) + '" aria-pressed="' + (e + 1 === etapa) + '">' + (e + 1) + '</button>'; }).join('') + '</div>' : '';
    var cartao = '<div class="ap-code"><div class="ap-code-bar">' + ic(m.icone) + '<span>' + m.arq + '</span>' + botoes + '<button type="button" class="ap-copy" data-act="apostilaCopiar">Copiar código</button></div><pre class="ap-lines">' + corpo + '</pre><p class="ap-etapa-cap" aria-live="polite">' + legenda + '</p><textarea class="ap-code-source" aria-hidden="true" tabindex="-1" readonly hidden>' + esc(t.codigo) + '</textarea></div>';
    var notas = '<ol class="ap-notes">' + t.partes.map(function (p, k) {
      return '<li><button type="button" class="ap-note' + (ativa === k + 1 ? ' on' : '') + '" data-act="apostilaNota" data-id="' + c.id + '" data-n="' + (k + 1) + '" aria-pressed="' + (ativa === k + 1) + '"><b class="ap-note-n">' + (k + 1) + '</b><span><u>' + esc(p[0]) + '</u><span>' + esc(p[1]) + '</span></span><small class="ap-arrow">' + (alvos[k].length ? '→ linha ' + alvos[k].map(function (i) { return i + 1; }).join(' e ') : 'vale para o código todo') + '</small></button></li>';
    }).join('') + '</ol>';
    return { cartao: cartao, notas: notas };
  }
  function capituloHTML(c, cur, caps, lang) {
    var t = c.t, m = APOSTILA_MARCA[lang], ex = extrasApostila[c.id] || {}, cod = codigoAnotado(c, lang), lido = apLido(c.id);
    var sec = function (n, titulo, corpo) { return '<section class="ap-sec"><h3><b>' + n + '</b>' + titulo + '</h3>' + corpo + '</section>'; };
    var licaoId = APOSTILA_LICOES[c.id], licaoRelacionada = licaoId && LIC[licaoId];
    var nomeNivel = c.nivel === 'basico' ? 'Básico' : c.nivel === 'intermediario' ? 'Intermediário' : 'Avançado';
    var h = '<article class="ap-chap" id="cap-' + c.id + '"><header class="ap-chap-head"><div class="ap-kicker"><span class="ap-lang">' + ic(m.icone) + m.nome + '</span><span class="soft-tag">Capítulo ' + (cur + 1) + ' de ' + caps.length + ' · ' + nomeNivel + '</span></div><h2>' + esc(c.titulo) + '</h2></header>';
    h += sec(1, 'Explicação', '<p class="ap-text">' + destacarTermos(t.objetivo, t.partes) + '</p>');
    h += sec(2, 'Exemplo', cod.cartao + '<p class="ap-hint">Os números nos círculos ligam cada linha à explicação abaixo. Toque em uma explicação para destacar as linhas dela.</p>' + (ex.entrada || ex.saida ? '<div class="ap-io">' + (ex.entrada ? '<div><small>Entrada (o que a pessoa digita)</small>' + blocoCodigo(ex.entrada, 'ap-io-in') + '</div>' : '') + (ex.saida ? '<div><small>Resultado na tela</small>' + blocoCodigo(ex.saida, 'ap-io-out') + '</div>' : '') + '</div>' : '') + '<div class="ap-call ap-result"><strong>' + ic('ok') + 'Resultado esperado</strong><span>' + esc(t.resultado) + '</span></div>');
    h += sec(3, 'Passo a passo', '<p class="ap-text">Cada quadro explica uma parte do código. Use as etapas do exemplo para ver o programa crescer aos poucos.</p>' + cod.notas);
    var erros = (ex.erros || []).map(function (e) { return '<div class="ap-err"><strong>' + ic('no') + 'Erro comum</strong>' + blocoCodigo(e[0], 'bad') + '<p>' + esc(e[1]) + '</p><strong class="okk">' + ic('ok') + 'Como corrigir</strong>' + blocoCodigo(e[2], 'good') + '</div>'; }).join('');
    h += sec(4, 'Dicas e cuidados', '<div class="ap-call ap-tip"><strong>' + ic('bulb') + 'Dica importante</strong><span>' + esc(t.dica) + '</span></div>' + erros);
    h += sec(5, 'Revisão', '<div class="ap-call ap-review"><strong>' + ic('book') + 'Em poucas palavras</strong><ul>' + t.partes.slice(0, 3).map(function (p) { return '<li><b>' + esc(p[0]) + '</b> — ' + esc(p[1].split(/(?<=\.)\s/)[0]) + '</li>'; }).join('') + '</ul></div><div class="ap-call ap-practice"><strong>' + ic('target') + 'Hora de praticar</strong><span>' + esc(t.pratica) + '</span></div>' + (licaoRelacionada ? '<button type="button" class="btn ap-practice-link" data-act="apostilaPraticar" data-id="' + licaoId + '">' + ic('play') + '<span>Praticar este tema<small>Exercícios relacionados: ' + esc(licaoRelacionada.l.titulo) + '</small></span></button>' : '') + '<button type="button" class="btn ' + (lido ? 'soft' : '') + ' ap-done" data-act="apostilaConcluir" data-id="' + c.id + '">' + (lido ? 'Capítulo estudado · desmarcar' : 'Marcar capítulo como estudado') + '</button>');
    var ant = cur > 0 ? '<button type="button" class="btn soft" data-act="apostilaCap" data-v="' + (cur - 1) + '">← ' + esc(caps[cur - 1].titulo) + '</button>' : '<span></span>';
    var prox = cur < caps.length - 1 ? '<button type="button" class="btn" data-act="apostilaCap" data-v="' + (cur + 1) + '">' + esc(caps[cur + 1].titulo) + ' →</button>' : '<span></span>';
    return h + '<nav class="ap-pager" aria-label="Capítulo anterior e próximo">' + ant + prox + '</nav></article>';
  }
  function telaApostila() {
    var h = '<header class="pad apostila-head"><span class="eyebrow">Guia de estudo passo a passo</span><h1 class="title-xl">Apostila</h1><p class="muted">Escolha uma linguagem para ver os capítulos.</p></header>';
    if (!temaApostila) {
      h += '<section class="pad apostila-chooser"><div><span class="soft-tag">ETAPA 1 DE 2</span><h2 class="title-lg" style="margin-top:8px">O que você quer estudar?</h2><p class="muted" style="margin-top:6px">Escolha uma opção. Depois explore capítulos básicos, intermediários e avançados.</p></div><div class="technology-cards">' + [
        ['html', ic('code'), 'HTML', 'Monte páginas com títulos, textos, imagens, links e formulários.', 'Você vai aprender a estruturar conteúdo para a web.'],
        ['python', ic('terminal'), 'Python', 'Crie programas, faça cálculos, tome decisões e automatize tarefas.', 'Você vai aprender a dar instruções ao computador.']
      ].map(function (x) { return '<button class="technology-card ' + x[0] + '" data-act="apostilaTema" data-v="' + x[0] + '"><span class="technology-emoji">' + x[1] + '</span><span class="technology-title">' + x[2] + '</span><span class="technology-copy">' + x[3] + '</span><span class="technology-foot">' + x[4] + '</span><span class="technology-cta">Escolher ' + x[2] + ' →</span></button>'; }).join('') + '</div></section>';
      return h;
    }
    var lang = temaApostila, m = APOSTILA_MARCA[lang], caps = capitulosApostila(lang), cur = Math.min(apEstado.cap, caps.length - 1), c = caps[cur];
    var cap = conteudoApostila[c.nivel], lista = cap[lang]; capituloApostila = c.nivel;
    var barra = '<div class="ap-top"><span class="ap-top-title">' + ic(m.icone) + m.nome + '</span><button type="button" class="ap-close" data-act="apostilaVoltar" aria-label="Voltar para a página anterior">' + ic('close') + '</button></div>';
    if (!apEstado.aberto) {
      var lidos = caps.filter(function (x) { return apLido(x.id); }).length, pct = Math.round(lidos / caps.length * 100);
      var ultimo = S.apostilaRetomar && S.apostilaRetomar.lang === lang ? Math.max(0, Math.min(caps.length - 1, S.apostilaRetomar.cap)) : -1;
      var retomar = ultimo >= 0 ? '<button type="button" class="ap-resume" data-act="apostilaRetomar" data-v="' + ultimo + '"><span>▶</span><span><strong>Continuar de onde parou</strong><small>Capítulo ' + (ultimo + 1) + ' · ' + esc(caps[ultimo].titulo) + '</small></span><b>→</b></button>' : '';
      return barra + '<section class="pad ap-pick"><div class="ap-pick-head"><span class="soft-tag">ESCOLHA O CAPÍTULO</span><h1 class="title-xl">Qual capítulo de ' + m.nome + ' você quer estudar?</h1><p class="ap-pick-sub">Toque em um capítulo para abrir o conteúdo.</p></div><div class="ap-progress"><div class="ap-progress-top"><span>' + lidos + ' de ' + caps.length + ' capítulos estudados</span><b>' + pct + '%</b></div>' + bar(pct) + '</div>' + retomar + '<div class="ap-pick-list">' + caps.map(function (x, k) {
        var lido = apLido(x.id);
      var grupo = x.nivel === 'basico' ? 'Parte 1 · Básico' : x.nivel === 'intermediario' ? 'Parte 2 · Intermediário' : 'Parte 3 · Avançado';
        return (k === 0 || caps[k - 1].nivel !== x.nivel ? '<h2 class="ap-pick-group">' + grupo + '</h2>' : '') + '<button type="button" class="ap-cap-card' + (lido ? ' done' : '') + '" data-act="apostilaCap" data-v="' + k + '"><span class="ap-cap-num" aria-hidden="true">' + ic('book') + '</span><span class="ap-cap-text"><strong>' + esc(x.titulo) + '</strong><small>' + esc(x.t.objetivo) + '</small></span><span class="ap-cap-state">' + (lido ? 'Estudado ✓' : 'Abrir →') + '</span></button>';
      }).join('') + '</div></section>';
    }
    h = barra + '<div class="pad">' + capituloHTML(c, cur, caps, lang) + '</div>';
    h += '<div class="pad apostila-section-title mindmap-bottom-title"><span class="soft-tag">REVISÃO VISUAL</span><h2 class="title-md">Mapa mental do capítulo</h2><p class="muted">Chegou ao final das aulas? Explore os ramos para revisar os conceitos, os mini tópicos e o código animado.</p><section class="mindmap"><div class="mindmap-hub"><span>🧠 MAPA MENTAL</span><strong>' + (temaApostila === 'html' ? 'HTML' : 'Python') + ' · ' + cap.nome + '</strong><small>Explore cinco ideias e veja um exemplo de cada uma</small></div><div class="mindmap-roots">' + mapaMentalApostila[capituloApostila][temaApostila].map(function (m, n) { var exemplo = lista[n] || lista[0]; return '<details class="mindmap-node" data-map-node="' + n + '"><summary><span class="mindmap-icon">' + m.icone + '</span><span class="mindmap-label"><strong>' + esc(m.titulo) + '</strong><small>' + esc(m.resumo) + '</small></span><span class="mindmap-plus" aria-hidden="true">+</span></summary><div class="mindmap-details"><div class="mini-topics">' + m.mini.map(function (tag) { return '<span>' + esc(tag) + '</span>'; }).join('') + '</div><p><b>💡 Um passo além:</b> ' + esc(m.extra) + '</p><div class="map-code-window"><div class="map-code-toolbar"><span class="map-code-dots"><i></i><i></i><i></i></span><strong>' + (temaApostila === 'html' ? 'index.html' : 'exemplo.py') + '</strong><span class="map-code-status" aria-live="polite">O código aparece ao abrir este ramo</span></div><pre class="map-code-screen"><code class="map-code-output"></code><i class="map-code-caret" aria-hidden="true"></i></pre><pre class="map-code-source" hidden>' + esc(exemplo.codigo) + '</pre></div><small class="map-code-caption">Exemplo do tópico: ' + esc(exemplo.titulo.replace(/^\d+\.\s*/, '')) + '</small></div></details>'; }).join('') + '</div><div class="mindmap-footer">Dica de estudo <span>Abra um ramo, veja o código surgir letra por letra e depois encontre o mesmo exemplo na aula correspondente.</span></div></section></div>';
    return h;
  }
  function telaPerfil() {
    var xpNivel = S.xp % 100, ganhas = medalhasAtuais(), c = S.config;
    var concl = Object.keys(S.concluidas).length;
    var h = '<header class="pad profile-head"><div class="profile-tools"><span class="profile-mark">BITINHO</span><label class="edit-profile">Editar foto<input id="fotoPerfil" type="file" accept="image/*" aria-label="Alterar foto de perfil"></label></div><div class="profile-hero"><label class="avatar avatar-upload profile-avatar" aria-label="Arraste para girar sua foto em 360 graus">' + (S.foto ? '<span class="spin-sides"><img class="spin-face spin-front" src="' + S.foto + '" alt="Foto de perfil"><img class="spin-face spin-back" src="' + S.foto + '" alt="" aria-hidden="true"></span>' : mascote('feliz',76, S.skinEquipada)) + '</label><span class="profile-spin-hint">Arraste para girar 360°</span><div class="profile-note-bubble"' + (S.nota ? '' : ' hidden') + '>' + esc(S.nota) + '</div><div class="profile-name-row"><input class="nameinput profile-name" id="nome" value="' + esc(S.nome) + '" maxlength="20" aria-label="Seu nome" autocomplete="off"><span class="profile-level-dot" title="Nível ' + nivel() + '">✦</span></div><p class="profile-nickname"' + (S.apelido ? '' : ' hidden') + '>@' + esc(S.apelido) + '</p><p class="profile-bio">' + (S.bio ? esc(S.bio).replace(/\n/g, '<br>') : '<span>Adicione uma bio para contar um pouco sobre você.</span>') + '</p></div></header>';
    h += '<section class="pad profile-editor"><div class="section-h"><h2 class="title-md">Sobre você</h2><span class="small muted">Personalize seu perfil</span></div><label class="profile-field"><span>Apelido</span><input id="apelido" value="' + esc(S.apelido) + '" maxlength="24" placeholder="Como quer ser chamado?" autocomplete="off"></label><label class="profile-field"><span>Bio</span><textarea id="bio" maxlength="160" rows="3" placeholder="Conte um pouco sobre você...">' + esc(S.bio) + '</textarea><small><span id="bioCount">' + S.bio.length + '</span>/160</small></label><label class="profile-field"><span>Nota temporária</span><input id="nota" value="' + esc(S.nota) + '" maxlength="32" placeholder="Ex.: estudando HTML hoje ✨" autocomplete="off"><small>Aparece ao lado da sua foto.</small></label></section>';
    h += '<div class="pad"><button class="btn soft" data-act="abrirApostila">Abrir Apostila de Python e HTML</button></div>';
    h += '<div class="pad"><div class="card level"><div class="row"><span>Nível ' + nivel() + '</span><span class="muted">' + xpNivel + '/100 pontos</span></div>' + bar(xpNivel) + '<span class="small muted">Faltam ' + (100 - xpNivel) + ' pontos para o nível ' + (nivel() + 1) + '.</span></div></div>';
    h += '<div class="pad grid2"><div class="stat">' + ic('flame') + '<div><b>' + S.streak + '</b><span>sequência atual</span></div></div><div class="stat">' + ic('calendar') + '<div><b>' + S.diasEstudo + '</b><span>dias estudados</span></div></div><div class="stat">' + ic('bolt') + '<div><b>' + S.xp + '</b><span>pontos</span></div></div><div class="stat">' + ic('check') + '<div><b>' + concl + '</b><span>lições concluídas</span></div></div></div>';
    h += '<div class="pad list"><h2 class="title-md">Progresso por disciplina</h2>';
    DISC.forEach(function (d) { var t = totais(d); h += '<div class="disc discipline-card" data-discipline="' + esc(d.id) + '" style="cursor:default"><span class="badge-ic">' + ic(d.icone) + '</span><span style="min-width:0"><span class="name">' + esc(d.nome) + '</span>' + bar(t.pct) + '</span><span class="pct">' + t.pct + '%</span></div>'; });
    h += '</div><div class="pad list"><div class="section-h"><div><span class="eyebrow">SUAS VITÓRIAS</span><h2 class="title-md">Conquistas</h2></div><span class="small muted">' + ganhas.length + ' de ' + MEDALHAS.length + '</span></div>' + (!ganhas.length ? '<p class="empty-copy">Complete uma lição para desbloquear seu primeiro emblema. Cada passo conta! ✨</p>' : '') + '<div class="badges">';
    MEDALHAS.forEach(function (m) { var on = ganhas.indexOf(m.id) >= 0; h += '<div class="medal' + (on ? '' : ' off') + '" title="' + esc(m.desc) + '"><span class="m">' + ic(on ? m.icone : 'lock') + '</span><b>' + esc(m.nome) + '</b></div>'; });
    h += '</div></div>';
    h += '<div class="pad list"><h2 class="title-md">Configurações</h2><div class="settings">' +
      '<div class="setrow"><span class="l">Lembrete diário<small>Um aviso gentil para estudar</small></span><button class="switch" role="switch" aria-checked="' + c.lembrete + '" aria-label="Lembrete diário" data-act="lembrete"></button></div>' +
      '<div class="setrow"><span class="l">Meta diária<small>Lições por dia</small></span><div class="mini-seg">' + [1, 2, 3].map(function (n) { return '<button class="' + (c.meta === n ? 'on' : '') + '" data-act="meta" data-n="' + n + '">' + n + '</button>'; }).join('') + '</div></div>' +
      '<div class="setrow"><span class="l">Aparência</span><div class="mini-seg">' + [['auto', 'Auto'], ['claro', 'Claro'], ['escuro', 'Escuro']].map(function (x) { return '<button class="' + (c.tema === x[0] ? 'on' : '') + '" data-act="tema" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div></div>' +
      '<div class="setrow"><span class="l">Visual da plataforma<small>Compare iPhone e Android</small></span><div class="mini-seg">' + [['ios', 'iOS'], ['android', 'Android']].map(function (x) { return '<button class="' + (c.plataforma === x[0] ? 'on' : '') + '" data-act="plat" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div></div>' +
      '</div></div>';
    h += '<div class="pad profile-release-area"><details class="release-notes"><summary><span>✨</span><span><strong>Novidades do app</strong><small>Veja o que mudou nesta versão</small></span></summary><div class="release-notes-body"><span class="release-version">Versão 1.3.0</span><p>Apostila ampliada com 5 capítulos avançados novos de HTML e 5 de Python, cada um ligado a uma lição prática e a um visual novo do Bitinho. As lições ganharam exercícios para prever a saída do código e encontrar correções, além de múltipla escolha, lacunas, ordenação e desafios. As respostas continuam acompanhadas de gabarito e explicação.</p></div></details><button class="linkbtn" data-act="sairConta">Sair da conta</button><button class="linkbtn" data-act="reiniciar">Reiniciar dados de demonstração</button><p class="foot-note">Protótipo com conteúdo de exemplo. Seu progresso fica salvo neste aparelho.</p><p class="profile-version" aria-label="Versão do app">v1.3.0</p></div>'
    return h;
  }

  function telaAcessoriosBitinho() {
    sincronizarSkinsCapitulos();
    var desbloqueadas = SKINS_BITINHO.filter(function (s) { return S.skinsBitinho[s.id]; }).length;
    var h = '<section class="pad bitinho-showcase"><div class="bitinho-preview-orbit"><span class="orbit-star">✦</span>' + mascote('feliz', 104, S.skinEquipada) + '</div><div><span class="eyebrow">SEU COMPANHEIRO DE ESTUDO</span><h2>' + esc(skinPorId(S.skinEquipada).nome) + '</h2><p>Desbloqueie looks estudando e complete desafios especiais.</p></div><span class="bitinho-collection-count">' + desbloqueadas + '<small>/' + SKINS_BITINHO.length + ' looks</small></span></section>';
    h += '<div class="pad bitinho-wardrobe-head"><div><span class="eyebrow">RECOMPENSAS DA APOSTILA</span><h2 class="title-md">Roupinhas por capítulo</h2></div><span class="small muted">1 visual novo a cada etapa</span></div><section class="pad skin-grid">';
    SKINS_BITINHO.filter(function (s) { return !s.exclusiva; }).forEach(function (s) {
      var on = !!S.skinsBitinho[s.id], equipped = S.skinEquipada === s.id;
      var skinPython = s.id.indexOf('pycap') === 0;
      var numeroCapitulo = skinPython ? s.capitulo - 10 : s.capitulo;
      var faixaCapitulo = numeroCapitulo > 10 ? 'avançado' : numeroCapitulo > 5 ? 'intermediário' : 'básico';
      var linguagemCapitulo = skinPython ? 'Python' : 'HTML';
      var unlock = s.capitulo ? 'Conclua o capítulo ' + numeroCapitulo + ' de ' + linguagemCapitulo + ' · ' + faixaCapitulo : 'Disponível desde o início';
      var erro = skinErroId === s.id && !on ? '<div class="skin-unowned-error" role="alert"><strong>Você não possui essa skin.</strong><span>Para conseguir: ' + esc(unlock) + '.</span></div>' : '';
      h += '<article class="skin-card' + (on ? ' unlocked' : ' locked') + (equipped ? ' equipped' : '') + '"><div class="skin-card-art' + (on ? '' : ' is-locked') + '">' + mascote('feliz', 62, s.id) + (on ? '' : '<span class="skin-lock">' + ic('lock') + '</span>') + '</div><div class="skin-card-copy"><strong>' + esc(s.nome) + '</strong><small>' + (on ? (equipped ? 'Em uso no Bitinho' : 'Visual desbloqueado') : esc(unlock)) + '</small></div>' + erro + (on ? '<button class="skin-equip' + (equipped ? ' on' : '') + '" data-act="skinEquipar" data-id="' + s.id + '"' + (equipped ? ' disabled' : '') + '>' + (equipped ? 'Em uso ✓' : 'Usar visual') + '</button>' : '<button class="skin-equip skin-locked-action" data-act="skinEquipar" data-id="' + s.id + '">' + ic('lock') + ' Ver como desbloquear</button>') + '</article>';
    });
    h += '</section><div class="pad bitinho-wardrobe-head exclusive-wardrobe-title"><div><span class="eyebrow">PRÊMIOS DOS DESAFIOS</span><h2 class="title-md">Looks exclusivos</h2></div><span class="small muted">Só com os exercícios especiais</span></div><section class="pad skin-grid">';
    SKINS_BITINHO.filter(function (s) { return s.exclusiva; }).forEach(function (s) {
      var on = !!S.skinsBitinho[s.id], equipped = S.skinEquipada === s.id;
      var desafioPremio = DESAFIOS_SKIN.find(function (d) { return d.id === s.desafio; });
      var comoGanhar = desafioPremio ? 'complete o desafio “' + desafioPremio.titulo + '” na aba Desafios do Bitinho' : 'complete os exercícios especiais na aba Desafios do Bitinho';
      var erroPremio = skinErroId === s.id && !on ? '<div class="skin-unowned-error" role="alert"><strong>Você não possui essa skin.</strong><span>Para conseguir: ' + esc(comoGanhar) + '.</span></div>' : '';
      h += '<article class="skin-card exclusive-skin' + (on ? ' unlocked' : ' locked') + (equipped ? ' equipped' : '') + '"><div class="skin-card-art' + (on ? '' : ' is-locked') + '">' + mascote('feliz', 62, s.id) + (on ? '' : '<span class="skin-lock">' + ic('lock') + '</span>') + '</div><div class="skin-card-copy"><strong>' + esc(s.nome) + '</strong><small>' + (on ? (equipped ? 'Em uso no Bitinho' : 'Conquistado no desafio') : 'Resolva o desafio exclusivo') + '</small></div>' + erroPremio + (on ? '<button class="skin-equip' + (equipped ? ' on' : '') + '" data-act="skinEquipar" data-id="' + s.id + '"' + (equipped ? ' disabled' : '') + '>' + (equipped ? 'Em uso ✓' : 'Usar visual') + '</button>' : '<button class="skin-equip skin-locked-action" data-act="skinEquipar" data-id="' + s.id + '">' + ic('lock') + ' Ver como desbloquear</button>') + '</article>';
    });
    return h + '</section>';
  }
  function telaDesafiosSkin() {
    var feitos = DESAFIOS_SKIN.filter(function (d) { return S.desafiosBitinho[d.id]; }).length;
    var atual = DESAFIOS_SKIN.find(function (d) { return d.id === desafioSkinAtual; });
    if (!atual || (S.desafiosBitinho[atual.id] && !(feedbackSkin && feedbackSkin.id === atual.id))) atual = DESAFIOS_SKIN.find(function (d) { return !S.desafiosBitinho[d.id]; });
    var h = '<section class="pad skin-quest-intro"><span class="quest-sparkle">✦</span><span class="eyebrow">MISSÕES SECRETAS DO BITINHO</span><h2 class="title-lg">Exercícios valendo skins</h2><p>Responda um desafio de cada vez. Acertou? O Bitinho ganha um visual que só existe nesta aba.</p><div class="quest-progress"><span>' + feitos + ' de ' + DESAFIOS_SKIN.length + ' skins conquistadas</span><b>' + Math.round(feitos / DESAFIOS_SKIN.length * 100) + '%</b></div>' + bar(Math.round(feitos / DESAFIOS_SKIN.length * 100)) + '</section>';
    if (!atual) return h + '<section class="pad quest-complete"><div>🏆</div><h3>Você conquistou todos os looks secretos!</h3><p>O Bitinho está orgulhoso da sua dedicação. Volte ao guarda-roupa para equipar sua coleção.</p><button class="btn primary" data-act="bitinhoSecao" data-v="acessorios">Ver meus acessórios</button></section>';
    var premio = skinPorId('bonus_' + atual.id), sel = respostaSkinSel;
    var foiResolvido = !!S.desafiosBitinho[atual.id], mostrarAcerto = feedbackSkin && feedbackSkin.id === atual.id && feedbackSkin.correta;
    h += '<section class="pad"><article class="skin-quest-card"><div class="skin-quest-top"><span class="quest-number">DESAFIO ' + String(feitos + (foiResolvido ? 0 : 1)).padStart(2, '0') + '</span><span class="quest-reward">' + premio.emoji + ' Skin exclusiva</span></div><h3>' + esc(atual.titulo) + '</h3><p class="skin-question">' + esc(atual.pergunta) + '</p><div class="skin-options">';
    atual.opcoes.forEach(function (op, n) { h += '<button class="skin-option' + (sel === n ? ' selected' : '') + '" data-act="skinResposta" data-v="' + n + '"' + (foiResolvido ? ' disabled' : '') + '><span>' + String.fromCharCode(65 + n) + '</span><code>' + esc(op) + '</code>' + (foiResolvido && n === atual.certa ? '<b>✓</b>' : '') + '</button>'; });
    h += '</div>';
    if (feedbackSkin && feedbackSkin.id === atual.id && !feedbackSkin.correta) h += '<div class="skin-feedback wrong"><strong>Quase! Tente mais uma vez.</strong><span>Dica: ' + esc(atual.dica) + '</span></div>';
    if (mostrarAcerto || foiResolvido) h += '<div class="skin-feedback right"><strong>Resposta certa! ' + premio.emoji + ' ' + esc(premio.nome) + ' desbloqueada!</strong><span>' + esc(atual.explicacao) + '</span></div>';
    if (foiResolvido) h += '<button class="btn primary skin-next" data-act="skinProximo">Próximo desafio ' + ic('chevL') + '</button>';
    else h += '<button class="btn primary skin-check" data-act="skinConferir"' + (sel === null ? ' disabled' : '') + '>Conferir resposta ' + ic('check') + '</button><p class="skin-tries-note">Pode tentar de novo sem perder pontos. A explicação aparece depois de acertar.</p>';
    return h + '</article></section><div class="pad skin-quest-foot">Cada resposta certa libera uma skin exclusiva para equipar no Bitinho.</div>';
  }
  function telaBitinho() {
    var feitos = DESAFIOS_SKIN.filter(function (d) { return S.desafiosBitinho[d.id]; }).length;
    var h = '<header class="pad bitinho-page-head"><span class="eyebrow">SEU MASCOTE, SEU ESTILO</span><h1 class="title-xl">Cantinho do Bitinho</h1><p>Vista o Bitinho e conquiste visuais especiais estudando.</p></header>';
    h += '<div class="pad bitinho-sections" role="tablist" aria-label="Seções do Bitinho"><button role="tab" aria-selected="' + (secaoBitinho === 'acessorios') + '" class="' + (secaoBitinho === 'acessorios' ? 'on' : '') + '" data-act="bitinhoSecao" data-v="acessorios">' + ic('star') + 'Acessórios</button><button role="tab" aria-selected="' + (secaoBitinho === 'desafios') + '" class="' + (secaoBitinho === 'desafios' ? 'on' : '') + '" data-act="bitinhoSecao" data-v="desafios">' + ic('target') + 'Desafios <span>' + feitos + '/' + DESAFIOS_SKIN.length + '</span></button></div>';
    return h + (secaoBitinho === 'desafios' ? telaDesafiosSkin() : telaAcessoriosBitinho());
  }

  function abas() {
    var itens = [['inicio', 'Início', 'home'], ['disciplinas', 'Disciplinas', 'grid'], ['apostila', 'Apostila', 'book'], ['bitinho', 'Bitinho', 'sparkle'], ['perfil', 'Perfil', 'user']];
    return '<nav class="tabbar" aria-label="Navegação principal"><div class="tabbar-in pad">' + itens.map(function (i) {
      return '<button class="tab' + (ui.tab === i[0] ? ' on' : '') + '" data-act="tab" data-t="' + i[0] + '"' + (ui.tab === i[0] ? ' aria-current="page"' : '') + '><span class="pillbg">' + ic(i[2]) + '</span>' + i[1] + '</button>';
    }).join('') + '</div></nav>';
  }

  function prepararCanvasFundo() {
    var canvas = document.createElement('canvas');
    canvas.id = 'ambientCanvas'; canvas.setAttribute('aria-hidden', 'true');
    APP.insertBefore(canvas, APP.firstChild);
    fundoInterativo.canvas = canvas; fundoInterativo.ctx = canvas.getContext('2d');
    fundoInterativo.movimentoReduzido = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    redimensionarCanvasFundo();
    if (!fundoInterativo.eventosLigados) {
      APP.addEventListener('pointermove', function (e) {
        var r = APP.getBoundingClientRect();
        fundoInterativo.ponteiro.x = e.clientX - r.left; fundoInterativo.ponteiro.y = e.clientY - r.top;
        pedirDesenhoFundo();
      });
      APP.addEventListener('pointerleave', function () { fundoInterativo.ponteiro.x = -1000; fundoInterativo.ponteiro.y = -1000; pedirDesenhoFundo(); });
      APP.addEventListener('pointerdown', function (e) {
        if (e.target.closest('button, input, textarea, select, .tabbar')) return;
        var r = APP.getBoundingClientRect();
        fundoInterativo.ondas.push({ x: e.clientX - r.left, y: e.clientY - r.top, raio: 4, vida: 1 });
        pedirDesenhoFundo();
      });
      window.addEventListener('resize', function () { redimensionarCanvasFundo(); pedirDesenhoFundo(); });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden && fundoInterativo.quadro) { cancelAnimationFrame(fundoInterativo.quadro); fundoInterativo.quadro = 0; }
        else pedirDesenhoFundo();
      });
      fundoInterativo.eventosLigados = true;
    }
    pedirDesenhoFundo();
  }
  function redimensionarCanvasFundo() {
    var f = fundoInterativo, canvas = f.canvas;
    if (!canvas || !f.ctx) return;
    var largura = APP.clientWidth, altura = APP.clientHeight, escala = Math.min(window.devicePixelRatio || 1, 1.5);
    if (!largura || !altura) return;
    if (f.largura && f.altura && f.pontos.length) f.pontos.forEach(function (p) { p.x *= largura / f.largura; p.y *= altura / f.altura; });
    f.largura = largura; f.altura = altura; f.escala = escala;
    canvas.width = Math.round(largura * escala); canvas.height = Math.round(altura * escala);
    canvas.style.width = largura + 'px'; canvas.style.height = altura + 'px';
    f.ctx.setTransform(escala, 0, 0, escala, 0, 0);
    if (!f.pontos.length) {
      var sinais = ['</>', '{ }', '01', '[]'];
      for (var i = 0; i < 22; i++) f.pontos.push({ x: Math.random() * largura, y: Math.random() * altura, vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45, raio: 1.2 + Math.random() * 1.1, sinal: i % 5 === 0 ? sinais[Math.floor(Math.random() * sinais.length)] : '' });
    }
  }
  function pedirDesenhoFundo() {
    var f = fundoInterativo;
    if (!f.ctx || document.hidden) return;
    if (f.movimentoReduzido) { desenharCanvasFundo(0); return; }
    if (!f.quadro) f.quadro = requestAnimationFrame(desenharCanvasFundo);
  }
  function desenharCanvasFundo(tempo) {
    var f = fundoInterativo, ctx = f.ctx;
    f.quadro = 0;
    if (!ctx) return;
    if (!f.movimentoReduzido && tempo - f.ultimoDesenho < 32) { f.quadro = requestAnimationFrame(desenharCanvasFundo); return; }
    f.ultimoDesenho = tempo;
    ctx.clearRect(0, 0, f.largura, f.altura);
    var raiz = document.documentElement;
    var temaClaro = raiz.dataset.theme === 'light' || (raiz.dataset.theme !== 'dark' && !(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches));
    var linhaBase = temaClaro ? 'rgba(103,67,190,' : 'rgba(177,151,255,';
    var pontoCor = temaClaro ? 'rgba(103,67,190,.62)' : 'rgba(177,151,255,.48)';
    var codigoCor = temaClaro ? 'rgba(91,55,175,.52)' : 'rgba(177,151,255,.3)';
    var px = f.ponteiro.x, py = f.ponteiro.y;
    f.pontos.forEach(function (p) {
      if (!f.movimentoReduzido) { p.x += p.vx; p.y += p.vy; }
      if (p.x < -8) p.x = f.largura + 8; else if (p.x > f.largura + 8) p.x = -8;
      if (p.y < -8) p.y = f.altura + 8; else if (p.y > f.altura + 8) p.y = -8;
      var dx = p.x - px, dy = p.y - py, d = Math.sqrt(dx * dx + dy * dy);
      if (d > 0 && d < 125) { var empurrao = (125 - d) * .035; p.x += dx / d * empurrao; p.y += dy / d * empurrao; }
    });
    for (var i = 0; i < f.pontos.length; i++) for (var j = i + 1; j < f.pontos.length; j++) {
      var a = f.pontos[i], b = f.pontos[j], ddx = a.x - b.x, ddy = a.y - b.y, dist = Math.sqrt(ddx * ddx + ddy * ddy);
      if (dist < 158) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.strokeStyle = linhaBase + ((1 - dist / 158) * (temaClaro ? .34 : .3)) + ')'; ctx.lineWidth = 1.35; ctx.stroke(); }
    }
    f.pontos.forEach(function (p) {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.raio + .25, 0, Math.PI * 2); ctx.fillStyle = pontoCor; ctx.fill();
      if (p.sinal) { ctx.font = '700 10px ui-monospace, monospace'; ctx.fillStyle = codigoCor; ctx.fillText(p.sinal, p.x + 7, p.y - 5); }
    });
    f.ondas = f.ondas.filter(function (o) {
      ctx.beginPath(); ctx.arc(o.x, o.y, o.raio, 0, Math.PI * 2); ctx.strokeStyle = linhaBase + (o.vida * (temaClaro ? .62 : .52)) + ')'; ctx.lineWidth = 2; ctx.stroke();
      if (!f.movimentoReduzido) { o.raio += 3; o.vida -= .035; }
      return o.vida > 0;
    });
    if (!f.movimentoReduzido) f.quadro = requestAnimationFrame(desenharCanvasFundo);
  }

  function agendarReacaoBitinho() {
    if (reacaoBitinhoTimer) clearTimeout(reacaoBitinhoTimer);
    if (ui.screen !== 'inicio' || !document.querySelector('.home-mascot')) return;
    reacaoBitinhoTimer = setTimeout(function () { animarBitinho(false); }, 7500 + Math.random() * 7000);
  }
  function animarBitinho(secreto) {
    var botao = document.querySelector('.home-mascot');
    if (!botao) return;
    if (reacaoBitinhoTimer) clearTimeout(reacaoBitinhoTimer);
    if (reacaoBitinhoLimpeza) clearTimeout(reacaoBitinhoLimpeza);
    botao.classList.remove('secret', 'reaction'); botao.removeAttribute('data-reaction');
    void botao.offsetWidth;
    if (secreto) botao.classList.add('secret');
    var reacoes = [
      { tipo: 'hop', fala: 'Eba! Bora aprender? 🚀' },
      { tipo: 'wiggle', fala: 'Oi, oi! 👋' },
      { tipo: 'tilt', fala: 'Hmm... curioso! 🤔' },
      { tipo: 'wave', fala: 'Um aceno pra você! ✨' },
      { tipo: 'spin', fala: 'Uau, que energia! 💫' },
      { tipo: 'bounce', fala: 'Subindo de nível! 📈' },
      { tipo: 'shy', fala: 'Opa, você me viu! 🙈' },
      { tipo: 'dance', fala: 'Hora da dancinha! 🎵' },
      { tipo: 'stretch', fala: 'Alongando antes de estudar! 💪' },
      { tipo: 'celebrate', fala: 'Você está arrasando! 🎉' }
    ];
    var reacao = reacoes[Math.floor(Math.random() * reacoes.length)];
    if (!secreto) botao.dataset.reaction = reacao.tipo;
    var balão = botao.querySelector('.mascot-reaction-bubble');
    if (balão) { balão.textContent = secreto ? 'Segredo descoberto! ✨' : reacao.fala; balão.classList.add('visible'); }
    reacaoBitinhoLimpeza = setTimeout(function () {
      botao.classList.remove('secret'); botao.removeAttribute('data-reaction');
      if (balão) { balão.classList.remove('visible'); balão.textContent = ''; }
      agendarReacaoBitinho();
    }, secreto ? 1900 : 1450);
  }

  /* ---------- Render ---------- */
  function aplicarConfig() {
    var c = S.config, r = document.documentElement;
    if (c.tema === 'claro') r.setAttribute('data-theme', 'light'); else if (c.tema === 'escuro') r.setAttribute('data-theme', 'dark'); else r.removeAttribute('data-theme');
  }
  function render(anim) {
    if (reacaoBitinhoTimer) clearTimeout(reacaoBitinhoTimer);
    if (reacaoBitinhoLimpeza) clearTimeout(reacaoBitinhoLimpeza);
    aplicarConfig();
    var old = document.getElementById('screen'), topo = old && !anim ? (old.querySelector('.l-body') || old).scrollTop : 0;
    if (old) Array.prototype.forEach.call(old.querySelectorAll('.mindmap-node'), function (no) { if (no._mapTypingTimer) clearInterval(no._mapTypingTimer); });
    var corpo, cls = 'screen', semAbas = false;
    ui.keepAnim = !!anim;
    switch (ui.screen) {
      case 'disciplinas': corpo = telaDisciplinas(); break;
      case 'trilha': corpo = telaTrilha(); break;
      case 'perfil': corpo = telaPerfil(); break;
      case 'bitinho': corpo = telaBitinho(); break;
      case 'apostila': corpo = telaApostila(); break;
      case 'licao': corpo = telaLicao(); cls += ' lesson'; semAbas = true; break;
      case 'resultado': corpo = telaResultado(); cls += ' result'; semAbas = true; break;
      default: corpo = telaInicio();
    }
    ui.keepAnim = !!anim;
    APP.className = S.config.plataforma;
    APP.innerHTML = '<div class="' + cls + (anim ? ' enter-' + anim : '') + '" id="screen">' + corpo + '</div>' + (semAbas ? '' : abas());
    prepararCanvasFundo();
    if (ui.screen === 'inicio') agendarReacaoBitinho();
    if (ui.screen === 'apostila' && temaApostila) {
      var chipOn = APP.querySelector('.ap-chip.on'), chipBox = chipOn && chipOn.parentNode; if (chipBox) chipBox.scrollLeft = chipOn.offsetLeft - chipBox.clientWidth / 2 + chipOn.offsetWidth / 2;
      var mapaNos = APP.querySelectorAll('.mindmap-node');
      function escreverCodigoMapa(no) {
        var fonte = no.querySelector('.map-code-source'), saida = no.querySelector('.map-code-output'), estadoCodigo = no.querySelector('.map-code-status');
        if (!fonte || !saida || !estadoCodigo) return;
        if (no._mapTypingTimer) { clearInterval(no._mapTypingTimer); no._mapTypingTimer = null; }
        var codigoCompleto = fonte.textContent, posicao = 0;
        saida.textContent = '';
        no.classList.add('typing');
        estadoCodigo.textContent = 'Escrevendo código...';
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          saida.textContent = codigoCompleto; no.classList.remove('typing'); estadoCodigo.textContent = 'Código pronto'; return;
        }
        no._mapTypingTimer = setInterval(function () {
          posicao = Math.min(posicao + 2, codigoCompleto.length);
          saida.textContent = codigoCompleto.slice(0, posicao);
          if (posicao >= codigoCompleto.length) {
            clearInterval(no._mapTypingTimer); no._mapTypingTimer = null;
            no.classList.remove('typing'); estadoCodigo.textContent = 'Código pronto · tópico ' + (Number(no.dataset.mapNode) + 1);
          }
        }, 13);
      }
      Array.prototype.forEach.call(mapaNos, function (no) {
        no.addEventListener('toggle', function () {
          if (no.open) escreverCodigoMapa(no);
          else { if (no._mapTypingTimer) clearInterval(no._mapTypingTimer); no._mapTypingTimer = null; no.classList.remove('typing'); }
        });
        if (no.open) escreverCodigoMapa(no);
      });
    }
    if (!anim && topo) { var el = document.getElementById('screen'); (el.querySelector('.l-body') || el).scrollTop = topo; }
    if (ui.screen === 'licao') { ui.lesson.prevPct = pctLicao(); }
    var ta = document.getElementById('resposta');
    if (ta) ta.addEventListener('input', function () { ui.lesson.texto = ta.value; var b = document.querySelector('[data-act="conferir"]'); if (b) b.disabled = !respostaCompleta(); });
    var nome = document.getElementById('nome');
    if (nome) nome.addEventListener('input', function () { S.nome = nome.value; salvar(); });
    if (nome) nome.addEventListener('keydown', function (e) { if (e.key === 'Enter') nome.blur(); });
    ['apelido', 'bio', 'nota'].forEach(function (id) { var field = document.getElementById(id); if (!field) return; field.addEventListener('input', function () { S[id] = field.value; salvar(); if (id === 'bio') { var count = document.getElementById('bioCount'), bio = document.querySelector('.profile-bio'); if (count) count.textContent = field.value.length; if (bio) bio.innerHTML = field.value ? esc(field.value).replace(/\n/g, '<br>') : '<span>Adicione uma bio para contar um pouco sobre você.</span>'; } else { var preview = document.querySelector(id === 'nota' ? '.profile-note-bubble' : '.profile-nickname'); if (preview) { preview.textContent = id === 'apelido' ? (field.value ? '@' + field.value : '') : field.value; preview.hidden = !field.value; } } }); });
    var foto=document.getElementById('fotoPerfil'); if(foto) foto.addEventListener('change',function(){var f=foto.files&&foto.files[0];if(!f)return;if(f.size>1500000){toast('Escolha uma imagem de até 1,5 MB.');return;}var rd=new FileReader();rd.onload=function(){S.foto=rd.result;salvar();render(null);};rd.readAsDataURL(f);});
    var avatar3d = document.querySelector('.profile-avatar');
    if (avatar3d) {
      var girando = false, arrastoX = 0, anguloInicial = 0, anguloAtual = 0, larguraAvatar = 190;
      avatar3d.addEventListener('pointerdown', function (e) { e.preventDefault(); girando = true; arrastoX = e.clientX; anguloInicial = anguloAtual; larguraAvatar = avatar3d.getBoundingClientRect().width || 190; avatar3d.setPointerCapture(e.pointerId); });
      avatar3d.addEventListener('pointermove', function (e) { if (!girando) return; anguloAtual = anguloInicial + ((e.clientX - arrastoX) / larguraAvatar) * 360; avatar3d.style.setProperty('--spin-deg', anguloAtual + 'deg'); });
      function pararGiro() { girando = false; }
      avatar3d.addEventListener('pointerup', pararGiro);
      avatar3d.addEventListener('pointercancel', pararGiro);
    }
  }

  /* ---------- Eventos ---------- */
  APP.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    var a = el.dataset.act, L = ui.lesson, ex;
    switch (a) {
      case 'bitinhoSurpresa': animarBitinho(true); break;
      case 'tab': ui.tab = el.dataset.t; ir(el.dataset.t, {}, 'fade'); break;
      case 'bitinhoSecao': secaoBitinho = el.dataset.v; respostaSkinSel = null; feedbackSkin = null; skinErroId = ''; if (secaoBitinho === 'desafios') desafioSkinAtual = (DESAFIOS_SKIN.find(function (d) { return !S.desafiosBitinho[d.id]; }) || DESAFIOS_SKIN[0]).id; render('fade'); break;
      case 'skinEquipar': if (S.skinsBitinho[el.dataset.id]) { S.skinEquipada = el.dataset.id; skinErroId = ''; salvar(); render(null); toast('Look equipado no Bitinho! ✨'); } else { skinErroId = el.dataset.id; render(null); } break;
      case 'skinResposta': if (!S.desafiosBitinho[desafioSkinAtual]) { respostaSkinSel = parseInt(el.dataset.v, 10); feedbackSkin = null; render(null); } break;
      case 'skinConferir':
        var desafioSkin = DESAFIOS_SKIN.find(function (d) { return d.id === desafioSkinAtual; });
        if (desafioSkin && respostaSkinSel !== null) {
          if (respostaSkinSel === desafioSkin.certa) { S.desafiosBitinho[desafioSkin.id] = true; S.skinsBitinho['bonus_' + desafioSkin.id] = true; salvar(); feedbackSkin = { id: desafioSkin.id, correta: true }; }
          else feedbackSkin = { id: desafioSkin.id, correta: false };
          render('fade');
          if (feedbackSkin.correta) toast('Skin exclusiva desbloqueada: ' + skinPorId('bonus_' + desafioSkin.id).nome + '! ✨');
        }
        break;
      case 'skinProximo':
        desafioSkinAtual = (DESAFIOS_SKIN.find(function (d) { return !S.desafiosBitinho[d.id]; }) || DESAFIOS_SKIN[0]).id;
        respostaSkinSel = null; feedbackSkin = null; render('fwd');
        break;
      case 'abrirApostila': ir('apostila', {}, 'fwd'); break;
      case 'apostilaCap': apEstado.aberto = true; apEstado.cap = Math.max(0, Math.min(capitulosApostila(temaApostila).length - 1, parseInt(el.dataset.v, 10) || 0)); S.apostilaRetomar = { lang: temaApostila, cap: apEstado.cap }; salvar(); render(null); var telaAp = document.getElementById('screen'); if (telaAp) telaAp.scrollTop = 0; break;
      case 'apostilaRetomar': apEstado.aberto = true; apEstado.cap = Math.max(0, Math.min(capitulosApostila(temaApostila).length - 1, parseInt(el.dataset.v, 10) || 0)); render(null); var telaRetomar = document.getElementById('screen'); if (telaRetomar) telaRetomar.scrollTop = 0; break;
      case 'apostilaPraticar': if (LIC[el.dataset.id]) iniciarLicao(el.dataset.id, { screen: 'apostila', params: {} }); break;
      case 'apostilaCopiar': var blocoAp = el.closest('.ap-code'), fonteAp = blocoAp && blocoAp.querySelector('.ap-code-source'); if (fonteAp) copiarTexto(fonteAp.value); break;
      case 'apostilaVoltar': if (apEstado.aberto) apEstado.aberto = false; else temaApostila = ''; render(null); var telaV = document.getElementById('screen'); if (telaV) telaV.scrollTop = 0; break;
      case 'apostilaEtapa': apEstado.etapa[el.dataset.id] = parseInt(el.dataset.e, 10); render(null); break;
      case 'apostilaNota': var nNota = parseInt(el.dataset.n, 10); apEstado.nota[el.dataset.id] = apEstado.nota[el.dataset.id] === nNota ? 0 : nNota; render(null); break;
      case 'apostilaConcluir':
        S.apostila = S.apostila || {};
        var capituloConcluido = !S.apostila[el.dataset.id], numeroSkinCapitulo = skinCapitulo(el.dataset.id), capituloPython = el.dataset.id.indexOf('python-') === 0;
        var skinCapituloId = capituloPython ? 'pycap' + (numeroSkinCapitulo - 10) : 'cap' + numeroSkinCapitulo;
        var jaTinhaSkinCapitulo = !!S.skinsBitinho[skinCapituloId];
        if (capituloConcluido) S.apostila[el.dataset.id] = 1; else delete S.apostila[el.dataset.id];
        sincronizarSkinsCapitulos(); salvar(); render(null);
        if (capituloConcluido && numeroSkinCapitulo && !jaTinhaSkinCapitulo) toast('Novo look desbloqueado: ' + skinPorId(skinCapituloId).nome + '! ✨');
        break;
      case 'apostilaTema': temaApostila = el.dataset.v; apEstado.aberto = false; render(null); break;
      case 'apostilaEscolherTecnologia': temaApostila = ''; apEstado.aberto = false; render(null); break;
      case 'apostilaToggle':
        var topico = el.closest('.apostila-topic'), painelTopico = topico && topico.querySelector('.topic-panel');
        if (topico && painelTopico) { var abrirTopico = !topico.classList.contains('open'); topico.classList.toggle('open', abrirTopico); painelTopico.classList.toggle('expanded', abrirTopico); el.setAttribute('aria-expanded', String(abrirTopico)); }
        break;
      case 'sairConta': localStorage.removeItem('bitinho-session-v1'); location.reload(); break;
      case 'disc': ir('trilha', { disc: el.dataset.id }, 'fwd'); break;
      case 'voltar': ir('disciplinas', {}, 'back'); break;
      case 'trilha': ui.trilhaSel[el.dataset.d] = el.dataset.id; render(null); break;
      case 'travada': toast('Conclua a lição anterior para liberar esta.'); break;
      case 'comecar':
        var from = el.dataset.from;
        iniciarLicao(el.dataset.id, from === 'trilha' ? { screen: 'trilha', params: { disc: el.dataset.d } } : { screen: from === 'perfil' ? 'perfil' : from === 'apostila' ? 'apostila' : 'inicio', params: {} });
        break;
      case 'sair': ir(ui.from.screen, ui.from.params, 'back'); break;
      case 'fecharResultado': ir(ui.from.screen, ui.from.params, 'back'); break;
      case 'avancar':
        L.idx++;
        if (L.idx > LIC[L.id].l.exercicios.length) finalizar();
        else { L.errosEx = 0; prepararEx(); render('fwd'); }
        break;
      case 'conferir': ex = exAtual(); if (respostaCompleta()) { conferir(); render(null); } break;
      case 'repetir':
        ex = exAtual(); var t = L.tent, texto = L.texto; prepararEx(); L.tent = t; if (ex.tipo === 'desafio') L.texto = texto; render(null); break;
      case 'opt': if (!L.fb) { L.sel = parseInt(el.dataset.i, 10); render(null); } break;
      case 'chip': if (!L.fb) { var i = L.slots.indexOf(null); if (i >= 0) { L.slots[i] = parseInt(el.dataset.i, 10); render(null); } } break;
      case 'slot': if (!L.fb) { L.slots[parseInt(el.dataset.i, 10)] = null; render(null); } break;
      case 'poe': if (!L.fb) { L.ordem.push(parseInt(el.dataset.p, 10)); render(null); } break;
      case 'desfaz': if (!L.fb) { L.ordem.splice(parseInt(el.dataset.pos, 10), 1); render(null); } break;
      case 'dica': L.hint = Math.min(2, (Number(L.hint) || 0) + 1); var ta = document.getElementById('resposta'); L.texto = ta ? ta.value : L.texto; render(null); break;
      case 'lembrete': S.config.lembrete = !S.config.lembrete; salvar(); render(null); break;
      case 'meta': S.config.meta = parseInt(el.dataset.n, 10); salvar(); render(null); break;
      case 'tema': S.config.tema = el.dataset.v; salvar(); render(null); break;
      case 'plat': S.config.plataforma = el.dataset.v; salvar(); render(null); break;
      case 'reiniciar': S = estadoDemo(); retorno = false; salvar(); ui.trilhaSel = {}; render('fade'); toast('Dados de demonstração restaurados.'); break;
    }
  });

  function telaAuth() {
    APP.innerHTML = '<main class="auth-screen"><section class="auth-brand">' + mascote('feliz',72) + '<span class="eyebrow">APRENDA UM POUQUINHO TODO DIA</span><h1 class="title-xl">Bitinho</h1><p>Programação e computador sem complicação.</p></section><form class="auth-card" id="authForm"><h2>' + (auth.mode === 'cadastro' ? 'Crie sua conta' : 'Entre no Bitinho') + '</h2>' + (auth.mode === 'cadastro' ? '<label>Seu nome<input name="nome" required maxlength="20"></label>' : '') + '<label>E-mail<input name="email" type="email" required></label><label>Senha<input name="senha" type="password" required minlength="6"></label><button class="btn primary" type="submit">' + (auth.mode === 'cadastro' ? 'Criar conta' : 'Entrar') + '</button><button class="linkbtn" id="trocarAuth" type="button">' + (auth.mode === 'cadastro' ? 'Já tenho conta · Entrar' : 'Criar uma conta') + '</button><small>Conta local: dados salvos somente neste aparelho.</small></form><footer class="auth-credit"><span>Desenvolvido por</span><picture><source srcset="assets/codexa-logo-dark.png" media="(prefers-color-scheme: dark)"><img src="assets/codexa-logo.png" alt="Codexa"></picture></footer></main>';
    document.getElementById('trocarAuth').onclick = function () { auth.mode = auth.mode === 'login' ? 'cadastro' : 'login'; telaAuth(); };
    document.getElementById('authForm').onsubmit = function (e) {
      e.preventDefault();
      var f = new FormData(e.target), email = String(f.get('email')).trim().toLowerCase(), senha = String(f.get('senha')), u = users();
      if (auth.mode === 'cadastro') {
        if (u[email]) { toast('Já existe uma conta com esse e-mail.'); return; }
        u[email] = { senha: senha, nome: String(f.get('nome')).trim() || 'Aprendiz' };
        localStorage.setItem(USERS_KEY, JSON.stringify(u)); auth.user = email; localStorage.setItem('bitinho-session-v1', email);
        S = estadoDemo(); S.nome = u[email].nome; S.xp = 0; S.streak = 0; S.melhor = 0; S.diasEstudo = 0; S.ultimoDia = ''; S.concluidas = {}; salvar();
      } else {
        if (!u[email] || u[email].senha !== senha) { toast('E-mail ou senha incorretos.'); return; }
        auth.user = email; localStorage.setItem('bitinho-session-v1', email); S = carregar();
      }
      render('fade');
    };
  }
  if(!auth.user||!users()[auth.user]){auth.user='';telaAuth();}else{S=carregar();render('fade');}
})();
