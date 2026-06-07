/* ============================================================
   burbuja-somos.js
   Inyecta la burbuja flotante "Somos Más Con Vos" en todas
   las páginas del sitio automáticamente.
   ============================================================ */

(function () {

    const estilos = document.createElement('style');
    estilos.textContent = `
        .burbuja-somos {
            position: fixed;
            bottom: 28px;
            right: 24px;
            z-index: 150;
        }

        .burbuja-somos-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: transparent;
            text-decoration: none;
            padding: 0;
            border-radius: 50%;
            transition: transform 0.25s ease, filter 0.25s ease;
        }

        .burbuja-somos-btn:hover {
            transform: translateY(-3px) scale(1.08);
            filter: drop-shadow(0 6px 16px rgba(26, 74, 122, 0.50));
        }

        .burbuja-somos-logo {
            width: 64px;
            height: 64px;
            object-fit: contain;
            display: block;
            /* drop-shadow respeta la transparencia del PNG */
            filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.25));
        }

        @keyframes burbujaEntrada {
            0%   { opacity: 0; transform: translateY(20px) scale(0.9); }
            100% { opacity: 1; transform: translateY(0)    scale(1);   }
        }

        .burbuja-somos-btn {
            animation: burbujaEntrada 0.5s ease 1.2s both;
        }

        @media (max-width: 768px) {
            .burbuja-somos {
                bottom: 18px;
                right: 14px;
            }

            .burbuja-somos-logo {
                width: 52px;
                height: 52px;
            }
        }
    `;
    document.head.appendChild(estilos);

    const burbuja = document.createElement('div');
    burbuja.className = 'burbuja-somos';

    const enSubcarpeta = window.location.pathname.includes('/somos-profundidad/');
    const rutaSomos    = enSubcarpeta
        ? 'somos-profundidad.html'
        : 'somos-profundidad/somos-profundidad.html';
    const rutaLogo     = enSubcarpeta ? '../img/logo-somos.png' : 'img/logo-somos.png';

    burbuja.innerHTML = `
        <a href="${rutaSomos}" class="burbuja-somos-btn" aria-label="Conocé Somos Más Con Vos, el partido de Gabi Sánchez">
            <img class="burbuja-somos-logo" src="${rutaLogo}" alt="Somos Más Con Vos">
        </a>
    `;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => document.body.appendChild(burbuja));
    } else {
        document.body.appendChild(burbuja);
    }

})();
