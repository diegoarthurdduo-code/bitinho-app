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
    ok: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
    no: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>'
  };
  function ic(n, cls) { return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + P[n] + '</svg>'; }

  /* ---------- Mascote: Bit ---------- */
  function mascote(humor, tam) {
    var olhos = humor === 'festa'
      ? '<path d="M22 31q4-6 8 0M38 31q4-6 8 0" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round"/>'
      : '<g class="blink"><ellipse cx="27" cy="31" rx="4.6" ry="5.4" fill="#fff"/><ellipse cx="41" cy="31" rx="4.6" ry="5.4" fill="#fff"/><circle cx="28" cy="32" r="2.3" fill="#1b1033"/><circle cx="42" cy="32" r="2.3" fill="#1b1033"/></g>';
    var boca = humor === 'festa'
      ? '<path d="M27 42q7 9 14 0z" fill="#1b1033"/>'
      : '<path d="M28 42q6 5 12 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>';
    return '<svg class="mascot ' + (humor === 'festa' ? '' : 'bob') + '" width="' + tam + '" height="' + tam + '" viewBox="0 0 68 68" role="img" aria-label="Bit, o mascote">' +
      '<path d="M34 12V6" stroke="#8d6bff" stroke-width="3" stroke-linecap="round"/><circle cx="34" cy="5" r="3.6" fill="#f2b01e"/>' +
      '<rect x="8" y="12" width="52" height="46" rx="18" fill="#6a3df0"/>' +
      '<rect x="8" y="12" width="52" height="46" rx="18" fill="none" stroke="#4a22c2" stroke-width="2"/>' +
      '<rect x="14" y="19" width="40" height="30" rx="13" fill="#2a1768"/>' +
      olhos + boca +
      '<circle cx="19" cy="42" r="3" fill="#ff8fc0" opacity=".55"/><circle cx="49" cy="42" r="3" fill="#ff8fc0" opacity=".55"/>' +
      '<path d="M4 34h5M59 34h5" stroke="#8d6bff" stroke-width="4" stroke-linecap="round"/></svg>';
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
    if (tela === 'inicio' || tela === 'disciplinas' || tela === 'apostila' || tela === 'perfil') ui.tab = tela;
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
    if (ex.tipo === 'multipla') return L.sel !== null;
    if (ex.tipo === 'lacunas') return L.slots.every(function (s) { return s !== null; });
    if (ex.tipo === 'ordenar') return L.ordem.length === ex.etapas.length;
    return L.texto.trim().length > 0;
  }
  function conferir() {
    var L = ui.lesson, ex = exAtual(), ok = false;
    if (ex.tipo === 'multipla') ok = L.sel === ex.certa;
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
    if (ex.tipo === 'multipla') return ex.opcoes[ex.certa];
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
    var h = '<header class="top pad"><div class="stack"><span class="eyebrow">' + saudacao() + '</span><h1 class="title-xl">Olá, ' + esc(S.nome || 'Aprendiz') + '!</h1></div>' + (S.foto ? '<img class="home-avatar" src="' + S.foto + '" alt="Sua foto de perfil">' : mascote('feliz', 64)) + '</header>';
    h += '<div class="chips pad"><span class="pill fire">' + ic('flame') + S.streak + (S.streak === 1 ? ' dia' : ' dias') + '</span><span class="pill bolt">' + ic('bolt') + S.xp + ' pontos</span><span class="pill">' + ic('star') + 'Nível ' + nivel() + '</span></div>';
    var dicasPc = ['Use Ctrl + Z para desfazer uma ação que acabou de fazer. Funciona em muitos editores e aplicativos.','Faça cópias dos arquivos importantes em outro local ou na nuvem. Assim, um problema no computador não apaga tudo.','Antes de clicar num link recebido por mensagem, confira quem enviou e para onde o endereço realmente aponta.','Use nomes claros para arquivos e pastas. Exemplo: trabalho-historia-outubro.docx.'];
    h += '<div class="pad"><div class="tip tip-card">' + ic('bulb') + '<div><strong>Dica de computador</strong><br>' + dicasPc[(new Date().getDate() + S.hojeQtd) % dicasPc.length] + '</div></div></div>';
    if (retorno) {
      h += '<div class="pad"><div class="notice">' + ic('sparkle') + '<div><strong>Que bom ter você de volta!</strong><br>Sua sequência recomeça hoje, sem pressa. Você já estudou em ' + S.diasEstudo + ' dias e isso continua valendo.</div></div></div>';
    }
    if (alvo) {
      var i = LIC[alvo], tot = totais(i.d);
      h += '<div class="pad"><div class="hero"><span class="kicker">Continue de onde parou</span><div><h2>' + esc(i.l.titulo) + '</h2><p class="meta">' + esc(i.t.nome) + ' · ' + esc(i.m.nome) + '</p></div>' +
        '<div class="tagrow"><span class="tag">' + ic('bolt') + ' +' + i.l.xp + ' pontos</span><span class="tag">' + i.l.minutos + ' min</span></div>' +
        bar(tot.pct) + '<button class="btn light" data-act="comecar" data-id="' + alvo + '" data-from="inicio">' + ic('play') + 'Continuar aprendendo</button></div></div>';
    } else {
      h += '<div class="pad"><div class="hero"><span class="kicker">Tudo concluído</span><h2>Você terminou todas as lições da demonstração!</h2><button class="btn light" data-act="tab" data-t="disciplinas">Rever as disciplinas</button></div></div>';
    }
    var pct = Math.min(100, Math.round((p / meta) * 100));
    h += '<div class="pad"><div class="card"><div class="section-h"><strong>Meta de hoje</strong><span class="small muted">' + Math.min(p, meta) + ' de ' + meta + (meta === 1 ? ' lição' : ' lições') + '</span></div><div style="height:10px"></div>' + bar(pct) + '<p class="small muted" style="margin-top:10px">' + (p >= meta ? 'Meta cumprida. Continue se quiser, o ritmo é seu.' : 'Uma lição curta já conta como um bom dia de estudo.') + '</p></div></div>';
    h += '<div class="pad list"><div class="section-h"><h2 class="title-md">Suas disciplinas</h2><button class="linkbtn" data-act="tab" data-t="disciplinas">Ver todas</button></div>';
    DISC.forEach(function (d) {
      var t = totais(d);
      h += '<button class="disc" data-act="disc" data-id="' + d.id + '"><span class="badge-ic">' + ic(d.icone) + '</span><span style="min-width:0"><span class="name">' + esc(d.nome) + '</span>' + bar(t.pct) + '</span><span class="pct">' + t.pct + '%</span></button>';
    });
    return h + '</div>';
  }

  function telaDisciplinas() {
    var h = '<header class="pad stack" style="display:flex;flex-direction:column;gap:4px"><span class="eyebrow">Escolha por onde começar</span><h1 class="title-xl">Disciplinas</h1></header><div class="pad list">';
    DISC.forEach(function (d) {
      var t = totais(d);
      h += '<button class="discbig" data-act="disc" data-id="' + d.id + '"><span class="row"><span class="badge-ic">' + ic(d.icone) + '</span><span style="min-width:0"><span class="name">' + esc(d.nome) + '</span><span class="small muted" style="display:block;margin-top:4px">' + esc(d.descricao) + '</span></span></span>' +
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
    h += L.hint ? '<div class="tip">' + ic('bulb') + '<div>' + fmt(ex.dica) + '</div></div>' : '<button class="hintbtn" data-act="dica">' + ic('bulb') + 'Preciso de uma dica</button>';
    return h;
  }

  function telaLicao() {
    var L = ui.lesson, info = LIC[L.id], l = info.l, ex = exAtual(), n = l.exercicios.length;
    var h = '<div class="l-top pad"><button class="xbtn" data-act="sair" aria-label="Sair da lição">' + ic('close') + '</button>' + bar(pctLicao(), L.prevPct) + '<span class="pts">' + ic('bolt') + l.xp + '</span></div>';
    h += '<div class="l-body pad' + (ui.keepAnim ? '' : ' static') + '">';
    if (!ex) h += viewIntro(l);
    else if (ex.tipo === 'multipla') h += viewMultipla(ex, L);
    else if (ex.tipo === 'lacunas') h += viewLacunas(ex, L);
    else if (ex.tipo === 'ordenar') h += viewOrdenar(ex, L);
    else h += viewDesafio(ex, L);
    h += '</div>';
    if (!ex) {
      h += '<div class="l-foot pad"><button class="btn primary" data-act="avancar">Entendi, vamos praticar</button></div>';
    } else if (!L.fb) {
      h += '<div class="l-foot pad"><button class="btn primary" data-act="conferir"' + (respostaCompleta() ? '' : ' disabled') + '>Verificar</button></div>';
    } else if (L.fb.ok) {
      h += '<div class="sheet ok pad" role="status"><h3>' + ic('ok') + ['Muito bem!', 'Isso mesmo!', 'Acertou!', 'Ótimo trabalho!'][(L.idx + L.tent) % 4] + '</h3><p>' + fmt(ex.porque) + '</p><button class="btn primary" data-act="avancar">' + (L.idx === n ? 'Concluir lição' : 'Continuar') + '</button></div>';
    } else {
      var revelar = L.tent >= 2;
      h += '<div class="sheet no pad" role="status"><h3>' + ic('no') + 'Quase lá!</h3><p>' + fmt(!revelar && ex.pista ? ex.pista : ex.porque) + '</p>' +
        (revelar ? '<p class="answer">Resposta: ' + esc(textoResposta(ex)) + '</p>' : '') +
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
    }
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
  function telaApostila() {
    var h = '<header class="pad apostila-head"><span class="eyebrow">Guia de estudo passo a passo</span><h1 class="title-xl">Apostila</h1><p class="muted">Aprenda com calma: escolha uma tecnologia, avance pelos capítulos e entenda cada parte do código.</p></header>';
    if (!temaApostila) {
      h += '<section class="pad apostila-chooser"><div><span class="soft-tag">ETAPA 1 DE 2</span><h2 class="title-lg" style="margin-top:8px">O que você quer estudar?</h2><p class="muted" style="margin-top:6px">Escolha uma opção. Depois você poderá selecionar o capítulo básico ou intermediário.</p></div><div class="technology-cards">' + [
        ['html', '🌐', 'HTML', 'Monte páginas com títulos, textos, imagens, links e formulários.', 'Você vai aprender a estruturar conteúdo para a web.'],
        ['python', '🐍', 'Python', 'Crie programas, faça cálculos, tome decisões e automatize tarefas.', 'Você vai aprender a dar instruções ao computador.']
      ].map(function (x) { return '<button class="technology-card ' + x[0] + '" data-act="apostilaTema" data-v="' + x[0] + '"><span class="technology-emoji">' + x[1] + '</span><span class="technology-title">' + x[2] + '</span><span class="technology-copy">' + x[3] + '</span><span class="technology-foot">' + x[4] + '</span><span class="technology-cta">Escolher ' + x[2] + ' →</span></button>'; }).join('') + '</div></section>';
      return h;
    }
    var cap = conteudoApostila[capituloApostila], lista = cap[temaApostila];
    h += '<section class="pad apostila-chooser"><div class="apostila-path"><span class="soft-tag">ETAPA 2 DE 2 · ' + (temaApostila === 'html' ? '🌐 HTML' : '🐍 PYTHON') + '</span><button class="linkbtn" data-act="apostilaEscolherTecnologia">Trocar tecnologia</button></div><div><h2 class="title-md">Agora escolha seu capítulo</h2><p class="muted" style="margin-top:5px">Você pode começar do início ou ir direto ao conteúdo intermediário.</p></div><div class="chapter-tabs" role="tablist" aria-label="Capítulos">' + [['basico', 'Capítulo 1', 'Básico', 'Fundamentos explicados desde o começo.'], ['intermediario', 'Capítulo 2', 'Intermediário', 'Combine os fundamentos e crie soluções maiores.']].map(function (x) { return '<button role="tab" aria-selected="' + (capituloApostila === x[0]) + '" class="chapter-tab' + (capituloApostila === x[0] ? ' on' : '') + '" data-act="apostilaCapitulo" data-v="' + x[0] + '"><span>' + x[1] + '</span><strong>' + x[2] + '</strong><small>' + x[3] + '</small><b class="chapter-open">' + (capituloApostila === x[0] ? 'Estudando agora' : 'Abrir capítulo →') + '</b></button>'; }).join('') + '</div><p class="chapter-summary">' + esc(cap.resumo) + '</p></section>';
    h += '<div class="pad apostila-section-title"><h2 class="title-md">Aulas do capítulo</h2><p class="muted">Toque em um tópico para abrir ou fechar. O primeiro já começa aberto para você ver como funciona.</p></div>';
    h += '<div class="pad list apostila-lessons">';
    lista.forEach(function (x, i) {
      var aberto = i === 0, painel = '<div class="topic-content"><div class="learning-goal"><strong>🎯 O que você vai aprender</strong><p>' + esc(x.objetivo) + '</p></div><div class="editor-shot"><div class="editor-top"><span>● <i>●</i> <b>●</b></span><span>' + (temaApostila === 'python' ? 'exemplo.py' : 'index.html') + '</span><span>Leia com atenção</span></div><pre>' + esc(x.codigo) + '</pre></div><section class="partes-explicadas"><h3>Vamos entender cada parte</h3><p class="muted">Abra qualquer item: você verá a explicação e um trecho do código que mostra essa ideia.</p><ol class="concept-list">' + x.partes.map(function (p, n) { var exemploParte = trechoDoConceito(p, x.codigo, temaApostila); return '<li><details class="concept-detail"><summary><b class="concept-step">' + (n + 1) + '</b><span class="concept-summary-text"><u>' + esc(p[0]) + '</u><span>' + esc(p[1]) + '</span></span><span class="concept-action"><small>Ver código</small><b aria-hidden="true">⌄</b></span></summary><div class="concept-example-panel"><div class="concept-example"><small>Exemplo de código para esta parte</small><pre><code>' + esc(exemploParte) + '</code></pre></div></div></details></li>'; }).join('') + '</ol></section><div class="apostila-result"><strong>✅ Resultado esperado</strong><p>' + esc(x.resultado) + '</p></div><div class="practice-note"><strong>✍️ Hora de praticar</strong><p>' + esc(x.pratica) + '</p></div><div class="tip"><strong>💡 Dica importante</strong><p>' + esc(x.dica) + '</p></div></div>';
      h += '<article class="apostila-topic' + (aberto ? ' open' : '') + '"><button class="topic-toggle" type="button" data-act="apostilaToggle" aria-expanded="' + aberto + '"><span class="topic-toggle-number">' + String(i + 1).padStart(2, '0') + '</span><span class="topic-toggle-text"><strong>' + esc(x.titulo.replace(/^\d+\.\s*/, '')) + '</strong><small>' + esc(x.objetivo) + '</small></span><span class="topic-toggle-icon" aria-hidden="true">⌄</span></button><div class="topic-panel' + (aberto ? ' expanded' : '') + '"><div class="topic-panel-inner">' + painel + '</div></div></article>';
    });
    h += '</div>';
    h += '<div class="pad apostila-section-title mindmap-bottom-title"><span class="soft-tag">REVISÃO VISUAL</span><h2 class="title-md">Mapa mental do capítulo</h2><p class="muted">Chegou ao final das aulas? Explore os ramos para revisar os conceitos, os mini tópicos e o código animado.</p><section class="mindmap"><div class="mindmap-hub"><span>🧠 MAPA MENTAL</span><strong>' + (temaApostila === 'html' ? 'HTML' : 'Python') + ' · ' + cap.nome + '</strong><small>Explore cinco ideias e veja um exemplo de cada uma</small></div><div class="mindmap-roots">' + mapaMentalApostila[capituloApostila][temaApostila].map(function (m, n) { var exemplo = lista[n] || lista[0]; return '<details class="mindmap-node" data-map-node="' + n + '"><summary><span class="mindmap-icon">' + m.icone + '</span><span class="mindmap-label"><strong>' + esc(m.titulo) + '</strong><small>' + esc(m.resumo) + '</small></span><span class="mindmap-plus" aria-hidden="true">+</span></summary><div class="mindmap-details"><div class="mini-topics">' + m.mini.map(function (tag) { return '<span>' + esc(tag) + '</span>'; }).join('') + '</div><p><b>💡 Um passo além:</b> ' + esc(m.extra) + '</p><div class="map-code-window"><div class="map-code-toolbar"><span class="map-code-dots"><i></i><i></i><i></i></span><strong>' + (temaApostila === 'html' ? 'index.html' : 'exemplo.py') + '</strong><span class="map-code-status" aria-live="polite">O código aparece ao abrir este ramo</span></div><pre class="map-code-screen"><code class="map-code-output"></code><i class="map-code-caret" aria-hidden="true"></i></pre><pre class="map-code-source" hidden>' + esc(exemplo.codigo) + '</pre></div><small class="map-code-caption">Exemplo do tópico: ' + esc(exemplo.titulo.replace(/^\d+\.\s*/, '')) + '</small></div></details>'; }).join('') + '</div><div class="mindmap-footer">Dica de estudo <span>Abra um ramo, veja o código surgir letra por letra e depois encontre o mesmo exemplo na aula correspondente.</span></div></section></div>';
    return h;
  }
  function telaPerfil() {
    var xpNivel = S.xp % 100, ganhas = medalhasAtuais(), c = S.config;
    var concl = Object.keys(S.concluidas).length;
    var h = '<header class="pad profile-head"><div class="profile-tools"><span class="profile-mark">BITINHO</span><label class="edit-profile">Editar foto<input id="fotoPerfil" type="file" accept="image/*" aria-label="Alterar foto de perfil"></label></div><div class="profile-hero"><label class="avatar avatar-upload profile-avatar">' + (S.foto ? '<img src="' + S.foto + '" alt="Foto de perfil">' : mascote('feliz',76)) + '</label><div class="profile-note-bubble"' + (S.nota ? '' : ' hidden') + '>' + esc(S.nota) + '</div><div class="profile-name-row"><input class="nameinput profile-name" id="nome" value="' + esc(S.nome) + '" maxlength="20" aria-label="Seu nome" autocomplete="off"><span class="profile-level-dot" title="Nível ' + nivel() + '">✦</span></div><p class="profile-nickname"' + (S.apelido ? '' : ' hidden') + '>@' + esc(S.apelido) + '</p><p class="profile-bio">' + (S.bio ? esc(S.bio).replace(/\n/g, '<br>') : '<span>Adicione uma bio para contar um pouco sobre você.</span>') + '</p></div></header>';
    h += '<section class="pad profile-editor"><div class="section-h"><h2 class="title-md">Sobre você</h2><span class="small muted">Personalize seu perfil</span></div><label class="profile-field"><span>Apelido</span><input id="apelido" value="' + esc(S.apelido) + '" maxlength="24" placeholder="Como quer ser chamado?" autocomplete="off"></label><label class="profile-field"><span>Bio</span><textarea id="bio" maxlength="160" rows="3" placeholder="Conte um pouco sobre você...">' + esc(S.bio) + '</textarea><small><span id="bioCount">' + S.bio.length + '</span>/160</small></label><label class="profile-field"><span>Nota temporária</span><input id="nota" value="' + esc(S.nota) + '" maxlength="32" placeholder="Ex.: estudando HTML hoje ✨" autocomplete="off"><small>Aparece ao lado da sua foto.</small></label></section>';
    h += '<div class="pad"><button class="btn soft" data-act="abrirApostila">Abrir Apostila de Python e HTML</button></div>';
    h += '<div class="pad"><div class="card level"><div class="row"><span>Nível ' + nivel() + '</span><span class="muted">' + xpNivel + '/100 pontos</span></div>' + bar(xpNivel) + '<span class="small muted">Faltam ' + (100 - xpNivel) + ' pontos para o nível ' + (nivel() + 1) + '.</span></div></div>';
    h += '<div class="pad grid2"><div class="stat">' + ic('flame') + '<div><b>' + S.streak + '</b><span>sequência atual</span></div></div><div class="stat">' + ic('calendar') + '<div><b>' + S.diasEstudo + '</b><span>dias estudados</span></div></div><div class="stat">' + ic('bolt') + '<div><b>' + S.xp + '</b><span>pontos</span></div></div><div class="stat">' + ic('check') + '<div><b>' + concl + '</b><span>lições concluídas</span></div></div></div>';
    h += '<div class="pad list"><h2 class="title-md">Progresso por disciplina</h2>';
    DISC.forEach(function (d) { var t = totais(d); h += '<div class="disc" style="cursor:default"><span class="badge-ic">' + ic(d.icone) + '</span><span style="min-width:0"><span class="name">' + esc(d.nome) + '</span>' + bar(t.pct) + '</span><span class="pct">' + t.pct + '%</span></div>'; });
    h += '</div><div class="pad list"><div class="section-h"><h2 class="title-md">Conquistas</h2><span class="small muted">' + ganhas.length + ' de ' + MEDALHAS.length + '</span></div><div class="badges">';
    MEDALHAS.forEach(function (m) { var on = ganhas.indexOf(m.id) >= 0; h += '<div class="medal' + (on ? '' : ' off') + '" title="' + esc(m.desc) + '"><span class="m">' + ic(on ? m.icone : 'lock') + '</span><b>' + esc(m.nome) + '</b></div>'; });
    h += '</div></div>';
    h += '<div class="pad list"><h2 class="title-md">Configurações</h2><div class="settings">' +
      '<div class="setrow"><span class="l">Lembrete diário<small>Um aviso gentil para estudar</small></span><button class="switch" role="switch" aria-checked="' + c.lembrete + '" aria-label="Lembrete diário" data-act="lembrete"></button></div>' +
      '<div class="setrow"><span class="l">Meta diária<small>Lições por dia</small></span><div class="mini-seg">' + [1, 2, 3].map(function (n) { return '<button class="' + (c.meta === n ? 'on' : '') + '" data-act="meta" data-n="' + n + '">' + n + '</button>'; }).join('') + '</div></div>' +
      '<div class="setrow"><span class="l">Aparência</span><div class="mini-seg">' + [['auto', 'Auto'], ['claro', 'Claro'], ['escuro', 'Escuro']].map(function (x) { return '<button class="' + (c.tema === x[0] ? 'on' : '') + '" data-act="tema" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div></div>' +
      '<div class="setrow"><span class="l">Visual da plataforma<small>Compare iPhone e Android</small></span><div class="mini-seg">' + [['ios', 'iOS'], ['android', 'Android']].map(function (x) { return '<button class="' + (c.plataforma === x[0] ? 'on' : '') + '" data-act="plat" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div></div>' +
      '</div></div>';
    h += '<div class="pad" style="display:flex;flex-direction:column;align-items:center;gap:4px"><button class="linkbtn" data-act="sairConta">Sair da conta</button><button class="linkbtn" data-act="reiniciar">Reiniciar dados de demonstração</button><p class="foot-note">Protótipo com conteúdo de exemplo. Seu progresso fica salvo neste aparelho.</p><p class="profile-version" aria-label="Versão do app">v1.0.0</p></div>';
    return h;
  }

  function abas() {
    var itens = [['inicio', 'Início', 'home'], ['disciplinas', 'Disciplinas', 'grid'], ['apostila', 'Apostila', 'book'], ['perfil', 'Perfil', 'user']];
    return '<nav class="tabbar" aria-label="Navegação principal"><div class="tabbar-in pad">' + itens.map(function (i) {
      return '<button class="tab' + (ui.tab === i[0] ? ' on' : '') + '" data-act="tab" data-t="' + i[0] + '"' + (ui.tab === i[0] ? ' aria-current="page"' : '') + '><span class="pillbg">' + ic(i[2]) + '</span>' + i[1] + '</button>';
    }).join('') + '</div></nav>';
  }

  /* ---------- Render ---------- */
  function aplicarConfig() {
    var c = S.config, r = document.documentElement;
    if (c.tema === 'claro') r.setAttribute('data-theme', 'light'); else if (c.tema === 'escuro') r.setAttribute('data-theme', 'dark'); else r.removeAttribute('data-theme');
  }
  function render(anim) {
    aplicarConfig();
    var old = document.getElementById('screen'), topo = old && !anim ? (old.querySelector('.l-body') || old).scrollTop : 0;
    if (old) Array.prototype.forEach.call(old.querySelectorAll('.mindmap-node'), function (no) { if (no._mapTypingTimer) clearInterval(no._mapTypingTimer); });
    var corpo, cls = 'screen', semAbas = false;
    ui.keepAnim = !!anim;
    switch (ui.screen) {
      case 'disciplinas': corpo = telaDisciplinas(); break;
      case 'trilha': corpo = telaTrilha(); break;
      case 'perfil': corpo = telaPerfil(); break;
      case 'apostila': corpo = telaApostila(); break;
      case 'licao': corpo = telaLicao(); cls += ' lesson'; semAbas = true; break;
      case 'resultado': corpo = telaResultado(); cls += ' result'; semAbas = true; break;
      default: corpo = telaInicio();
    }
    ui.keepAnim = !!anim;
    APP.className = S.config.plataforma;
    APP.innerHTML = '<div class="' + cls + (anim ? ' enter-' + anim : '') + '" id="screen">' + corpo + '</div>' + (semAbas ? '' : abas());
    if (ui.screen === 'apostila' && temaApostila) {
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
  }

  /* ---------- Eventos ---------- */
  APP.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    var a = el.dataset.act, L = ui.lesson, ex;
    switch (a) {
      case 'tab': ui.tab = el.dataset.t; ir(el.dataset.t, {}, 'fade'); break;
      case 'abrirApostila': ir('apostila', {}, 'fwd'); break;
      case 'apostilaCapitulo': capituloApostila = el.dataset.v; render(null); break;
      case 'apostilaTema': temaApostila = el.dataset.v; render(null); break;
      case 'apostilaEscolherTecnologia': temaApostila = ''; render(null); break;
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
        iniciarLicao(el.dataset.id, from === 'trilha' ? { screen: 'trilha', params: { disc: el.dataset.d } } : { screen: from === 'perfil' ? 'perfil' : 'inicio', params: {} });
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
      case 'dica': L.hint = true; var ta = document.getElementById('resposta'); L.texto = ta ? ta.value : L.texto; render(null); break;
      case 'lembrete': S.config.lembrete = !S.config.lembrete; salvar(); render(null); break;
      case 'meta': S.config.meta = parseInt(el.dataset.n, 10); salvar(); render(null); break;
      case 'tema': S.config.tema = el.dataset.v; salvar(); render(null); break;
      case 'plat': S.config.plataforma = el.dataset.v; salvar(); render(null); break;
      case 'reiniciar': S = estadoDemo(); retorno = false; salvar(); ui.trilhaSel = {}; render('fade'); toast('Dados de demonstração restaurados.'); break;
    }
  });

  function telaAuth(){APP.innerHTML='<main class="auth-screen"><section class="auth-brand">'+mascote('feliz',72)+'<span class="eyebrow">APRENDA UM POUQUINHO TODO DIA</span><h1 class="title-xl">Bitinho</h1><p>Programação e computador sem complicação.</p></section><form class="auth-card" id="authForm"><h2>'+(auth.mode==='cadastro'?'Crie sua conta':'Entre no Bitinho')+'</h2>'+(auth.mode==='cadastro'?'<label>Seu nome<input name="nome" required maxlength="20"></label>':'')+'<label>E-mail<input name="email" type="email" required></label><label>Senha<input name="senha" type="password" required minlength="6"></label><button class="btn primary" type="submit">'+(auth.mode==='cadastro'?'Criar conta':'Entrar')+'</button><button class="linkbtn" id="trocarAuth" type="button">'+(auth.mode==='cadastro'?'Já tenho conta · Entrar':'Criar uma conta')+'</button><small>Conta local: dados salvos somente neste aparelho.</small></form></main>';document.getElementById('trocarAuth').onclick=function(){auth.mode=auth.mode==='login'?'cadastro':'login';telaAuth();};document.getElementById('authForm').onsubmit=function(e){e.preventDefault();var f=new FormData(e.target),email=String(f.get('email')).trim().toLowerCase(),senha=String(f.get('senha')),u=users();if(auth.mode==='cadastro'){if(u[email]){toast('Já existe uma conta com esse e-mail.');return;}u[email]={senha:senha,nome:String(f.get('nome')).trim()||'Aprendiz'};localStorage.setItem(USERS_KEY,JSON.stringify(u));auth.user=email;localStorage.setItem('bitinho-session-v1',email);S=estadoDemo();S.nome=u[email].nome;S.xp=0;S.streak=0;S.melhor=0;S.diasEstudo=0;S.ultimoDia='';S.concluidas={};salvar();}else{if(!u[email]||u[email].senha!==senha){toast('E-mail ou senha incorretos.');return;}auth.user=email;localStorage.setItem('bitinho-session-v1',email);S=carregar();}render('fade');};}
  if(!auth.user||!users()[auth.user]){auth.user='';telaAuth();}else{S=carregar();render('fade');}
})();
