// Informe del embudo anónimo del formulario (datos de netlify/functions/embudo.mjs).
// Uso: node embudo-informe.mjs [desde AAAA-MM-DD]
import { getStore } from '@netlify/blobs';
import { readFileSync } from 'fs';
import { homedir } from 'os';

const cfg = JSON.parse(readFileSync(`${homedir()}/Library/Preferences/netlify/config.json`, 'utf8'));
const token = cfg.users[cfg.userId].auth.token;
const siteID = JSON.parse(readFileSync(new URL('./.netlify/state.json', import.meta.url))).siteId;
const desde = process.argv[2] || '0000-00-00';

const store = getStore({ name: 'embudo', siteID, token });
const { blobs } = await store.list();
const PASOS = ['visita', 'inicio', 'paso2', 'paso3', 'envio', 'whatsapp'];
const t = {};
for (const { key } of blobs) {
  const [dia, landing, paso, utm] = key.split('/');
  if (dia < desde) continue;
  for (const k of [landing, `${landing} · ${utm}`, 'TOTAL']) {
    t[k] ??= Object.fromEntries(PASOS.map(p => [p, 0]));
    t[k][paso]++;
  }
}
const pct = (a, b) => (b ? Math.round((a / b) * 100) + '%' : '—');
console.log(`Embudo del formulario${desde !== '0000-00-00' ? ' desde ' + desde : ''}\n`);
console.log('landing · anuncio'.padEnd(28) + PASOS.map(p => p.padStart(8)).join('') + '   visita→contacto');
for (const [k, v] of Object.entries(t).sort((a, b) => (a[0] === 'TOTAL') - (b[0] === 'TOTAL') || a[0].localeCompare(b[0]))) {
  console.log(k.padEnd(28) + PASOS.map(p => String(v[p]).padStart(8)).join('') + pct(v.envio + v.whatsapp, v.visita).padStart(18));
}
