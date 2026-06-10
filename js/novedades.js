/* ============================================================
   GABI SÁNCHEZ — SITIO OFICIAL
   js/novedades.js — Sistema de noticias desde Google Sheets
   ============================================================

   CÓMO AGREGAR UNA NOTICIA NUEVA:
   1. Abrís la app "Hojas de cálculo de Google" en el celular
   2. Agregás una fila nueva con: fecha, titulo, resumen, etiqueta, archivo
   3. Guardás — en unos minutos aparece automáticamente en el sitio

   Las noticias más nuevas van ARRIBA (fila 2, debajo de los títulos)
   ============================================================ */

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT339zLE2gGf2BBDHMrFWf1ewHE3P23g7vPGd1m2JXrI2UeMfFjq1Yk95wy7Vey8fXQfFVue1LPkdhZ/pub?output=csv";

(function () {

  const contenedor  = document.getElementById("novedades-lista");
  const filtroCont  = document.getElementById("novedades-filtros");
  const buscadorInput = document.getElementById("novedades-search");
  if (!contenedor) return;

  let todasLasNoticias = []; // guardamos los datos para filtrar después

  contenedor.innerHTML = '<p class="novedades-vacio">Cargando novedades…</p>';

  fetch(SHEET_URL)
    .then(function (res) {
      if (!res.ok) throw new Error("No se pudo cargar");
      return res.text();
    })
    .then(function (csv) {

      const filas = csv.trim().split("\n").slice(1);

      if (filas.length === 0 || (filas.length === 1 && filas[0].trim() === "")) {
        contenedor.innerHTML = '<p class="novedades-vacio">No hay novedades publicadas todavía. Volvé pronto.</p>';
        return;
      }

      // Parsear todas las filas
      todasLasNoticias = filas
        .map(function (fila) {
          const cols = parsearCSV(fila);
          return {
            fecha:    (cols[0] || "").trim(),
            titulo:   (cols[1] || "").trim(),
            resumen:  (cols[2] || "").trim(),
            etiqueta: (cols[3] || "").trim(),
            archivo:  (cols[4] || "").trim()
          };
        })
        .filter(function (n) { return n.titulo !== ""; });

      // Generar botones de filtro dinámicamente según etiquetas existentes
      if (filtroCont) {
        const etiquetas = [...new Set(todasLasNoticias.map(function(n){ return n.etiqueta; }).filter(Boolean))];
        etiquetas.forEach(function (etiq) {
          const btn = document.createElement("button");
          btn.className = "filtro-btn";
          btn.dataset.filtro = etiq;
          btn.textContent = etiq;
          filtroCont.appendChild(btn);
        });

        // Eventos de filtro
        filtroCont.addEventListener("click", function (e) {
          if (!e.target.classList.contains("filtro-btn")) return;
          filtroCont.querySelectorAll(".filtro-btn").forEach(function(b){ b.classList.remove("activo"); });
          e.target.classList.add("activo");
          renderizar();
        });
      }

      // Evento de búsqueda
      if (buscadorInput) {
        buscadorInput.addEventListener("input", renderizar);
      }

      renderizar();
    })
    .catch(function () {
      contenedor.innerHTML = '<p class="novedades-vacio">No se pudieron cargar las novedades. Intentá de nuevo más tarde.</p>';
    });

  /* Renderiza las noticias aplicando filtro activo y texto de búsqueda */
  function renderizar() {
    const filtroActivo = filtroCont
      ? (filtroCont.querySelector(".filtro-btn.activo") || {}).dataset.filtro || "todos"
      : "todos";
    const textoBusqueda = buscadorInput ? buscadorInput.value.toLowerCase().trim() : "";

    const filtradas = todasLasNoticias.filter(function (n) {
      const pasaFiltro  = filtroActivo === "todos" || n.etiqueta === filtroActivo;
      const pasaBusqueda = !textoBusqueda ||
        n.titulo.toLowerCase().includes(textoBusqueda) ||
        n.resumen.toLowerCase().includes(textoBusqueda);
      return pasaFiltro && pasaBusqueda;
    });

    if (filtradas.length === 0) {
      contenedor.innerHTML = '<p class="novedades-vacio">No se encontraron novedades con ese criterio.</p>';
      return;
    }

    contenedor.innerHTML = filtradas.map(function (n) {
      return `
        <article class="novedad-card">
          <div class="novedad-meta">
            <span class="novedad-fecha">${n.fecha}</span>
            ${n.etiqueta ? `<span class="novedad-etiqueta">${n.etiqueta}</span>` : ""}
          </div>
          <h3 class="novedad-titulo">${n.titulo}</h3>
          <p class="novedad-resumen">${n.resumen}</p>
          ${n.archivo ? `<a class="btn-accion" href="${n.archivo}">Leer nota completa →</a>` : ""}
        </article>
      `;
    }).join("");
  }

  /* Parser CSV que respeta comas dentro de comillas */
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
