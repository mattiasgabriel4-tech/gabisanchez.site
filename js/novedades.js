const novedades = [
    {
        fechaTexto: "9 de junio de 2026",
        categoria: "cat-hcd",
        titulo: "Acta N° 669 - Sesión ordinaria del HCD",
        bajada: "Se presentaron cinco proyectos de comunicación vinculados a transparencia, control administrativo y acceso a la información pública municipal.",
        imagen: "",
        link: "novedades/2026/2026-06-09-5-proyectos-comunicacion.html"
    }
];

document.addEventListener("DOMContentLoaded", function () {

    const contenedor = document.getElementById("contenedorNovedades");
    const placeholder = document.getElementById("sinNovedades");

    if (!contenedor) return;

    if (novedades.length > 0) {
        placeholder.style.display = "none";

        novedades.forEach(n => {
            contenedor.innerHTML += `
                <article class="novedad">

                    <div class="novedad-meta">
                        <span class="novedad-fecha">${n.fechaTexto}</span>
                        <span class="novedad-categoria ${n.categoria}">${n.categoria.replace("cat-","")}</span>
                    </div>

                    <h2>${n.titulo}</h2>
                    <p>${n.bajada}</p>

                    <a class="novedad-link" href="${n.link}">
                        Leer nota completa →
                    </a>

                </article>
            `;
        });

    } else {
        contenedor.innerHTML = "";
        placeholder.style.display = "block";
    }

});
