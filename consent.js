/* loocaal.com — banner de cookies, píxel de Meta (solo con consentimiento) y captura de UTM.
   Para activar el píxel: pon tu ID en META_PIXEL_ID (Meta Business Suite → Orígenes de datos → Píxel). */
(function () {
  'use strict';
  var META_PIXEL_ID = '3302342123486678'; // Vacío = el píxel no se carga nunca.
  var KEY = 'loocaal_consent';      // 'accepted' | 'rejected'
  var isPlayer = !/[?&](embed|render)\b/.test(location.search);

  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  // ---- píxel de Meta ----
  function loadPixel() {
    if (!META_PIXEL_ID || window.fbq) return;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
    s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
    if (document.body.hasAttribute('data-lead')) window.fbq('track', 'Lead');
  }

  // ---- banner (estático, sin animación) ----
  function showBanner() {
    var b = document.createElement('div');
    b.id = 'cookie-banner';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', 'Aviso de cookies');
    b.innerHTML =
      '<p>Usamos cookies de Meta para medir nuestros anuncios. Solo si las aceptas. ' +
      '<a href="/cookies.html">Más información</a></p>' +
      '<div class="acciones"><button type="button" data-c="rejected">Rechazar</button>' +
      '<button type="button" class="ok" data-c="accepted">Aceptar</button></div>';
    b.addEventListener('click', function (e) {
      var v = e.target && e.target.getAttribute('data-c'); if (!v) return;
      set(v); b.remove(); if (v === 'accepted') loadPixel();
    });
    document.body.appendChild(b);
  }

  // ---- UTM: guardar el origen y volcarlo en los campos ocultos del formulario ----
  function utm() {
    var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];
    var q = new URLSearchParams(location.search), found = {}, any = false;
    keys.forEach(function (k) { if (q.get(k)) { found[k] = q.get(k); any = true; } });
    try {
      if (any) sessionStorage.setItem('loocaal_utm', JSON.stringify(found));
      else found = JSON.parse(sessionStorage.getItem('loocaal_utm') || '{}');
    } catch (e) {}
    keys.forEach(function (k) {
      var el = document.querySelector('form input[name="' + k + '"]');
      if (el && found[k]) el.value = found[k];
    });
    var ref = document.querySelector('form input[name="pagina_origen"]');
    if (ref) ref.value = location.href.split('#')[0];
  }

  function init() {
    utm();
    if (!isPlayer) return;
    var c = get();
    if (c === 'accepted') loadPixel();
    else if (c !== 'rejected') showBanner();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
