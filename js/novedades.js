const novedades = [
    {
        fecha: "2026-06-09",
        fechaTexto: "9 de junio de 2026",
        categoria: "HCD",
        titulo: "Sesión ordinaria del HCD y presentación de cinco proyectos",
        bajada: "En la sesión del 9 de junio de 2026 se presentaron cinco proyectos de comunicación vinculados al control institucional, transparencia y administración municipal.",
        imagen: "img/novedades/acta-669.jpg",
        link: "novedades/2026/2026-06-09-proyectos-hcd.html"
    }
];

// ordenar siempre por fecha (más nuevo arriba)
novedades.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
