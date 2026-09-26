/* loocaal.com — convierte el formulario «negocios-locales» en 3 pasos.
   Solo reordena y oculta los campos existentes: Netlify Forms recibe exactamente los mismos campos.
   Sin JavaScript, el formulario se ve completo como siempre. */
(function () {
  'use strict';
  var PASOS = [
    { titulo: 'Tu negocio', campos: ['sector', 'ciudad', 'negocio'] },
    { titulo: 'Tu situación', campos: ['web', 'facturacion', 'google_business', 'anuncios', 'objetivo'] },
    { titulo: '¿Dónde te contactamos?', campos: ['contacto', 'email', 'telefono', 'privacidad'] }
  ];

  var css =
    '.ms-oculto{display:none!important}' +
    '.ms-progreso{grid-column:1/-1;display:flex;flex-direction:column;gap:8px}' +
    '.ms-progreso .ms-texto{display:flex;justify-content:space-between;font:600 14px/1.2 system-ui,sans-serif;color:#231d19}' +
    '.ms-progreso .ms-texto span:last-child{color:#7b7167;font-weight:500}' +
    '.ms-barra{height:8px;background:#e4d8c1;border-radius:999px;overflow:hidden}' +
    '.ms-barra i{display:block;height:100%;background:#179c55;border-radius:999px;transition:width .25s ease}' +
    '.ms-nav{grid-column:1/-1;display:flex;gap:12px;align-items:center}' +
    '.ms-nav button{font:700 18px/1 system-ui,sans-serif;letter-spacing:.04em;border-radius:999px;padding:16px 28px;cursor:pointer}' +
    '.ms-nav .ms-sig{flex:1;color:#fff;background:#179c55;border:2px solid #0c6636}' +
    '.ms-nav .ms-sig:hover{background:#0c6636}' +
    '.ms-nav .ms-atras{color:#231d19;background:transparent;border:2px solid #231d19;padding:16px 20px}' +
    '.ms-nav .ms-atras:hover{background:#e4d8c1}' +
    '.ms-nav button[type=submit]{flex:1;grid-column:auto;margin:0}' +
    '@media (max-width:420px){.ms-nav button{font-size:15px;padding:15px 16px}.ms-nav .ms-atras{padding:15px 14px}}';

  function init(form) {
    var contenedor = function (nombre) {
      var el = form.elements[nombre];
      if (!el) return null;
      if (el.length && !el.tagName) el = el[0]; // grupo de radios
      return el.closest('.campo, fieldset') || null;
    };
    var pasos = PASOS.map(function (p) {
      return { titulo: p.titulo, nodos: p.campos.map(contenedor).filter(Boolean) };
    });
    if (pasos.some(function (p) { return !p.nodos.length; })) return; // estructura inesperada: no tocar

    var enviar = form.querySelector('button[type=submit]');
    if (!enviar) return;

    // barra de progreso
    var progreso = document.createElement('div');
    progreso.className = 'ms-progreso';
    progreso.innerHTML = '<div class="ms-texto"><span></span><span></span></div><div class="ms-barra"><i></i></div>';
    var primero = pasos[0].nodos[0];
    form.insertBefore(progreso, primero);

    // reordenar los campos por pasos
    pasos.forEach(function (p) { p.nodos.forEach(function (n) { form.insertBefore(n, enviar); }); });

    // navegación
    var nav = document.createElement('div');
    nav.className = 'ms-nav';
    var atras = document.createElement('button');
    atras.type = 'button'; atras.className = 'ms-atras'; atras.textContent = '← Atrás';
    var sig = document.createElement('button');
    sig.type = 'button'; sig.className = 'ms-sig'; sig.textContent = 'SIGUIENTE →';
    form.insertBefore(nav, enviar);
    nav.appendChild(atras); nav.appendChild(sig); nav.appendChild(enviar);

    var actual = 0;
    function mostrar(i, enfocar) {
      actual = i;
      pasos.forEach(function (p, k) {
        p.nodos.forEach(function (n) { n.classList.toggle('ms-oculto', k !== i); });
      });
      var ultimo = i === pasos.length - 1;
      atras.classList.toggle('ms-oculto', i === 0);
      sig.classList.toggle('ms-oculto', ultimo);
      enviar.classList.toggle('ms-oculto', !ultimo);
      var t = progreso.querySelectorAll('.ms-texto span');
      t[0].textContent = pasos[i].titulo;
      t[1].textContent = 'Paso ' + (i + 1) + ' de ' + pasos.length;
      progreso.querySelector('i').style.width = ((i + 1) / pasos.length * 100) + '%';
      if (enfocar) {
        var top = progreso.getBoundingClientRect().top;
        if (top < 0 || top > window.innerHeight * 0.4) progreso.scrollIntoView({ behavior: 'smooth', block: 'start' });
        var campo = pasos[i].nodos[0].querySelector('input:not([type=hidden]), select, textarea');
        if (campo && !(campo.tagName === 'SELECT' && campo.value)) try { campo.focus({ preventScroll: true }); } catch (e) {}
      }
    }

    function valido(i) {
      var ok = true;
      pasos[i].nodos.forEach(function (n) {
        if (!ok) return;
        n.querySelectorAll('input, select, textarea').forEach(function (el) {
          if (ok && !el.checkValidity()) { el.reportValidity(); ok = false; }
        });
      });
      return ok;
    }

    sig.addEventListener('click', function () { if (valido(actual)) mostrar(actual + 1, true); });
    atras.addEventListener('click', function () { mostrar(actual - 1, true); });
    // Enter en un paso intermedio avanza en vez de enviar
    // (con el botón de enviar oculto el navegador no hace el envío implícito, así que lo capturamos aquí)
    form.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || e.target.tagName !== 'INPUT' || actual === pasos.length - 1) return;
      e.preventDefault();
      if (valido(actual)) mostrar(actual + 1, true);
    });
    form.addEventListener('submit', function (e) {
      if (actual < pasos.length - 1) {
        e.preventDefault();
        if (valido(actual)) mostrar(actual + 1, true);
      }
    });

    mostrar(0, false);
  }

  function arrancar() {
    var form = document.querySelector('form[name="negocios-locales"]');
    if (!form) return;
    var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
    init(form);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
