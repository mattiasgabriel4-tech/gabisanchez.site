const novedades = [
    {
        fecha: "2026-06-09",
        fechaTexto: "9 de junio de 2026",
        categoria: "HCD",
        titulo: "Presentación de cinco proyectos de comunicación",
        bajada: "El Concejal Matías Sánchez Alfonso presentó cinco proyectos vinculados al control administrativo, transparencia y acceso a la información pública municipal.",
        imagen: "img/novedades/acta-669.jpg",
        link: "novedades/2026/2026-06-09-5-proyectos-comunicacion.html"
    }
];

// ordenar por fecha (más nuevo primero)
novedades.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
