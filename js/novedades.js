document.addEventListener("DOMContentLoaded", function () {

    // 1. DATOS DE NOTICIAS (AQUÍ AGREGÁS MÁS DESPUÉS)
    const novedades = [
        {
            fecha: "9 de junio de 2026",
            categoria: "HCD",
            titulo: "Acta N° 669 - Sesión ordinaria del Concejo Deliberante",
            bajada: "Se presentaron cinco proyectos de comunicación vinculados al control administrativo, transparencia institucional y acceso a la información pública municipal.",
            link: "novedades/2026/2026-06-09-cinco-proyectos-comunicacion.html"
        }
    ];

    // 2. BUSCAR CONTENEDOR EN TU HTML
    const contenedor = document.getElementById("contenedorNovedades");
    const placeholder = document.getElementById("sinNovedades");

    // 3. CONTROL DE ERROR (SI NO EXISTE EL DIV)
    if (!contenedor) {
        console.error("ERROR: No existe #contenedorNovedades en novedades.html");
        return;
    }

    // 4. LIMPIAR CONTENIDO
    contenedor.innerHTML = "";

    // 5. RENDER DE NOTICIAS
    novedades.forEach(n => {

        const card = document.createElement("article");
        card.className = "novedad";

        card.innerHTML = `
            <div class="novedad-meta">
                <span class="novedad-fecha">${n.fecha}</span>
                <span class="novedad-categoria cat-hcd">${n.categoria}</span>
            </div>

            <h2>${n.titulo}</h2>

            <p>${n.bajada}</p>

            <a class="novedad-link" href="${n.link}">
                Leer nota completa →
            </a>
        `;

        contenedor.appendChild(card);
    });

    // 6. OCULTAR PLACEHOLDER SI HAY NOTICIAS
    if (placeholder && novedades.length > 0) {
        placeholder.style.display = "none";
    }

});
