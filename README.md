# loocaal.com

Landing de loocaal.com: animación en canvas ("De 0 a 7 cifras con IA, 0 € en anuncios") + formulario estático para captar datos de negocios locales.

## Estructura

- `index.html` — animación (primera pantalla) y formulario `#formulario` debajo. El botón "EMPIEZA AQUÍ" de la animación baja al formulario.
- `empieza.html` (`/empieza`) — landing para tráfico de pago (Meta Ads): formulario arriba, animación incrustada al lado.
- `gracias.html` — página de confirmación tras enviar el formulario. Dispara el evento `Lead` del píxel de Meta (si hay consentimiento).
- `aviso-legal.html`, `privacidad.html`, `cookies.html` + `legal.css` — páginas legales (Fast Horizons SL).
- `consent.js` — banner de cookies (estático), carga del píxel de Meta solo con consentimiento, y captura de UTM/fbclid en campos ocultos del formulario.
- `netlify.toml` — configuración de publicación (sitio estático, sin build).

## Formulario

Usa **Netlify Forms** (`data-netlify="true"`, nombre `negocios-locales`). Los envíos se ven en Netlify → Site → Forms. Desde ahí se pueden activar notificaciones por email, Slack o webhook.

Campos: negocio, contacto, email, teléfono, ciudad, sector, web, facturación, ficha de Google Business, anuncios actuales, objetivo y consentimiento de privacidad. Protección anti-spam con honeypot (`bot-field`).

## Textos de la animación

Editables en `index.html`, bloque `CONFIG` (negocio, dominio, cifras, palabras clave, CTA…).

## Modos

- `/` — reproductor normal.
- `/?embed` — sin controles ni formulario (para incrustar).
- `/?render` — modo para renderizado sin cabeza (`window.FILM`).

## Meta Ads

1. Pon el ID del píxel en `consent.js` (`META_PIXEL_ID`). Sin ID, el píxel no se carga.
2. Envía los anuncios a `https://loocaal.com/empieza?utm_source=meta&utm_medium=paid&utm_campaign=NOMBRE&utm_content=ANUNCIO`. Los valores llegan a Netlify Forms en cada lead.
3. Evento de conversión: `Lead` (se dispara en `/gracias.html`).

## Pendiente

- Dirección postal de Fast Horizons SL en `aviso-legal.html` y `privacidad.html` (buscar `[DIRECCIÓN POSTAL PENDIENTE]`).

## Deploy

Push a `main` en GitHub → Netlify publica automáticamente (o `netlify deploy --prod --dir .`).
