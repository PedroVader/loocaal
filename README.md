# loocaal.com

Landing de loocaal.com: animación en canvas ("De 0 a 7 cifras con IA, 0 € en anuncios") + formulario estático para captar datos de negocios locales.

## Estructura

- `index.html` — animación (primera pantalla) y formulario `#formulario` debajo. El botón "EMPIEZA AQUÍ" de la animación baja al formulario.
- `gracias.html` — página de confirmación tras enviar el formulario.
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

## Deploy

Push a `main` en GitHub → Netlify publica automáticamente (o `netlify deploy --prod --dir .`).
