/* ============================================================
   burbuja-somos.js
   Inyecta la burbuja flotante "Somos Más Con Vos" en todas
   las páginas del sitio automáticamente.
   Para actualizar el partido, solo hay que editar este archivo.
   ============================================================ */

(function () {

    /* ---- Estilos de la burbuja ---- */
    const estilos = document.createElement('style');
    estilos.textContent = `
        .burbuja-somos {
            position: fixed;
            bottom: 28px;
            right: 24px;
            z-index: 150;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
        }

        .burbuja-somos-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            background-color: #1a4a7a;
            color: #ffffff;
            text-decoration: none;
            padding: 10px;
            border-radius: 50px;
            box-shadow: 0 4px 20px rgba(26, 74, 122, 0.40);
            font-family: 'Inter', 'Segoe UI', sans-serif;
            font-size: 0.88rem;
            font-weight: 600;
            letter-spacing: 0.01em;
            transition: transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease;
            white-space: nowrap;
            max-width: 220px;
        }

        .burbuja-somos-btn:hover {
            background-color: #2563a8;
            transform: translateY(-3px);
            box-shadow: 0 8px 28px rgba(26, 74, 122, 0.50);
            color: #ffffff;
        }

        .burbuja-somos-logo {
            width: 44px;
            height: 44px;
            object-fit: contain;
            display: block;
            flex-shrink: 0;
        }

        @media (max-width: 768px) {
            .burbuja-somos-logo {
                width: 38px;
                height: 38px;
            }
        }

        /* Pulso de atención al cargar la página */
        @keyframes burbujaEntrada {
            0%   { opacity: 0; transform: translateY(20px) scale(0.9); }
            100% { opacity: 1; transform: translateY(0)    scale(1);   }
        }

        .burbuja-somos-btn {
            animation: burbujaEntrada 0.5s ease 1.2s both;
        }

        /* Mobile: más pequeña para no tapar contenido */
        @media (max-width: 768px) {
            .burbuja-somos {
                bottom: 18px;
                right: 14px;
            }

            .burbuja-somos-btn {
                padding: 10px 14px;
                gap: 8px;
            }

            .burbuja-somos-nombre {
                font-size: 0.84rem;
            }

            .burbuja-somos-partido {
                display: none;
            }
        }
    `;
    document.head.appendChild(estilos);

    /* ---- Estructura de la burbuja ---- */
    const burbuja = document.createElement('div');
    burbuja.className = 'burbuja-somos';

    /* Detectar si estamos dentro de la carpeta somos-profundidad/ */
    const enSubcarpeta = window.location.pathname.includes('/somos-profundidad/');
    const rutaSomos    = enSubcarpeta
        ? 'somos-profundidad.html'
        : 'somos-profundidad/somos-profundidad.html';

    burbuja.innerHTML = `
        <a href="${rutaSomos}" class="burbuja-somos-btn" aria-label="Conocé Somos Más Con Vos, el partido de Gabi Sánchez">
            <img class="burbuja-somos-logo" src="${enSubcarpeta ? '../' : ''}img/logo-somos.png" alt="Somos Más Con Vos">
        </a>
    `;

    /* Insertar al final del body cuando el DOM esté listo */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => document.body.appendChild(burbuja));
    } else {
        document.body.appendChild(burbuja);
    }

})();
