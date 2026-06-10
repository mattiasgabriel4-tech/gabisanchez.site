/* ============================================================
   burbuja-somos.js
   Inyecta dos burbujas flotantes en todas las páginas:
   1. Botón de WhatsApp (abajo a la izquierda)
   2. Logo de Somos Más Con Vos (abajo a la derecha)
   ============================================================ */

(function () {

    const estilos = document.createElement('style');
    estilos.textContent = `

        /* ---- WhatsApp flotante ---- */
        .burbuja-whatsapp {
            position: fixed;
            bottom: 28px;
            left: 24px;
            z-index: 150;
        }

        .burbuja-whatsapp-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            background-color: #25D366;
            border-radius: 50%;
            box-shadow: 0 4px 16px rgba(37, 211, 102, 0.45);
            text-decoration: none;
            transition: transform 0.25s ease, box-shadow 0.25s ease;
            animation: burbujaEntrada 0.5s ease 0.8s both;
        }

        .burbuja-whatsapp-btn:hover {
            transform: translateY(-3px) scale(1.08);
            box-shadow: 0 8px 24px rgba(37, 211, 102, 0.55);
        }

        .burbuja-whatsapp-btn img {
            width: 32px;
            height: 32px;
            object-fit: contain;
            filter: brightness(0) invert(1);
        }

        /* ---- Somos Más Con Vos flotante ---- */
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
            animation: burbujaEntrada 0.5s ease 1.2s both;
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
            filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.25));
        }

        /* ---- Animación de entrada ---- */
        @keyframes burbujaEntrada {
            0%   { opacity: 0; transform: translateY(20px) scale(0.9); }
            100% { opacity: 1; transform: translateY(0)    scale(1);   }
        }

        /* ---- Mobile ---- */
        @media (max-width: 768px) {
            .burbuja-whatsapp {
                bottom: 18px;
                left: 14px;
            }

            .burbuja-whatsapp-btn {
                width: 52px;
                height: 52px;
            }

            .burbuja-whatsapp-btn img {
                width: 26px;
                height: 26px;
            }

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

    // Detecta cuántos niveles de profundidad tiene la página actual
    const partes = window.location.pathname.replace(/\/$/, '').split('/').filter(Boolean);
    const profundidad = partes.length > 0 ? partes.length - 1 : 0;
    const subir = profundidad > 0 ? '../'.repeat(profundidad) : '';

    const rutaSomos = subir + 'somos-profundidad/somos-profundidad.html';
    const rutaLogo  = subir + 'img/logo-somos.png';
    const rutaWsp   = subir + 'img/whatsapp.png';

    /* ---- Burbuja WhatsApp ---- */
    const burbujaWsp = document.createElement('div');
    burbujaWsp.className = 'burbuja-whatsapp';
    burbujaWsp.innerHTML = `
        <a href="https://wa.me/+5493765148121"
           class="burbuja-whatsapp-btn"
           target="_blank"
           rel="noopener"
           aria-label="Escribile a Gabi por WhatsApp">
            <img src="${rutaWsp}" alt="WhatsApp">
        </a>
    `;

    /* ---- Burbuja Somos ---- */
    const burbujasSomos = document.createElement('div');
    burbujasSomos.className = 'burbuja-somos';
    burbujasSomos.innerHTML = `
        <a href="${rutaSomos}"
           class="burbuja-somos-btn"
           aria-label="Conocé Somos Más Con Vos, el partido de Gabi Sánchez">
            <img class="burbuja-somos-logo" src="${rutaLogo}" alt="Somos Más Con Vos">
        </a>
    `;

    function inyectar() {
        document.body.appendChild(burbujaWsp);
        document.body.appendChild(burbujasSomos);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inyectar);
    } else {
        inyectar();
    }

})();
