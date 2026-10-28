/* Bitinho: motor do app. O conteúdo vem de content/*.js (window.BITINHO.disciplinas). */
(function () {
  'use strict';

  var APP = document.getElementById('app');
  var DISC = ((window.BITINHO && window.BITINHO.disciplinas) || []).slice().sort(function (a, b) { return a.ordem - b.ordem; });
  var KEY = 'bitinho-v1';

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
    try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) { s = null; }
    if (!s || typeof s !== 'object' || !s.concluidas) s = estadoDemo();
    s.config = Object.assign({ tema: 'auto', plataforma: 'ios', lembrete: true, meta: 1 }, s.config || {});
    return s;
  }
  var S = carregar();
  var retorno = false;
  (function ajustarDia() {
    if (S.hojeData !== hoje()) { S.hojeData = hoje(); S.hojeQtd = 0; }
    if (S.ultimoDia && S.streak > 0 && diasEntre(S.ultimoDia, hoje()) > 2) { S.streak = 0; retorno = true; }
  })();
  function salvar() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* sem armazenamento */ } }

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
    if (tela === 'inicio' || tela === 'disciplinas' || tela === 'perfil') ui.tab = tela;
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
    var h = '<header class="top pad"><div class="stack"><span class="eyebrow">' + saudacao() + '</span><h1 class="title-xl">Olá, ' + esc(S.nome || 'Aprendiz') + '!</h1></div>' + mascote('feliz', 64) + '</header>';
    h += '<div class="chips pad"><span class="pill fire">' + ic('flame') + S.streak + (S.streak === 1 ? ' dia' : ' dias') + '</span><span class="pill bolt">' + ic('bolt') + S.xp + ' pontos</span><span class="pill">' + ic('star') + 'Nível ' + nivel() + '</span></div>';
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

  function telaPerfil() {
    var xpNivel = S.xp % 100, ganhas = medalhasAtuais(), c = S.config;
    var concl = Object.keys(S.concluidas).length;
    var h = '<header class="pad profile-h"><div class="avatar">' + mascote('feliz', 56) + '</div><div style="min-width:0"><span class="eyebrow">Seu perfil</span><input class="nameinput" id="nome" value="' + esc(S.nome) + '" maxlength="20" aria-label="Seu nome" autocomplete="off"></div></header>';
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
    h += '<div class="pad" style="display:flex;flex-direction:column;align-items:center;gap:4px"><button class="linkbtn" data-act="reiniciar">Reiniciar dados de demonstração</button><p class="foot-note">Protótipo com conteúdo de exemplo. Seu progresso fica salvo neste aparelho.</p></div>';
    return h;
  }

  function abas() {
    var itens = [['inicio', 'Início', 'home'], ['disciplinas', 'Disciplinas', 'grid'], ['perfil', 'Perfil', 'user']];
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
    var corpo, cls = 'screen', semAbas = false;
    ui.keepAnim = !!anim;
    switch (ui.screen) {
      case 'disciplinas': corpo = telaDisciplinas(); break;
      case 'trilha': corpo = telaTrilha(); break;
      case 'perfil': corpo = telaPerfil(); break;
      case 'licao': corpo = telaLicao(); cls += ' lesson'; semAbas = true; break;
      case 'resultado': corpo = telaResultado(); cls += ' result'; semAbas = true; break;
      default: corpo = telaInicio();
    }
    ui.keepAnim = !!anim;
    APP.className = S.config.plataforma;
    APP.innerHTML = '<div class="' + cls + (anim ? ' enter-' + anim : '') + '" id="screen">' + corpo + '</div>' + (semAbas ? '' : abas());
    if (!anim && topo) { var el = document.getElementById('screen'); (el.querySelector('.l-body') || el).scrollTop = topo; }
    if (ui.screen === 'licao') { ui.lesson.prevPct = pctLicao(); }
    var ta = document.getElementById('resposta');
    if (ta) ta.addEventListener('input', function () { ui.lesson.texto = ta.value; var b = document.querySelector('[data-act="conferir"]'); if (b) b.disabled = !respostaCompleta(); });
    var nome = document.getElementById('nome');
    if (nome) nome.addEventListener('input', function () { S.nome = nome.value; salvar(); });
    if (nome) nome.addEventListener('keydown', function (e) { if (e.key === 'Enter') nome.blur(); });
  }

  /* ---------- Eventos ---------- */
  APP.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    var a = el.dataset.act, L = ui.lesson, ex;
    switch (a) {
      case 'tab': ui.tab = el.dataset.t; ir(el.dataset.t, {}, 'fade'); break;
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

  render('fade');
})();
