# loocaal.com

Landing de loocaal.com: animación en canvas ("De 0 a 7 cifras con IA, 0 € en anuncios") + formulario estático para captar datos de negocios locales.

## Estructura

- `index.html` — animación (primera pantalla) y formulario `#formulario` debajo. El botón "EMPIEZA AQUÍ" de la animación baja al formulario.
- `empieza.html` (`/empieza`) — landing para tráfico de pago (Meta Ads): formulario arriba, animación incrustada al lado.
- `fontaneros.html`, `reformas.html`, `dentistas.html`, `abogados.html` (`/fontaneros`, `/reformas`, `/dentistas`, `/abogados`) — landings por sector, **generadas**: no se editan a mano (ver «Landings por sector»).
- `plantilla-landing.html` + `landings.json` + `generar-landings.js` — plantilla, textos y generador de las landings por sector.
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

Parámetros opcionales (valen en cualquier modo): `sector=` y `ciudad=`. Ejemplo: `/?embed&sector=dentistas&ciudad=Sevilla`.

- `sector` cambia el rótulo de la tienda, la búsqueda tecleada, las palabras clave y la pregunta a la IA. Sectores: `fontaneros`, `reformas`, `limpieza`, `dentistas`, `abogados`, `estetica`, `restaurantes`, `inmobiliarias`, `talleres` (bloque `PRESETS` en `index.html`).
- `ciudad` pone esa ciudad en todas las búsquedas. Sin ella, se reparten entre varias ciudades.

Cuando la animación va incrustada en una landing, el botón final «EMPIEZA AQUÍ» avisa a la página contenedora (`postMessage`, tipo `loocaal:cta`) y esta baja a su propio formulario.

## Landings por sector

Cada landing es `/empieza` con textos propios y el vídeo con `sector=` correspondiente. Para cambiar textos o añadir una:

1. Edita `landings.json` (una entrada por landing: `slug`, `sector`, `sectorOption` (opción del desplegable que se preselecciona), título, textos…). Para cambiar la estructura, edita `plantilla-landing.html`.
2. Ejecuta `node generar-landings.js`. Regenera los `.html` y el bloque de redirects de `netlify.toml`.
3. Commit y push.

Los envíos llegan al mismo formulario de Netlify (`negocios-locales`) con el campo oculto `landing` (`index`, `empieza` o el slug de la landing).

## Meta Ads

1. Pon el ID del píxel en `consent.js` (`META_PIXEL_ID`). Sin ID, el píxel no se carga.
2. Envía los anuncios a `https://loocaal.com/empieza?utm_source=meta&utm_medium=paid&utm_campaign=NOMBRE&utm_content=ANUNCIO` (o a una landing por sector: `/dentistas?utm_source=…`). Los valores llegan a Netlify Forms en cada lead.
3. Evento de conversión: `Lead` (se dispara en `/gracias.html`).

## Pendiente

- ID del píxel de Meta en `consent.js`.

## Deploy

Push a `main` en GitHub → Netlify publica automáticamente (o `netlify deploy --prod --dir .`).
