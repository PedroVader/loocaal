#!/usr/bin/env node
/* Genera una landing por sector a partir de plantilla-landing.html + landings.json
   y actualiza los redirects de netlify.toml entre los marcadores "landings".
   Uso: node generar-landings.js */
'use strict';
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const plantilla = fs.readFileSync(path.join(dir, 'plantilla-landing.html'), 'utf8').replace(/^<!-- PLANTILLA:[^\n]*\n/m, '');
const landings = JSON.parse(fs.readFileSync(path.join(dir, 'landings.json'), 'utf8'));

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const HTML_OK = new Set(['h1', 'lead', 'bullet1', 'bullet2', 'bullet3']); // campos que admiten HTML (p. ej. <span>)

for (const l of landings) {
  let html = plantilla
    .replace(/\{\{selected:([^}]+)\}\}/g, (_, opt) => opt === l.sectorOption ? ' selected' : '')
    .replace(/\{\{(\w+)\}\}/g, (_, k) => {
      if (!(k in l)) throw new Error(`Falta "${k}" en la landing "${l.slug}"`);
      return HTML_OK.has(k) ? l[k] : esc(l[k]);
    });
  html = `<!-- GENERADO por generar-landings.js a partir de plantilla-landing.html y landings.json. No editar a mano. -->\n` + html;
  fs.writeFileSync(path.join(dir, `${l.slug}.html`), html);
  console.log(`✓ /${l.slug}  →  ${l.slug}.html`);
}

// redirects en netlify.toml
const tomlPath = path.join(dir, 'netlify.toml');
let toml = fs.readFileSync(tomlPath, 'utf8');
const INI = '# --- landings (generado por generar-landings.js) ---', FIN = '# --- fin landings ---';
const bloque = [INI, ...landings.map(l => `[[redirects]]\n  from = "/${l.slug}"\n  to = "/${l.slug}.html"\n  status = 200`), FIN].join('\n');
toml = toml.includes(INI) ? toml.replace(new RegExp(INI + '[\\s\\S]*?' + FIN), bloque) : toml.trimEnd() + '\n\n' + bloque + '\n';
fs.writeFileSync(tomlPath, toml);
console.log('✓ netlify.toml actualizado');
