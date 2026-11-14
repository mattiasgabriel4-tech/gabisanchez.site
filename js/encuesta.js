/* Encuesta anónima dentro de la página del presupuesto. No pide nombre ni guarda IP. */
(function () {
  'use strict';
  var API = window.PP_ENCUESTA_API || 'https://radio.gabisanchez.com.ar/encuesta-api';
  var KEY = 'pp-encuesta-2027';
  var box = document.getElementById('pp-encuesta');
  if (!box) return;
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function yaRespondio() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function marcar(v) { try { if (v) localStorage.setItem(KEY, '1'); else localStorage.removeItem(KEY); } catch (e) {} }

  function gracias() {
    box.innerHTML = '<div class="pe-gracias"><b>¡Gracias por participar!</b><p>Tu opinión llegó. Se usa para conocer lo que piensan los vecinos sobre cómo se gasta la plata del municipio.</p><button type="button" class="pe-otra">Responder otra vez (otra persona)</button></div>';
    box.querySelector('.pe-otra').onclick = function () { marcar(false); cargar(); };
  }

  function formulario(preg) {
    var h = '<p class="pe-aviso"><b>Encuesta anónima.</b> No pedimos tu nombre y la encuesta no guarda tu IP. Guardamos solo tus respuestas y, si querés ponerlo, tu barrio o paraje. No se publican respuestas individuales.</p><form class="pe-form" novalidate>';
    preg.forEach(function (p) {
      var tipo = p.max > 1 ? 'checkbox' : 'radio';
      h += '<fieldset class="pe-preg" data-k="' + p.k + '" data-max="' + p.max + '"><legend>' + esc(p.t) + (p.req ? ' <span class="pe-req">*</span>' : '') + '</legend>';
      p.op.forEach(function (o) {
        h += '<label class="pe-op"><input type="' + tipo + '" name="' + p.k + '" value="' + esc(o) + '"> <span>' + esc(o) + '</span></label>';
      });
      h += '</fieldset>';
    });
    h += '<label class="pe-campo">Barrio o paraje <small>(opcional)</small><input type="text" name="barrio" maxlength="40" autocomplete="off"></label>' +
      '<label class="pe-campo">¿Querés agregar algo? <small>(opcional, no escribas datos personales)</small><textarea name="comentario" maxlength="400" rows="3"></textarea></label>' +
      '<div class="pe-web" aria-hidden="true"><label>No completar<input type="text" name="web" tabindex="-1" autocomplete="off"></label></div>' +
      '<label class="pe-acepto"><input type="checkbox" name="acepto"> <span>Entiendo que la encuesta es anónima y que mis respuestas se usan para conocer la opinión de los vecinos.</span></label>' +
      '<p class="pe-msg" role="status" aria-live="polite"></p><button type="submit" class="pe-enviar">Enviar mi opinión</button></form>';
    box.innerHTML = h;
    var f = box.querySelector('form'), msg = box.querySelector('.pe-msg'), btn = box.querySelector('.pe-enviar');
    Array.prototype.forEach.call(box.querySelectorAll('fieldset[data-max]'), function (fs) {
      var max = +fs.getAttribute('data-max');
      if (max < 2) return;
      fs.addEventListener('change', function () {
        var marc = fs.querySelectorAll('input:checked').length;
        Array.prototype.forEach.call(fs.querySelectorAll('input'), function (i) { i.disabled = !i.checked && marc >= max; });
      });
    });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var body = { acepto: f.acepto.checked, barrio: f.barrio.value, comentario: f.comentario.value, web: f.web.value };
      for (var i = 0; i < preg.length; i++) {
        var p = preg[i], v = Array.prototype.map.call(f.querySelectorAll('input[name="' + p.k + '"]:checked'), function (x) { return x.value; });
        body[p.k] = v;
        if (p.req && !v.length) { msg.textContent = 'Falta responder: ' + p.t; msg.className = 'pe-msg pe-err'; return; }
      }
      if (!body.acepto) { msg.textContent = 'Marcá que entendés cómo se usan tus respuestas.'; msg.className = 'pe-msg pe-err'; return; }
      btn.disabled = true; msg.textContent = 'Enviando…'; msg.className = 'pe-msg';
      fetch(API + '/enviar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (j) {
          if (j && j.ok) { marcar(true); gracias(); }
          else { msg.textContent = (j && j.error) || 'No se pudo enviar. Probá de nuevo en un rato.'; msg.className = 'pe-msg pe-err'; btn.disabled = false; }
        })
        .catch(function () { msg.textContent = 'No hay conexión con la encuesta. Probá de nuevo en un rato.'; msg.className = 'pe-msg pe-err'; btn.disabled = false; });
    });
  }

  function cargar() {
    if (yaRespondio()) { gracias(); return; }
    box.innerHTML = '<p class="pe-aviso">Cargando la encuesta…</p>';
    fetch(API + '/preguntas').then(function (r) { return r.json(); })
      .then(function (j) { formulario(j.preguntas); })
      .catch(function () { box.innerHTML = '<p class="pe-aviso">La encuesta no está disponible en este momento. Probá de nuevo más tarde.</p>'; });
  }
  cargar();
})();
