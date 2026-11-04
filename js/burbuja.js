/* Burbuja flotante que lleva al análisis del presupuesto. Se carga en todas las páginas. */
(function () {
  'use strict';
  if (/presupuesto\.html$/.test(location.pathname)) return;
  try { if (sessionStorage.getItem('pp-burbuja-cerrada') === '1') return; } catch (e) {}
  var css = '.pp-burbuja{position:fixed;right:14px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:900;display:flex;align-items:center;gap:6px;font-family:var(--fuente-cuerpo,Inter,Segoe UI,sans-serif)}' +
    '.pp-burbuja a{display:flex;align-items:center;gap:8px;padding:11px 16px;border-radius:999px;background:var(--azul-principal,#1a4a7a);color:#fff;text-decoration:none;font-weight:600;font-size:.9rem;box-shadow:0 6px 22px rgba(26,74,122,.45);animation:pp-latido 2.6s ease-in-out infinite}' +
    '.pp-burbuja a:hover,.pp-burbuja a:focus-visible{background:var(--azul-medio,#2563a8)}' +
    '.pp-burbuja .pp-b-x{width:26px;height:26px;border:0;border-radius:50%;background:#fff;color:#1a4a7a;font-size:1rem;line-height:1;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.25)}' +
    '@keyframes pp-latido{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}' +
    '@media(prefers-reduced-motion:reduce){.pp-burbuja a{animation:none}}' +
    '@media(max-width:420px){.pp-burbuja a{padding:10px 13px;font-size:.84rem}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var box = document.createElement('div'); box.className = 'pp-burbuja';
  box.innerHTML = '<a href="/presupuesto.html" aria-label="Ver el análisis del presupuesto municipal"><span aria-hidden="true">\uD83D\uDCCA</span> Mirá el presupuesto explicado</a><button type="button" class="pp-b-x" aria-label="Ocultar este aviso">\u00d7</button>';
  box.querySelector('.pp-b-x').onclick = function () {
    box.remove();
    try { sessionStorage.setItem('pp-burbuja-cerrada', '1'); } catch (e) {}
  };
  document.body.appendChild(box);
})();
