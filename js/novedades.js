/* ============================================================
   GABI SÁNCHEZ — SITIO OFICIAL
   js/novedades.js — Sistema de noticias dinámico
   ============================================================

   CÓMO AGREGAR UNA NOTICIA NUEVA:
   1. Creá el archivo HTML en /novedades/2026/ (o el año que corresponda)
   2. Agregá un objeto al array "noticias" abajo, siguiendo el mismo formato
   3. Listo — aparece automáticamente en novedades.html

   ============================================================ */

const noticias = [
  {
    fecha: "9 de junio de 2026",
    titulo: "Acta N° 669: Gabi Sánchez presentó 5 proyectos de comunicación",
    resumen: "En la última sesión del Concejo Deliberante de Profundidad, la concejal presentó cinco proyectos de comunicación relacionados con transparencia, control administrativo y acceso a la información pública. La presidencia indicó que la información debe solicitarse al Ejecutivo municipal.",
    etiqueta: "HCD",
    archivo: "novedades/2026/2026-06-09-cinco-proyectos-comunicacion.html"
  }
  /* Para agregar más noticias, copiá el bloque de arriba (desde la llave { hasta },)
     y pegalo aquí debajo, modificando los datos. Las más nuevas van primero. */
];

/* ============================================================
   RENDERIZADO — No hace falta modificar nada de acá para abajo
   ============================================================ */
(function () {
  const contenedor = document.getElementById("novedades-lista");
  if (!contenedor) return;

  if (noticias.length === 0) {
    contenedor.innerHTML = `
      <p class="novedades-vacio">No hay novedades publicadas todavía. Volvé pronto.</p>
    `;
    return;
  }

  const html = noticias.map(function (n) {
    return `
      <article class="novedad-card">
        <div class="novedad-meta">
          <span class="novedad-fecha">${n.fecha}</span>
          <span class="novedad-etiqueta">${n.etiqueta}</span>
        </div>
        <h3 class="novedad-titulo">${n.titulo}</h3>
        <p class="novedad-resumen">${n.resumen}</p>
        <a class="btn-accion" href="${n.archivo}">Leer nota completa →</a>
      </article>
    `;
  }).join("");

  contenedor.innerHTML = html;
})();
