/* Capa simple de la página de presupuesto: lenguaje sencillo, "si fueran $100", glosario y lectura en voz alta. */
(function () {
  'use strict';
  var D = window.PRESUPUESTO;
  if (!D) return;
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* Títulos más tranquilos para las tarjetas del detalle (mismo orden que en el archivo de datos) */
  var TIT = ['El aumento del presupuesto 2025 se explica sobre todo por un préstamo', 'Cómo se paga el préstamo', 'Obras públicas: lo anotado en cada presupuesto', 'Gastos de representación: una diferencia de $3 millones en 2027', 'Personal temporario y de planta: cuánto va a cada uno', 'De los $72 millones de "ahorro" 2027, $60 millones pagan el préstamo', 'Recursos propios: del 2% al 3% del presupuesto', 'Bienes y servicios: $400 millones que figuran solo como total', 'Concejo Deliberante: cargos listados y plata para personal', 'El presupuesto se va ajustando durante el año'];
  (D.hechos || []).forEach(function (h, i) { if (TIT[i]) h.t = TIT[i]; });

  var T = D.inicial[2027], r = D.recursos[2027], g = D.gastos[2027];
  function repartir(vals) {
    var tot = vals.reduce(function (a, b) { return a + b; }, 0);
    var raw = vals.map(function (v) { return v / tot * 100; });
    var fl = raw.map(Math.floor), left = 100 - fl.reduce(function (a, b) { return a + b; }, 0);
    raw.map(function (x, i) { return { i: i, f: x - Math.floor(x) }; }).sort(function (a, b) { return b.f - a.f; }).slice(0, left).forEach(function (o) { fl[o.i]++; });
    return fl;
  }
  var C = { a1: '#1a4a7a', a2: '#2563a8', a3: '#7fa8d8', gr: '#94a3b8', gc: '#cbd5e1', na: '#d97706', ve: '#2f855a', ro: '#c53030' };
  var ent = repartir([r.copart, r.consenso, r.auto, r.propios]);
  var sal = repartir([g.personal, g.consumo, g.servicios, g.transf, g.credito, g.repr, g.intereses + g.amort, g.inversion]);

  function waffle(box, items) {
    if (!box) return;
    var cells = [];
    items.forEach(function (it, ii) { for (var k = 0; k < it.n; k++) cells.push(ii); });
    box.innerHTML = '<div class="ps-grid" role="img" aria-label="' + esc(items.map(function (i) { return '$' + i.n + ' ' + i.t; }).join(', ')) + '"></div><div class="ps-leyenda"></div><p class="ps-exp" aria-live="polite"></p>';
    var gr = $('.ps-grid', box), L = $('.ps-leyenda', box), E = $('.ps-exp', box), sel = -1;
    var ayuda = 'Tocá una fila para ver qué incluye y resaltarla en los cuadraditos.';
    cells.forEach(function (ii) { var d = document.createElement('i'); d.style.background = items[ii].c; d.setAttribute('data-i', ii); gr.appendChild(d); });
    items.forEach(function (it, ii) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'ps-fila';
      b.innerHTML = '<span class="ps-cuadro" style="background:' + it.c + '"></span><b>$' + it.n + '</b><span>' + esc(it.t) + '</span>';
      b.onclick = function () {
        sel = sel === ii ? -1 : ii;
        Array.prototype.forEach.call(gr.children, function (c) { c.classList.toggle('dim', sel > -1 && +c.getAttribute('data-i') !== sel); });
        Array.prototype.forEach.call(L.children, function (x, k) { x.classList.toggle('on', k === sel); });
        E.textContent = sel > -1 ? it.d : ayuda;
      };
      L.appendChild(b);
    });
    E.textContent = ayuda;
  }
  waffle($('#wf-in'), [
    { n: ent[0], t: 'Coparticipación: plata que reparten Nación y Provincia', c: C.a1, d: 'Es plata de impuestos que cobran Nación y Provincia y reparten entre los municipios. El municipio la recibe sin tener que cobrarla.' },
    { n: ent[1], t: 'Compensación por el Consenso Fiscal', c: C.na, d: 'Fondos que llegan por un acuerdo fiscal entre Nación y Provincias. En 2025 se usaron para pagar el préstamo.' },
    { n: ent[2], t: 'Impuesto provincial al automotor', c: C.gr, d: 'La parte del impuesto a los vehículos que le toca al municipio.' },
    { n: ent[3], t: 'Lo que cobra el propio municipio', c: C.ve, d: 'Tasas (por ejemplo, tasa retributiva, carnets, higiene y seguridad, antenas) y otros cobros, como venta de agua o alquiler de máquinas.' }
  ]);
  waffle($('#wf-out'), [
    { n: sal[0], t: 'Sueldos del personal', c: C.a1, d: 'Sueldos de las personas que trabajan en el municipio y en el Concejo Deliberante: oficina, caminos, salud, limpieza y más.' },
    { n: sal[1], t: 'Insumos y materiales', c: C.a2, d: 'Combustible, repuestos, útiles, productos de limpieza, remedios y otros materiales. Los documentos solo dan el total.' },
    { n: sal[2], t: 'Servicios y mantenimiento', c: C.a3, d: 'Luz, agua, reparaciones, honorarios y otros servicios. Los documentos solo dan el total.' },
    { n: sal[3], t: 'Ayudas y aportes', c: C.gr, d: 'Ayudas a personas e instituciones, por ejemplo ayudas económicas a quienes lo necesitan.' },
    { n: sal[4], t: 'Reserva para imprevistos', c: C.gc, d: 'Una reserva para reforzar otras partidas si hace falta durante el año.' },
    { n: sal[5], t: 'Gastos de representación', c: C.na, d: 'Gastos del Ejecutivo por representar al municipio. El Art. 8 de la ordenanza pone un tope por mes.' },
    { n: sal[6], t: 'Préstamo: cuotas e intereses', c: C.ro, d: 'Se paga el préstamo del Banco Macro que se tomó en 2025.' },
    { n: sal[7], t: 'Obras y equipos nuevos', c: C.ve, d: 'Obras públicas y compra de equipos o máquinas. Durante el año pueden sumarse obras con plata de Nación o Provincia.' }
  ]);

  /* Cinco puntos, en palabras simples */
  var P = [
    { t: 'La plata viene casi toda de afuera', x: 'De cada $100 que entran, $' + (ent[0] + ent[1] + ent[2]) + ' llegan de Nación y Provincia. Solo $' + ent[3] + ' los junta el propio municipio con tasas y otros cobros. En los pueblos chicos suele pasar algo parecido, porque hay pocos contribuyentes.' },
    { t: 'Casi la mitad se va en sueldos', x: 'De cada $100, unos $' + sal[0] + ' se usan para pagar sueldos del personal del municipio y del Concejo. Con esa gente se hacen los trabajos de todos los días: caminos, salud, limpieza y atención al vecino. Es la parte más grande, por eso es importante seguirla de cerca.' },
    { t: 'Hay un préstamo por una máquina', x: 'En 2025 el municipio tomó un préstamo de $177 millones. Por los montos, coincide con la compra de una retroexcavadora, una máquina que queda para el pueblo. En 2027 se pagan cuotas e intereses: unos $' + sal[6] + ' de cada $100.' },
    { t: 'Para obras nuevas hay poco anotado', x: 'En el presupuesto 2027, las obras y equipos nuevos son alrededor de $' + sal[7] + ' de cada $100. Ojo: durante el año pueden sumarse obras con plata de Nación o Provincia, así que lo que se haga puede ser más.' },
    { t: 'El presupuesto cambia durante el año', x: 'Como los precios suben (inflación), el presupuesto se va corrigiendo a lo largo del año. Por eso lo importante es mirar también lo que realmente se gastó, y no solo lo que se anotó al principio.' }
  ];
  var pb = $('#ps-puntos');
  if (pb) pb.innerHTML = P.map(function (p, i) { return '<article class="ps-punto"><span class="ps-n">' + (i + 1) + '</span><div><h3>' + esc(p.t) + '</h3><p>' + esc(p.x) + '</p></div></article>'; }).join('');

  /* Glosario */
  var GL = [
    ['Presupuesto', 'Es el plan de cuánta plata se espera que entre y en qué se va a gastar durante el año. Lo aprueba el Concejo Deliberante.'],
    ['Millones ($ M)', '$1 M es un millón de pesos. Por ejemplo, $1.306 M son mil trescientos seis millones.'],
    ['Coparticipación', 'Plata de impuestos que cobran Nación y Provincia y reparten entre los municipios.'],
    ['Recursos propios', 'Lo que cobra el propio municipio: tasas, venta de agua, alquiler de máquinas, etc.'],
    ['Partida', 'Un casillero del presupuesto con un monto para un uso concreto, por ejemplo "combustible".'],
    ['Planta permanente y temporarios', 'La planta permanente son los empleados estables. Los temporarios están contratados por un tiempo.'],
    ['Amortización', 'La parte de un préstamo que se devuelve, sin contar los intereses.'],
    ['Ejecución', 'Lo que realmente se gastó, para compararlo con lo que se había anotado al principio.'],
    ['Inflación', 'La suba general de los precios. Por eso los montos de un año a otro no se pueden comparar de forma directa.'],
    ['Concejo Deliberante (HCD)', 'El grupo de concejales que controla y aprueba el presupuesto.']
  ];
  var gb = $('#ps-glosario');
  if (gb) gb.innerHTML = GL.map(function (x) { return '<details><summary>' + esc(x[0]) + '</summary><p>' + esc(x[1]) + '</p></details>'; }).join('');

  /* Ver / ocultar el detalle completo */
  var btn = $('#ps-ver'), av = $('#ps-avanzado');
  if (btn && av) btn.onclick = function () {
    var abrir = av.hasAttribute('hidden');
    if (abrir) av.removeAttribute('hidden'); else av.setAttribute('hidden', '');
    btn.textContent = abrir ? 'Ocultar el detalle' : 'Ver gráficos y detalle completo';
    btn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    if (abrir) { if (window.PPRedibujar) window.PPRedibujar(); av.scrollIntoView({ behavior: 'smooth' }); }
  };
  document.addEventListener('toggle', function (e) {
    var t = e.target;
    if (t && t.classList && t.classList.contains('ps-det') && t.open && window.PPRedibujar) window.PPRedibujar();
  }, true);

  /* Lectura en voz alta */
  var syn = window.speechSynthesis, hablando = false;
  var oir = Array.prototype.slice.call(document.querySelectorAll('.ps-oir'));
  function pintar() { oir.forEach(function (b) { b.textContent = hablando ? '\u23f9 Detener' : '\uD83D\uDD0A Escuchar el resumen'; }); }
  if (!syn || typeof SpeechSynthesisUtterance === 'undefined') oir.forEach(function (b) { b.hidden = true; });
  else oir.forEach(function (b) {
    b.onclick = function () {
      if (hablando) { syn.cancel(); hablando = false; pintar(); return; }
      var hero = $('.pres-hero p');
      var txt = (hero ? hero.textContent + ' ' : '') + 'Los cinco puntos más importantes. ' + P.map(function (p, i) { return 'Punto ' + (i + 1) + '. ' + p.t + '. ' + p.x; }).join(' ');
      var u = new SpeechSynthesisUtterance(txt); u.lang = 'es-AR'; u.rate = 0.95;
      u.onend = u.onerror = function () { hablando = false; pintar(); };
      hablando = true; pintar(); syn.speak(u);
    };
  });
})();
