const novedades = [
    {
        fecha: "2026-06-09",
        fechaTexto: "9 de junio de 2026",
        categoria: "HCD",
        titulo: "Presentación de cinco proyectos de comunicación en el HCD",
        bajada: "Se presentaron cinco proyectos vinculados al control institucional, transparencia y acceso a la información pública municipal.",
        imagen: "img/novedades/acta-669.jpg",
        link: "novedades/2026/2026-06-09-proyectos-hcd.html"
    }
];

// Orden automático (más reciente primero)
novedades.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
