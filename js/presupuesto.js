(function () {
  'use strict';
  var D = window.PRESUPUESTO;
  if (!D) return;

  /* ---------- utilidades ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function nf(v, d) { return v.toLocaleString('es-AR', { minimumFractionDigits: d == null ? 0 : d, maximumFractionDigits: d == null ? 1 : d }); }
  function fm(v) { return '$ ' + nf(v) + ' M'; }
  function pc(v) { return nf(v, 1) + '%'; }
  function vr(a, b) { return (a / b - 1) * 100; }
  function sg(v) { return (v >= 0 ? '+' : '\u2212') + nf(Math.abs(v), 1) + '%'; }
  function el(tag, attrs, parent, ns) {
    var e = ns ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
    for (var k in attrs) { if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, attrs[k]); }
    if (parent) parent.appendChild(e);
    return e;
  }
  function sv(tag, attrs, parent) { return el(tag, attrs, parent, true); }
  function nice(m) {
    var p = Math.pow(10, Math.floor(Math.log(m) / Math.LN10)), f = m / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
  }

  var AN = [2024, 2025, 2026, 2027];
  var COL = { a1: '#1a4a7a', a2: '#2563a8', a3: '#7fa8d8', gr: '#94a3b8', gc: '#cbd5e1', na: '#d97706', ve: '#2f855a', ro: '#c53030' };
  var O = {
    24: 'Ordenanza 15/2023 (Presupuesto 2024)', 25: 'Ordenanza 13/2024 (Presupuesto 2025)',
    26: 'Ordenanza 13/2025 (Presupuesto 2026)', 27: 'Proyecto de Ordenanza Presupuesto 2027', R: 'Rendición de Cuentas 2025'
  };

  /* ---------- panel de detalle ---------- */
  var panel = el('div', { 'class': 'pp-panel', 'aria-hidden': 'true' }, document.body);
  panel.innerHTML = '<div class="pp-fondo"></div><div class="pp-hoja" role="dialog" aria-modal="true" aria-labelledby="pp-tit"><button type="button" class="pp-cerrar" aria-label="Cerrar">\u00d7</button><h3 id="pp-tit"></h3><div class="pp-cuerpo"></div></div>';
  var lastFocus = null;
  function abrir(titulo, html) {
    lastFocus = document.activeElement;
    $('#pp-tit', panel).textContent = titulo;
    $('.pp-cuerpo', panel).innerHTML = html;
    $('.pp-hoja', panel).scrollTop = 0;
    panel.classList.add('on');
    panel.setAttribute('aria-hidden', 'false');
    $('.pp-cerrar', panel).focus();
  }
  function cerrar() {
    panel.classList.remove('on');
    panel.setAttribute('aria-hidden', 'true');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  panel.addEventListener('click', function (e) {
    var c = e.target.className;
    if (typeof c === 'string' && (c.indexOf('pp-fondo') > -1 || c.indexOf('pp-cerrar') > -1)) cerrar();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrar(); });

  function tabla(rows) {
    return '<table class="pp-det">' + rows.map(function (r) { return '<tr><th>' + r[0] + '</th><td>' + r[1] + '</td></tr>'; }).join('') + '</table>';
  }
  function nota(tipo, txt) {
    return '<p class="pp-nota pp-' + tipo + '"><b>' + { dato: 'DATO', calc: 'C\u00c1LCULO', op: 'OPINI\u00d3N' }[tipo] + '</b> ' + txt + '</p>';
  }
  function fuente(t) { return '<p class="pp-fdet">Fuente: ' + t + '</p>'; }

  /* ---------- motor de gr\u00e1ficos (SVG) ---------- */
  var redraws = [];
  function chart(box, cfg) {
    var hidden = cfg.hidden || (cfg.hidden = {});
    var pctMode = !!(cfg.stack && cfg.pct);
    box.innerHTML = '';
    var leg = el('div', { 'class': 'pp-leyenda' }, box);
    cfg.series.forEach(function (s, i) {
      var b = el('button', { type: 'button', 'class': 'pp-chip' + (hidden[i] ? ' off' : ''), 'aria-pressed': hidden[i] ? 'false' : 'true' }, leg);
      b.innerHTML = '<i style="background:' + s.c + '"></i>' + esc(s.n);
      b.onclick = function () { hidden[i] = !hidden[i]; chart(box, cfg); };
    });
    if (cfg.stack && cfg.allowPct) {
      var t = el('button', { type: 'button', 'class': 'pp-chip pp-modo' }, leg);
      t.textContent = cfg.pct ? 'Ver en $' : 'Ver en %';
      t.onclick = function () { cfg.pct = !cfg.pct; chart(box, cfg); };
    }
    var W = Math.max(box.clientWidth || 320, 250), H = cfg.height || 270;
    var M = { l: pctMode ? 36 : 46, r: 8, t: 18, b: 40 };
    var nC = cfg.cats.length, vis = cfg.series.map(function (s, i) { return !hidden[i]; });
    var tot = cfg.cats.map(function (c, ci) {
      var s = 0; cfg.series.forEach(function (x, si) { if (vis[si] && x.v[ci] != null) s += x.v[ci]; }); return s;
    });
    var max;
    if (pctMode) max = 100;
    else if (cfg.stack) max = Math.max.apply(null, tot);
    else {
      var all = []; cfg.series.forEach(function (x, si) { if (vis[si]) x.v.forEach(function (n) { if (n != null) all.push(n); }); });
      max = all.length ? Math.max.apply(null, all) : 1;
    }
    if (!isFinite(max) || max <= 0) max = 1;
    var top = pctMode ? 100 : nice(max);
    function Y(v) { return H - M.b - (v / top) * (H - M.t - M.b); }
    var svg = sv('svg', { 'class': 'pp-svg', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': cfg.aria || 'Gr\u00e1fico' }, box);
    for (var i = 0; i <= 4; i++) {
      var gv = top * i / 4, gy = Y(gv);
      sv('line', { x1: M.l, x2: W - M.r, y1: gy, y2: gy, 'class': 'pp-grid' }, svg);
      var gl = sv('text', { x: M.l - 5, y: gy + 3.5, 'class': 'pp-eje', 'text-anchor': 'end' }, svg);
      gl.textContent = pctMode ? nf(gv) + '%' : nf(gv);
    }
    var band = (W - M.l - M.r) / nC;
    var k = vis.filter(Boolean).length || 1;
    var bw = cfg.stack ? Math.min(58, band * 0.64) : Math.min(36, band * 0.8 / k);
    function pick(si, ci) { if (cfg.onPick) cfg.onPick(si, ci); }
    function barra(x, y, w, h, si, ci, txt) {
      var r = sv('rect', { x: x, y: y, width: w, height: Math.max(h, 0), fill: cfg.series[si].c, rx: 2, 'class': 'pp-barra', tabindex: 0, role: 'button', 'aria-label': txt }, svg);
      sv('title', {}, r).textContent = txt;
      r.addEventListener('click', function () { pick(si, ci); });
      r.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(si, ci); } });
      return r;
    }
    cfg.cats.forEach(function (c, ci) {
      var cx = M.l + band * ci + band / 2;
      var l1 = sv('text', { x: cx, y: H - M.b + 15, 'class': 'pp-cat', 'text-anchor': 'middle' }, svg); l1.textContent = c.l;
      if (c.s) { var l2 = sv('text', { x: cx, y: H - M.b + 28, 'class': 'pp-cat2', 'text-anchor': 'middle' }, svg); l2.textContent = c.s; }
      if (cfg.stack) {
        var acc = 0;
        cfg.series.forEach(function (s, si) {
          var v = s.v[ci];
          if (!vis[si] || v == null || v === 0) return;
          var val = pctMode ? v / tot[ci] * 100 : v;
          var y1 = Y(acc + val), y0 = Y(acc), h = y0 - y1;
          barra(cx - bw / 2, y1, bw, h, si, ci, s.n + ' ' + c.l + ': ' + (cfg.fmt ? cfg.fmt(v) : nf(v)) + (pctMode ? ' (' + nf(val, 1) + '%)' : ''));
          if (h >= 15 && bw >= 34) {
            var tx = sv('text', { x: cx, y: y1 + h / 2 + 3.5, 'class': 'pp-val pp-dentro', 'text-anchor': 'middle' }, svg);
            tx.textContent = pctMode ? nf(val, 0) + '%' : nf(v, 0);
          }
          acc += val;
        });
        if (!pctMode && tot[ci] > 0) {
          var tt = sv('text', { x: cx, y: Y(tot[ci]) - 5, 'class': 'pp-val pp-total', 'text-anchor': 'middle' }, svg);
          tt.textContent = nf(tot[ci], 0);
        }
      } else {
        var j = 0;
        cfg.series.forEach(function (s, si) {
          if (!vis[si]) return;
          var v = s.v[ci];
          var x = cx - (k * bw) / 2 + j * bw; j++;
          if (v == null) return;
          barra(x + 1, Y(v), bw - 2, Y(0) - Y(v), si, ci, s.n + ' ' + c.l + ': ' + (cfg.fmt ? cfg.fmt(v) : nf(v)));
          if (bw >= 26) {
            var tv = sv('text', { x: x + bw / 2, y: Y(v) - 4, 'class': 'pp-val', 'text-anchor': 'middle' }, svg);
            tv.textContent = cfg.lab ? cfg.lab(v) : nf(v, 0);
          }
        });
      }
    });
    if (cfg.unit) { var u = el('p', { 'class': 'pp-unidad' }, box); u.textContent = cfg.unit; }
  }
  function dibujar(box, cfg) { chart(box, cfg); redraws.push(function () { chart(box, cfg); }); }
  window.PPRedibujar = function () { redraws.forEach(function (f) { f(); }); };
  var lastW = window.innerWidth, tmr;
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth; clearTimeout(tmr);
    tmr = setTimeout(function () { redraws.forEach(function (f) { f(); }); }, 180);
  });

  function hbars(box, items, onPick) {
    var max = Math.max.apply(null, items.map(function (i) { return i.v; }));
    box.innerHTML = '';
    items.forEach(function (it) {
      var b = el('button', { type: 'button', 'class': 'pp-hb' }, box);
      b.innerHTML = '<span class="pp-hb-n">' + esc(it.n) + '</span><span class="pp-hb-b"><i style="width:' + (it.v / max * 100) + '%;background:' + (it.c || COL.a2) + '"></i></span><span class="pp-hb-v">' + it.v + '</span>';
      b.onclick = function () { onPick(it); };
    });
  }

  /* ---------- 1. resumen: indicadores por a\u00f1o ---------- */
  function R(y) { return D.recursos[y]; }
  function G(y, k) { var g = D.gastos[y]; return k === 'deuda' ? g.intereses + g.amort : g[k]; }
  var KP = [
    { n: 'Presupuesto inicial', f: function (y) { return D.inicial[y]; }, fmt: fm, sub: 'Ejecutivo + Concejo', nt: 'Es el total que fija el Art. 1 de cada ordenanza. Durante el a\u00f1o se corrige: ver la secci\u00f3n "Evoluci\u00f3n".', src: 'Art. 1 de cada ordenanza' },
    { n: 'Viene de otras jurisdicciones', f: function (y) { var r = R(y); return (r.copart + r.consenso + r.auto) / D.inicial[y] * 100; }, fmt: pc, pts: 1, sub: 'coparticipaci\u00f3n, Consenso Fiscal y autom\u00f3tor', nt: 'Es lo que el municipio recibe de Naci\u00f3n y Provincia. No lo fija el municipio, por eso mide la dependencia.', src: 'C\u00e1lculo de recursos de cada ordenanza' },
    { n: 'Recursos propios', f: function (y) { return R(y).propios / D.inicial[y] * 100; }, fmt: pc, pts: 1, sub: 'tasas y otros ingresos municipales', nt: 'Tasas (abasto, higiene y seguridad, retributiva, carnets, antenas) y otros ingresos (venta de agua, alquiler de m\u00e1quinas, intereses).', src: 'C\u00e1lculo de recursos de cada ordenanza' },
    { n: 'Va a personal', f: function (y) { return G(y, 'personal') / D.inicial[y] * 100; }, fmt: pc, pts: 1, sub: 'Ejecutivo + Concejo', nt: 'Sueldos de planta permanente, temporarios, salario familiar y extraordinarios. Mir\u00e1 el detalle en la secci\u00f3n "Personal".', src: 'Clasificaci\u00f3n econ\u00f3mica y por objeto de cada ordenanza' },
    { n: 'Inversi\u00f3n', f: function (y) { return G(y, 'inversion') / D.inicial[y] * 100; }, fmt: pc, pts: 1, sub: 'bienes de capital y obras', nt: 'Maquinaria, equipos y trabajos p\u00fablicos presupuestados. Las obras con fondos de otros niveles pueden sumarse durante el a\u00f1o (Art. 6).', src: 'Clasificaci\u00f3n econ\u00f3mica de cada ordenanza' },
    { n: 'Pago de deuda', f: function (y) { return G(y, 'deuda') / D.inicial[y] * 100; }, fmt: pc, pts: 1, sub: 'amortizaci\u00f3n + intereses', nt: 'Desde 2026 aparece el pago del pr\u00e9stamo del Banco Macro de $177,3 M tomado en 2025.', src: 'Clasificaci\u00f3n econ\u00f3mica de 2026 y 2027' }
  ];
  function detSerie(k) {
    var rows = AN.map(function (y) {
      var v = k.f(y), p = y > 2024 ? k.f(y - 1) : null, d = '';
      if (p != null && p !== 0) d = ' <small>(' + (k.pts ? (v - p >= 0 ? '+' : '\u2212') + nf(Math.abs(v - p), 1) + ' pp' : sg(vr(v, p))) + ' vs ' + (y - 1) + ')</small>';
      return [String(y), '<b>' + k.fmt(v) + '</b>' + d];
    });
    return tabla(rows) + nota('calc', k.nt) + fuente(k.src);
  }
  var selY = 2027;
  function kpis() {
    var chips = $('#pp-anios'), box = $('#pp-kpis');
    if (!chips || !box) return;
    chips.innerHTML = '';
    AN.forEach(function (y) {
      var b = el('button', { type: 'button', 'class': 'pp-chip' + (y === selY ? ' sel' : ''), 'aria-pressed': y === selY ? 'true' : 'false' }, chips);
      b.textContent = y; b.onclick = function () { selY = y; kpis(); };
    });
    box.innerHTML = '';
    KP.forEach(function (k) {
      var b = el('button', { type: 'button', 'class': 'pres-card pp-tap' }, box);
      b.innerHTML = '<span class="pres-num">' + k.fmt(k.f(selY)) + '</span><span class="pres-txt">' + k.n + '</span><span class="pp-sub">' + k.sub + '</span>';
      b.onclick = function () { abrir(k.n + ' \u00b7 evoluci\u00f3n 2024-2027', detSerie(k)); };
    });
  }

  /* ---------- 2. evoluci\u00f3n: inicial, recaudado, gastado ---------- */
  var ROT = { inicial: 'Presupuesto inicial (ordenanza)', final: 'Presupuesto final autorizado', recaudado: 'Recaudado', gastado: 'Gastado (comprometido)', pagado: 'Pagado' };
  function detEvol(key, y) {
    var v = D[key][y], p = D[key][y - 1];
    var rows = [[ROT[key] + ' ' + y, '<b>' + fm(v) + '</b>']];
    if (p != null) rows.push(['Variaci\u00f3n vs ' + (y - 1), sg(vr(v, p))]);
    if (key === 'inicial' && D.recaudado[y]) rows.push(['Lo recaudado ese a\u00f1o', fm(D.recaudado[y]) + ' <small>(' + sg(vr(D.recaudado[y], v)) + ' sobre el inicial)</small>']);
    if (key === 'inicial' && D.final[y]) rows.push(['Final autorizado', fm(D.final[y]) + ' <small>(' + sg(vr(D.final[y], v)) + ')</small>']);
    if (key === 'gastado' || key === 'pagado' || key === 'recaudado') {
      if (D.final[y] && key !== 'recaudado') rows.push(['% del autorizado final', pc(v / D.final[y] * 100)]);
      if (D.final[y] && key === 'recaudado') rows.push(['% del c\u00e1lculo de recursos final', pc(v / D.final[y] * 100)]);
    }
    if (key === 'pagado') rows.push(['% de lo gastado', pc(v / D.gastado[y] * 100)]);
    if (D.inflacion[y]) rows.push(['Inflaci\u00f3n dic/dic ' + y + ' (INDEC)', pc(D.inflacion[y])]);
    if (y === 2026) rows.push(['Inflaci\u00f3n 2026', 'acumulada a septiembre ' + pc(D.inflacion2026.acumSep) + '; estimaci\u00f3n REM para el a\u00f1o ' + pc(D.inflacion2026.rem)]);
    var h = tabla(rows), n = '', src = 'Ordenanzas y balances/rendici\u00f3n del a\u00f1o.';
    if (key === 'inicial' && y === 2024) n = nota('calc', 'El presupuesto 2024 se fij\u00f3 en $360,8 M y el municipio termin\u00f3 recaudando $616,3 M. El presupuesto final autorizado de 2024 no est\u00e1 cargado todav\u00eda.');
    if (key === 'inicial' && y === 2025) n = nota('calc', 'Creci\u00f3 +$200,85 M durante el a\u00f1o: $177,35 M fueron el pr\u00e9stamo del Banco Macro y unos $23,5 M mayores recursos corrientes.');
    if (key === 'inicial' && y === 2026) n = nota('calc', 'Es solo ' + sg(vr(D.inicial[2026], D.final[2025])) + ' sobre el presupuesto final de 2025 ($1.068,5 M). Con inflaci\u00f3n cercana al 30% anual, es de esperar que se corrija durante el a\u00f1o.');
    if (key === 'inicial' && y === 2027) n = nota('calc', 'Sube ' + sg(vr(D.inicial[2027], D.inicial[2026])) + ' sobre el presupuesto inicial 2026 y ' + sg(vr(D.inicial[2027], D.final[2025])) + ' sobre el final de 2025. Es un proyecto: todav\u00eda no est\u00e1 sancionado.');
    if (key === 'recaudado' && y === 2025) n = nota('calc', 'Incluye $177,3 M del pr\u00e9stamo. Sin el pr\u00e9stamo se recaudaron $836,9 M, un ' + sg(vr(836.892, D.recaudado[2024])) + ' sobre 2024. Como referencia, la inflaci\u00f3n dic/dic de 2025 fue 31,5%.');
    if (key === 'gastado' && y === 2025) n = nota('calc', 'Incluye unos $177 M de bienes de capital financiados con el pr\u00e9stamo (coincide con la retroexcavadora del inventario). Sin eso el gasto fue de unos $882 M, un ' + sg(vr(882.2, D.gastado[2024])) + ' sobre 2024.');
    if (key === 'final') n = nota('calc', 'Parte de los $867,65 M iniciales y suma $177,35 M del pr\u00e9stamo y unos $23,5 M de mayores recursos corrientes.');
    if (y === 2023) n = nota('dato', 'Dato del Balance 2023. No se carg\u00f3 la ordenanza de presupuesto 2023.');
    if (y === 2024 && key !== 'inicial') src = 'Balance financiero del Ejercicio 2024.';
    if (y === 2025 && key !== 'inicial') src = 'Rendici\u00f3n 2025: Balance financiero (folio 25).';
    return h + n + fuente(src);
  }
  function evolucion() {
    var box = $('#ch-evol');
    if (box) dibujar(box, {
      cats: D.anios.map(function (y, i) { return { l: String(y), s: ['balance', 'ord. + balance', 'ord. + rendici\u00f3n', 'ordenanza', 'proyecto'][i] }; }),
      series: [
        { n: 'Presupuesto inicial', c: COL.a3, v: D.anios.map(function (y) { return D.inicial[y] != null ? D.inicial[y] : null; }), key: 'inicial' },
        { n: 'Recaudado', c: COL.a2, v: D.anios.map(function (y) { return D.recaudado[y] != null ? D.recaudado[y] : null; }), key: 'recaudado' },
        { n: 'Gastado', c: COL.a1, v: D.anios.map(function (y) { return D.gastado[y] != null ? D.gastado[y] : null; }), key: 'gastado' }
      ],
      unit: 'Millones de pesos corrientes. Toc\u00e1 una barra para ver el detalle.', aria: 'Presupuesto inicial, recaudado y gastado por a\u00f1o',
      onPick: function (si, ci) { var key = ['inicial', 'recaudado', 'gastado'][si]; var y = D.anios[ci]; abrir(ROT[key] + ' ' + y, detEvol(key, y)); }
    });
    var t = $('#tabla-anios');
    if (!t) return;
    var rows = ['inicial', 'final', 'recaudado', 'gastado', 'pagado'];
    var h = '<tr><th>Concepto ($ M)</th>' + D.anios.map(function (y) { return '<th>' + y + '</th>'; }).join('') + '</tr>';
    rows.forEach(function (key) {
      h += '<tr><td>' + ROT[key] + '</td>' + D.anios.map(function (y) {
        var v = D[key][y];
        return v != null ? '<td><button type="button" class="pp-celda" data-k="' + key + '" data-y="' + y + '">' + nf(v, 1) + '</button></td>' : '<td><span class="pend">\u2014</span></td>';
      }).join('') + '</tr>';
    });
    t.innerHTML = h;
    t.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.pp-celda') : null;
      if (b) abrir(ROT[b.getAttribute('data-k')] + ' ' + b.getAttribute('data-y'), detEvol(b.getAttribute('data-k'), +b.getAttribute('data-y')));
    });
  }

  /* ---------- 3. recursos ---------- */
  var RS = [
    { k: 'copart', n: 'Coparticipaci\u00f3n', c: COL.a1, d: 'Participaci\u00f3n en impuestos nacionales y provinciales. Se transfiere autom\u00e1ticamente: el municipio no la fija ni la cobra.' },
    { k: 'consenso', n: 'Consenso Fiscal', c: COL.na, d: 'Compensaci\u00f3n por el Consenso Fiscal. En 2025 la cuenta se us\u00f3 para pagar intereses y amortizaci\u00f3n del pr\u00e9stamo y cerr\u00f3 en -$4,48 M.' },
    { k: 'auto', n: 'Impuesto automotor', c: COL.gr, d: 'Parte del impuesto provincial al automotor que recibe el municipio.' },
    { k: 'propios', n: 'Recursos propios', c: COL.ve, d: 'Tasas municipales (abasto, higiene y seguridad, tasa retributiva, carnets, antenas) y otros ingresos (venta de agua, alquiler de m\u00e1quinas viales, intereses ganados, ca\u00f1ad\u00f3n).' }
  ];
  function recursos() {
    var box = $('#ch-rec'); if (!box) return;
    dibujar(box, {
      stack: true, allowPct: true, cats: AN.map(function (y) { return { l: String(y), s: fm(D.inicial[y]) }; }),
      series: RS.map(function (r) { return { n: r.n, c: r.c, v: AN.map(function (y) { return R(y)[r.k]; }) }; }),
      unit: 'Millones de pesos, presupuesto inicial. Toc\u00e1 un tramo para ver el detalle.', aria: 'Origen de los recursos por a\u00f1o',
      onPick: function (si, ci) {
        var r = RS[si], y = AN[ci], v = R(y)[r.k], p = y > 2024 ? R(y - 1)[r.k] : null;
        var rows = [[r.n + ' ' + y, '<b>' + fm(v) + '</b>'], ['% del presupuesto', pc(v / D.inicial[y] * 100)]];
        if (p != null) rows.push(['Variaci\u00f3n vs ' + (y - 1), sg(vr(v, p))]);
        var extra = '';
        if (r.k === 'propios') extra = nota('calc', 'Los recursos propios son ' + pc(v / D.inicial[y] * 100) + ' del total. Para 2027 se proyectan ' + sg(vr(R(2027).propios, R(2026).propios)) + ' sobre 2026, contra ' + sg(vr(R(2027).copart, R(2026).copart)) + ' de la coparticipaci\u00f3n.');
        if (r.k === 'copart') extra = nota('calc', 'La coparticipaci\u00f3n es ' + pc(v / D.inicial[y] * 100) + ' del presupuesto ' + y + '. En 2025 se recaudaron $776,4 M contra $830 M calculados.');
        abrir(r.n + ' ' + y, tabla(rows) + nota('dato', r.d) + extra + fuente(O[y - 2000]));
      }
    });
  }

  /* ---------- 4. gastos ---------- */
  var GS = [
    { k: 'personal', n: 'Personal', c: COL.a1, d: 'Sueldos de planta permanente, personal temporario, salario familiar y servicios extraordinarios, del Ejecutivo y del Concejo.' },
    { k: 'consumo', n: 'Bienes de consumo', c: COL.a2, d: 'Combustibles, repuestos, papeler\u00eda, materiales, productos farmac\u00e9uticos, alimentos, etc. La ordenanza informa solo el total, sin desglose.' },
    { k: 'servicios', n: 'Servicios', c: COL.a3, d: 'Electricidad y agua, transporte, comunicaciones, alquileres, conservaci\u00f3n y reparaciones, honorarios, etc. La ordenanza informa solo el total.' },
    { k: 'transf', n: 'Transferencias', c: COL.gr, d: 'Ayudas y transferencias a terceros (la memoria 2025 menciona ayudas econ\u00f3micas a personas sin recursos). No hay desglose.' },
    { k: 'credito', n: 'Cr\u00e9dito adicional', c: COL.gc, d: 'Reserva para reforzar partidas durante el a\u00f1o. La ordenanza no aclara qu\u00e9 partidas refuerza.' },
    { k: 'repr', n: 'Representaci\u00f3n', c: COL.na, d: 'Gastos de representaci\u00f3n del Ejecutivo. El Art. 8 fija un tope mensual.' },
    { k: 'deuda', n: 'Deuda', c: COL.ro, d: 'Intereses y amortizaci\u00f3n del pr\u00e9stamo del Banco Macro de $177,3 M tomado en 2025 (coincide con la retroexcavadora del inventario).' },
    { k: 'inversion', n: 'Inversi\u00f3n', c: COL.ve, d: 'Bienes de capital (maquinaria, muebles, equipos) y trabajos p\u00fablicos, del Ejecutivo y el Concejo.' }
  ];
  function gastos() {
    var box = $('#ch-gas'); if (!box) return;
    dibujar(box, {
      stack: true, allowPct: true, height: 300, cats: AN.map(function (y) { return { l: String(y), s: fm(D.inicial[y]) }; }),
      series: GS.map(function (g) { return { n: g.n, c: g.c, v: AN.map(function (y) { return G(y, g.k); }) }; }),
      unit: 'Millones de pesos, presupuesto inicial (Ejecutivo + Concejo). Toc\u00e1 un tramo para ver el detalle.', aria: 'En qu\u00e9 se gasta por a\u00f1o',
      onPick: function (si, ci) {
        var g = GS[si], y = AN[ci], v = G(y, g.k), p = y > 2024 ? G(y - 1, g.k) : null;
        var rows = [[g.n + ' ' + y, '<b>' + fm(v) + '</b>'], ['% del presupuesto', pc(v / D.inicial[y] * 100)]];
        if (p != null && p > 0) rows.push(['Variaci\u00f3n vs ' + (y - 1), sg(vr(v, p))]);
        if (g.k === 'repr') rows.push(['Tope mensual (Art. 8)', fm(D.reprTope[y]) + ' <small>= ' + fm(D.reprTope[y] * 12) + ' al a\u00f1o</small>']);
        if (g.k === 'deuda') rows.push(['Amortizaci\u00f3n / intereses', fm(D.gastos[y].amort) + ' / ' + fm(D.gastos[y].intereses)]);
        var ex = g.k === 'personal' ? nota('calc', 'Mir\u00e1 la secci\u00f3n "Personal" para ver cu\u00e1nto va a planta y a temporarios y cu\u00e1nto implica por cargo.') : '';
        abrir(g.n + ' ' + y, tabla(rows) + nota('dato', g.d) + ex + fuente(O[y - 2000]));
      }
    });
  }

  /* ---------- 5. personal ---------- */
  function Pt(y) { var e = D.personal.ejec[y], h = D.personal.hcd[y]; return e.planta + e.temp + e.sf + e.extra + h.planta + h.sf; }
  function personal() {
    var box = $('#ch-per');
    if (box) dibujar(box, {
      stack: true, cats: AN.map(function (y) { return { l: String(y), s: pc(Pt(y) / D.inicial[y] * 100) + ' del total' }; }),
      series: [
        { n: 'Ejecutivo: planta', c: COL.a1, v: AN.map(function (y) { return D.personal.ejec[y].planta; }) },
        { n: 'Ejecutivo: temporarios', c: COL.a3, v: AN.map(function (y) { return D.personal.ejec[y].temp; }) },
        { n: 'Ejecutivo: sal. familiar y extra', c: COL.gr, v: AN.map(function (y) { var e = D.personal.ejec[y]; return e.sf + e.extra; }) },
        { n: 'Concejo (HCD)', c: COL.na, v: AN.map(function (y) { var h = D.personal.hcd[y]; return h.planta + h.sf; }) }
      ],
      unit: 'Millones de pesos, presupuesto inicial. Debajo de cada a\u00f1o: qu\u00e9 porcentaje del presupuesto total es personal.', aria: 'Gasto en personal por a\u00f1o',
      onPick: function (si, ci) {
        var y = AN[ci], e = D.personal.ejec[y], h = D.personal.hcd[y];
        var rows = [['Ejecutivo: planta permanente', fm(e.planta)], ['Ejecutivo: personal temporario', fm(e.temp)], ['Ejecutivo: salario familiar', fm(e.sf)], ['Ejecutivo: servicios extraordinarios', fm(e.extra)], ['Concejo: planta permanente', fm(h.planta)], ['Concejo: salario familiar', fm(h.sf)], ['<b>Total personal</b>', '<b>' + fm(Pt(y)) + '</b>'], ['% del presupuesto total', pc(Pt(y) / D.inicial[y] * 100)]];
        if (y > 2024) rows.push(['Variaci\u00f3n del total vs ' + (y - 1), sg(vr(Pt(y), Pt(y - 1)))]);
        var ex = '';
        if (y === 2025) { var x = D.personal.ejecutado2025; ex = nota('dato', 'Ejecutado en 2025: planta $' + nf(x.planta, 1) + ' M (presupuestado 135), temporarios $' + nf(x.temp, 1) + ' M (presupuestado 120), salario familiar $' + nf(x.sf, 1) + ' M (presupuestado 16). Concejo: planta $' + nf(x.hcdPlanta, 1) + ' M y salario familiar $' + nf(x.hcdSf, 1) + ' M.'); }
        abrir('Personal ' + y, tabla(rows) + ex + fuente(O[y - 2000] + (y === 2025 ? '; ' + O.R : '')));
      }
    });
    var cb = $('#pp-cargos');
    if (cb) {
      cb.innerHTML = '<div><h4>Ejecutivo: 29 cargos</h4><div id="pp-cg-e"></div></div><div><h4>Concejo Deliberante: 6 cargos</h4><div id="pp-cg-h"></div></div>';
      var it = [{ n: 'Cargos pol\u00edticos (intendente y 5 secretarios)', v: 6, c: COL.na, tipo: 'pol' }].concat(D.cargos.planta.map(function (p) { return { n: 'Planta categor\u00eda ' + p.cat, v: p.n, c: COL.a2, tipo: 'planta', cat: p.cat }; }));
      hbars($('#pp-cg-e'), it, function (i) {
        var txt = i.tipo === 'pol' ? D.cargos.politicos.join(', ') + '.' : 'Cargos de planta permanente de categor\u00eda ' + i.cat + ' del Escalaf\u00f3n General.';
        abrir(i.n, tabla([['Cantidad de cargos', '<b>' + i.v + '</b>'], ['% de los 29 cargos', pc(i.v / 29 * 100)]]) + nota('dato', txt) + nota('dato', 'La ordenanza detalla estos 29 cargos, igual en 2024, 2025 y 2026; en 2027 la planilla escaneada est\u00e1 desalineada pero parece la misma. No informa cu\u00e1ntos temporarios hay ni sus categor\u00edas.') + fuente('Detalle de cargos individuales de las ordenanzas.'));
      });
      hbars($('#pp-cg-h'), D.cargos.hcd.map(function (c) { return { n: c.n, v: c.v, c: COL.na }; }), function (i) {
        abrir(i.n, tabla([['Cantidad de cargos', '<b>' + i.v + '</b>']]) + nota('dato', 'La planilla del Concejo lista solo estos 6 cargos pol\u00edticos, y la partida se llama "Planta permanente": $80 M en 2027.') + fuente('Detalle de cargos individuales (HCD) de las ordenanzas.'));
      });
    }
    calculadora();
  }

  function calculadora() {
    var box = $('#pp-calc'); if (!box) return;
    box.innerHTML = '<div class="pp-form">' +
      '<label>A\u00f1o<select id="c-anio">' + AN.map(function (y) { return '<option value="' + y + '"' + (y === 2027 ? ' selected' : '') + '>' + y + '</option>'; }).join('') + '</select></label>' +
      '<label>Sueldos al a\u00f1o<select id="c-meses"><option value="12">12</option><option value="13" selected>13 (con aguinaldo)</option></select></label>' +
      '<label>Cargas patronales dentro de la partida: <b id="c-cargas-v">0%</b><input type="range" id="c-cargas" min="0" max="30" step="1" value="0"></label>' +
      '<label class="pp-chk"><input type="checkbox" id="c-pol" checked> Los 6 cargos pol\u00edticos se pagan con la partida de planta permanente</label></div>' +
      '<div class="pp-out" id="c-out"></div><div id="c-chart"></div>' +
      '<div class="pp-form"><label>Sueldo mensual promedio de un temporario: <b id="c-sueldo-v"></b><input type="range" id="c-sueldo" min="200000" max="1500000" step="10000" value="500000"></label></div>' +
      '<div class="pp-out" id="c-out2"></div>';
    var cfg = null;
    function leer() {
      return { y: +$('#c-anio').value, m: +$('#c-meses').value, c: +$('#c-cargas').value / 100, pol: $('#c-pol').checked, s: +$('#c-sueldo').value };
    }
    function costo(y, p) { var n = p.pol ? 29 : 23; return D.personal.ejec[y].planta * 1e6 / (1 + p.c) / p.m / n; }
    function act() {
      var p = leer(), e = D.personal.ejec[p.y], n = p.pol ? 29 : 23, pd = D.personal.pagosDic2025;
      $('#c-cargas-v').textContent = Math.round(p.c * 100) + '%';
      $('#c-sueldo-v').textContent = '$ ' + nf(p.s, 0);
      var mes = costo(p.y, p), anual = mes * p.m;
      $('#c-out').innerHTML = '<div class="pp-res"><span>Partida de planta permanente ' + p.y + '</span><b>' + fm(e.planta) + '</b></div>' +
        '<div class="pp-res"><span>Cargos que se reparten la partida</span><b>' + n + '</b></div>' +
        '<div class="pp-res pp-gde"><span>Costo mensual promedio por cargo</span><b>$ ' + nf(mes, 0) + '</b></div>' +
        '<div class="pp-res"><span>Costo anual promedio por cargo</span><b>$ ' + nf(anual, 0) + '</b></div>' +
        '<p class="pp-nota pp-calc"><b>C\u00c1LCULO</b> Partida \u00f7 ' + p.m + ' sueldos \u00f7 ' + n + ' cargos' + (p.c ? ' \u00f7 (1 + ' + Math.round(p.c * 100) + '% de cargas)' : '') + '. Es un promedio: la ordenanza no dice cu\u00e1nto cobra cada categor\u00eda. Si la partida incluye aportes patronales, el sueldo bruto es menor: mov\u00e9 el control de cargas.</p>';
      var tope = e.planta / p.m, real = pd.planta;
      var tt = e.temp * 1e6 / (1 + p.c) / p.m / p.s;
      $('#c-out2').innerHTML = '<div class="pp-res"><span>Partida de personal temporario ' + p.y + '</span><b>' + fm(e.temp) + '</b></div>' +
        '<div class="pp-res pp-gde"><span>Personas que alcanza a pagar con ese sueldo</span><b>' + nf(tt, 0) + '</b></div>' +
        '<div class="pp-res"><span>Equivale a temporarios por cada cargo de planta</span><b>' + nf(tt / 23, 1) + '</b></div>' +
        '<p class="pp-nota pp-calc"><b>C\u00c1LCULO</b> La ordenanza no informa cu\u00e1ntos temporarios hay: este n\u00famero es lo que la partida podr\u00eda pagar seg\u00fan el sueldo que elijas, no un dato oficial.</p>' +
        '<div class="pp-ctrl"><b>Control con pagos reales (dic. 2025)</b><br>En diciembre de 2025 las liquidaciones fueron de unos $ ' + nf(pd.planta, 1) + ' M por mes en planta, $ ' + nf(pd.temp, 1) + ' M en temporarios y $ ' + nf(pd.hcd, 1) + ' M en el Concejo. La partida ' + p.y + ' de planta, dividida en ' + p.m + ' meses, da $ ' + nf(tope, 1) + ' M por mes: ' + sg(vr(tope, real)) + ' contra ese nivel. La de temporarios da $ ' + nf(e.temp / p.m, 1) + ' M por mes: ' + sg(vr(e.temp / p.m, pd.temp)) + '. Con inflaci\u00f3n estimada de ~30% en 2026, una partida mensual que no supera ese nivel en esa magnitud deja poco margen para aumentos.<br><small>Fuente: Rendici\u00f3n 2025, deudas pendientes de pago (folio 28), lectura aproximada del escaneo.</small></div>';
      var cb = $('#c-chart');
      if (!cfg) {
        cfg = { cats: AN.map(function (y) { return { l: String(y) }; }), series: [{ n: 'Costo mensual por cargo de planta', c: COL.a2, v: [] }], fmt: function (v) { return '$ ' + nf(v, 0); }, lab: function (v) { return nf(v / 1000, 0) + ' mil'; }, unit: 'Pesos por mes, promedio por cargo, seg\u00fan las opciones de arriba. Toc\u00e1 una barra.', aria: 'Costo mensual promedio por cargo de planta',
          onPick: function (si, ci) {
            var y = AN[ci], pp = leer(), v = costo(y, pp), nn = pp.pol ? 29 : 23;
            var rows = [['Partida de planta ' + y, fm(D.personal.ejec[y].planta)], ['Cargos', nn], ['Costo mensual promedio por cargo', '<b>$ ' + nf(v, 0) + '</b>']];
            if (y > 2024) rows.push(['Variaci\u00f3n vs ' + (y - 1), sg(vr(v, costo(y - 1, pp)))]);
            if (D.inflacion[y]) rows.push(['Inflaci\u00f3n dic/dic ' + y, pc(D.inflacion[y])]);
            abrir('Costo por cargo de planta ' + y, tabla(rows) + nota('calc', 'Promedio simple. Los 29 cargos incluyen 6 pol\u00edticos y 23 de planta de categor\u00edas 12 a 21; no se puede separar cu\u00e1nto cobra cada uno sin la escala salarial.') + fuente(O[y - 2000]));
          } };
        dibujar(cb, cfg);
      }
      cfg.series[0].v = AN.map(function (y) { return costo(y, p); });
      chart(cb, cfg);
    }
    ['c-anio', 'c-meses', 'c-cargas', 'c-pol', 'c-sueldo'].forEach(function (id) { $('#' + id).addEventListener('input', act); $('#' + id).addEventListener('change', act); });
    act();
  }

  /* ---------- 6. datos interesantes ---------- */
  function hechos() {
    var box = $('#pp-hechos'); if (!box) return;
    box.innerHTML = '';
    var ET = { dato: 'DATO', calc: 'C\u00c1LCULO', op: 'OPINI\u00d3N' };
    D.hechos.forEach(function (h) {
      var b = el('button', { type: 'button', 'class': 'pp-hecho' }, box);
      b.innerHTML = '<span class="pp-tag pp-' + h.tag + '">' + ET[h.tag] + '</span><strong>' + esc(h.t) + '</strong><span>' + esc(h.r) + '</span>';
      b.onclick = function () { abrir(h.t, nota(h.tag, esc(h.r)) + '<p>' + esc(h.d) + '</p>' + fuente(esc(h.f))); };
    });
  }

  /* ---------- 7. sem\u00e1foro ---------- */
  function semaforo() {
    var box = $('#pp-semaforo'); if (!box) return;
    var r27 = R(2027), T = D.inicial[2027];
    var otras = (r27.copart + r27.consenso + r27.auto) / T * 100, pers = G(2027, 'personal') / T * 100, inv = G(2027, 'inversion') / T * 100, deu = G(2027, 'deuda') / T * 100;
    var sinDes = (200 + 200) / T * 100, caja = 14.761 / (14.952 + 1.238), corr = vr(D.final[2025], D.inicial[2025]);
    var IND = [
      { n: 'Equilibrio formal', v: 'Recursos = gastos', col: 'v', cr: 'Verde si la ordenanza cierra con recursos iguales a gastos.', l: 'Los Art. 1 y 2 fijan ambos en $1.306,8 M, con resultado cero.', o: 'Es un equilibrio en el papel: el presupuesto inicial suele corregirse durante el a\u00f1o.', f: O[27] },
      { n: 'Dependencia de Naci\u00f3n y Provincia', v: pc(otras), col: 'r', cr: 'Orientativo: verde menos de 70%, amarillo 70-90%, rojo m\u00e1s de 90%.', l: 'Casi todo lo que se gasta viene de coparticipaci\u00f3n, Consenso Fiscal y autom\u00f3tor. Recursos propios: ' + pc(r27.propios / T * 100) + '.', o: 'En municipios chicos del interior es lo habitual: la base para cobrar tasas es peque\u00f1a. Lo que importa es la tendencia: los propios subieron de 2,2% a 2,9% en el proyecto.', f: 'Cálculo de recursos 2027' },
      { n: 'Peso del personal', v: pc(pers), col: 'a', cr: 'Orientativo: verde menos de 40%, amarillo 40-55%, rojo m\u00e1s de 55%. No hay un umbral legal citado en los documentos.', l: 'Era 33,5% en 2024, 36,6% en 2025, 42,8% en 2026 y 48,2% en 2027 (Ejecutivo + Concejo).', o: 'El municipio presta servicios con personas (caminos, salud, escuelas): un gasto alto en personal no es malo en s\u00ed mismo. Lo que importa es qu\u00e9 se entrega a cambio y que los sueldos sigan la escala provincial (Art. 5).', f: 'Clasificación económica de las ordenanzas' },
      { n: 'Inversi\u00f3n f\u00edsica', v: pc(inv), col: 'r', cr: 'Orientativo: rojo menos de 5%, amarillo 5-15%, verde m\u00e1s de 15%.', l: 'Era 13,9% en 2024 y 9,3% en 2025; baj\u00f3 a 1,0% en 2026 y 0,9% en 2027. Las obras suman $7 M.', o: 'Las obras con fondos de Naci\u00f3n o Provincia pueden sumarse durante el a\u00f1o por convenio (Art. 6), as\u00ed que la inversi\u00f3n real puede ser mayor que la presupuestada. Hay que seguir la ejecuci\u00f3n.', f: 'Clasificación económica de las ordenanzas' },
      { n: 'Pago de deuda', v: pc(deu), col: 'a', cr: 'Orientativo: verde menos de 5%, amarillo 5-10%, rojo m\u00e1s de 10% del presupuesto.', l: 'Amortizaci\u00f3n $60 M + intereses $12 M. La Compensaci\u00f3n Consenso Fiscal ($58 M) no alcanza a cubrirlo.', o: 'La deuda financi\u00f3 un bien que queda en el patrimonio (la retroexcavadora). El saldo de $152,3 M frente a un activo de $283,1 M no es desproporcionado, pero compromete a\u00f1os de presupuesto.', f: 'Rendición 2025 (folios 23 y 25) y proyecto 2027' },
      { n: 'Caja contra deuda a corto plazo', v: nf(caja, 2) + ' veces', col: 'a', cr: 'Orientativo: verde m\u00e1s de 1,5; amarillo entre 0,8 y 1,5; rojo menos de 0,8.', l: 'Al 31/12/2025 las disponibilidades fueron de $14,76 M y las deudas de corto plazo ($14,95 M del 2025 + $1,24 M del 2024) sumaban $16,19 M.', o: 'Parte de esa caja corresponde a fondos de terceros y convenios, as\u00ed que lo libre es menos. Pero los pasivos son sobre todo sueldos de fin de a\u00f1o, que suelen pagarse en enero.', f: 'Rendición 2025 (folios 23 y 24)' },
      { n: 'Presupuesto vs lo que realmente pas\u00f3', v: sg(corr) + ' en 2025', col: 'a', cr: 'Orientativo: verde menos de 10% de correcci\u00f3n, amarillo 10-30%, rojo m\u00e1s de 30%.', l: 'En 2025 el presupuesto se corrigi\u00f3 ' + sg(corr) + ' (casi todo por el pr\u00e9stamo). En 2024 lo recaudado super\u00f3 al inicial en +70,8%.', o: 'Con inflaci\u00f3n de 117,8% en 2024 era dif\u00edcil proyectar. Pero que el presupuesto inicial quede sistem\u00e1ticamente corto resta valor al control del Concejo.', f: 'Ordenanzas, balance 2024 y rendici\u00f3n 2025' },
      { n: 'Detalle del gasto', v: pc(sinDes) + ' sin desglose', col: 'a', cr: 'Orientativo: verde menos de 10%, amarillo 10-40%, rojo m\u00e1s de 40% del presupuesto sin desglose por rubro.', l: 'Bienes de consumo y servicios ($400 M) y las obras figuran solo como totales; los renglones por rubro est\u00e1n en blanco.', o: 'El formato oficial tiene los renglones y se completan solo totales: es habitual, pero deja al Concejo sin saber en qu\u00e9 se gasta cada peso.', f: 'Clasificación por objeto de las ordenanzas' }
    ];
    var NOM = { v: 'Sin alerta', a: 'Para seguir de cerca', r: 'Para mirar con atenci\u00f3n' };
    box.innerHTML = '';
    IND.forEach(function (i) {
      var b = el('button', { type: 'button', 'class': 'pp-sem' }, box);
      b.innerHTML = '<i class="pp-luz pp-luz-' + i.col + '" title="' + NOM[i.col] + '"></i><span class="pp-sem-n">' + i.n + '</span><b>' + i.v + '</b>';
      b.onclick = function () {
        abrir(i.n + ' \u00b7 ' + NOM[i.col], nota('dato', i.l) + '<p><b>Criterio:</b> ' + i.cr + '</p>' + nota('op', 'Clasificaci\u00f3n: ' + NOM[i.col] + ', seg\u00fan el criterio de arriba. Es una opini\u00f3n, no un hecho.') + '<p><b>Otra mirada:</b> ' + i.o + '</p>' + fuente(i.f));
      };
    });
  }

  kpis(); evolucion(); recursos(); gastos(); personal(); hechos(); semaforo();
})();
