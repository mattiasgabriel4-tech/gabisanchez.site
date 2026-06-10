/* ============================================================
   GABI SÁNCHEZ — SITIO OFICIAL
   js/novedades.js — Sistema de noticias desde Google Sheets
   ============================================================

   CÓMO AGREGAR UNA NOTICIA NUEVA:
   1. Abrís la app "Hojas de cálculo de Google" en el celular
   2. Agregás una fila nueva con: fecha, titulo, resumen, etiqueta, archivo
   3. Guardás — en unos minutos aparece automáticamente en el sitio

   IMPORTANTE: Las noticias más nuevas van ARRIBA (fila 2, debajo del título)

   ============================================================ */

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT339zLE2gGf2BBDHMrFWf1ewHE3P23g7vPGd1m2JXrI2UeMfFjq1Yk95wy7Vey8fXQfFVue1LPkdhZ/pub?output=csv";

(function () {

  const contenedor = document.getElementById("novedades-lista");
  if (!contenedor) return;

  contenedor.innerHTML = '<p class="novedades-vacio">Cargando novedades…</p>';

  fetch(SHEET_URL)
    .then(function (res) {
      if (!res.ok) throw new Error("No se pudo cargar");
      return res.text();
    })
    .then(function (csv) {

      const filas = csv.trim().split("\n").slice(1); // saltea la fila de títulos

      if (filas.length === 0 || (filas.length === 1 && filas[0].trim() === "")) {
        contenedor.innerHTML = '<p class="novedades-vacio">No hay novedades publicadas todavía. Volvé pronto.</p>';
        return;
      }

      const html = filas.map(function (fila) {
        // Manejo de comas dentro de comillas (CSV estándar)
        const cols = parsearCSV(fila);
        const fecha    = (cols[0] || "").trim();
        const titulo   = (cols[1] || "").trim();
        const resumen  = (cols[2] || "").trim();
        const etiqueta = (cols[3] || "").trim();
        const archivo  = (cols[4] || "").trim();

        if (!titulo) return ""; // saltea filas vacías

        return `
          <article class="novedad-card">
            <div class="novedad-meta">
              <span class="novedad-fecha">${fecha}</span>
              ${etiqueta ? `<span class="novedad-etiqueta">${etiqueta}</span>` : ""}
            </div>
            <h3 class="novedad-titulo">${titulo}</h3>
            <p class="novedad-resumen">${resumen}</p>
            ${archivo ? `<a class="btn-accion" href="${archivo}">Leer nota completa →</a>` : ""}
          </article>
        `;
      }).join("");

      contenedor.innerHTML = html || '<p class="novedades-vacio">No hay novedades publicadas todavía.</p>';
    })
    .catch(function () {
      contenedor.innerHTML = '<p class="novedades-vacio">No se pudieron cargar las novedades. Intentá de nuevo más tarde.</p>';
    });

  /* Parser CSV simple que respeta comas dentro de comillas */
  function parsearCSV(fila) {
    const resultado = [];
    let campo = "";
    let dentroComillas = false;
    for (let i = 0; i < fila.length; i++) {
      const c = fila[i];
      if (c === '"') {
        dentroComillas = !dentroComillas;
      } else if (c === "," && !dentroComillas) {
        resultado.push(campo);
        campo = "";
      } else {
        campo += c;
      }
    }
    resultado.push(campo);
    return resultado;
  }

})();
