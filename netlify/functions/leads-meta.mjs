// Avisa por email de cada lead nuevo del formulario instantáneo de Meta.
// Cada 5 min lee los leads del formulario en la Graph API y reenvía los nuevos al formulario
// interno «leads-meta» de Netlify Forms, que es quien manda el email (notificación del formulario).
// Variables de entorno: META_PAGE_TOKEN (token de página con leads_retrieval) y META_FORM_ID.
import { getStore } from '@netlify/blobs';

const GRAPH = 'https://graph.facebook.com';

// Las preguntas personalizadas llegan con claves generadas por Meta: se reconocen por palabra clave.
const CAMPOS = [
  ['nombre', /full_name|nombre/],
  ['telefono', /phone/],
  ['email', /email/],
  ['sector', /dedica|sector/],
  ['web', /web/],
  ['inversion', /inversi/],
  ['municipio', /municipio/],
];

function aplanar(lead) {
  const d = {};
  for (const f of lead.field_data || []) {
    const clave = f.name.toLowerCase();
    const campo = CAMPOS.find(([, re]) => re.test(clave));
    if (campo && !d[campo[0]]) d[campo[0]] = (f.values || []).join(', ');
  }
  // Las opciones de respuesta llegan como «menos_de_690_€»: se pasan a texto normal.
  for (const k of ['sector', 'web', 'inversion', 'municipio']) {
    if (d[k]) d[k] = d[k].replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
  }
  return d;
}

function valorar(inversion = '') {
  if (/menos de/i.test(inversion)) return 'Flojo (menos de 690 €)';
  if (/\d/.test(inversion)) return 'Bueno';
  return 'Medio (inversión sin decidir)';
}

async function leerLeads(formId, token, desde) {
  const filtro = JSON.stringify([{ field: 'time_created', operator: 'GREATER_THAN', value: desde }]);
  let url = `${GRAPH}/${formId}/leads?fields=id,created_time,ad_name,field_data&limit=50`
    + `&filtering=${encodeURIComponent(filtro)}&access_token=${encodeURIComponent(token)}`;
  const leads = [];
  while (url) {
    const r = await fetch(url);
    const j = await r.json();
    if (!r.ok) throw new Error(`Graph API ${r.status}: ${j.error?.message || 'error'}`);
    leads.push(...(j.data || []));
    url = j.paging?.next;
  }
  return leads;
}

export default async () => {
  const { META_PAGE_TOKEN: token, META_FORM_ID: formId, URL: sitio } = process.env;
  if (!token || !formId) {
    console.log('Faltan META_PAGE_TOKEN o META_FORM_ID');
    return;
  }

  const store = getStore('leads-meta');
  const estado = (await store.get('estado', { type: 'json' })) || { desde: 0, vistos: [] };
  const vistos = new Set(estado.vistos);

  // Margen de 10 min hacia atrás por si Meta tarda en publicar un lead; los repetidos se descartan por id.
  const leads = await leerLeads(formId, token, Math.max(0, estado.desde - 600));
  const nuevos = leads
    .filter((l) => !vistos.has(l.id))
    .sort((a, b) => a.created_time.localeCompare(b.created_time));

  for (const lead of nuevos) {
    const d = aplanar(lead);
    const tel = (d.telefono || '').replace(/[^\d]/g, '');
    const datos = {
      'form-name': 'leads-meta',
      nombre: d.nombre || '',
      telefono: d.telefono || '',
      whatsapp: tel ? `https://wa.me/${tel}` : '',
      email: d.email || '',
      sector: d.sector || '',
      web: d.web || '',
      inversion: d.inversion || '',
      municipio: d.municipio || '',
      valoracion: valorar(d.inversion),
      anuncio: lead.ad_name || '',
      fecha: new Date(lead.created_time).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }),
    };
    const r = await fetch(`${sitio}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(datos).toString(),
    });
    if (!r.ok) throw new Error(`Netlify Forms ${r.status} con el lead ${lead.id}`);
    vistos.add(lead.id);
    estado.desde = Math.max(estado.desde, Math.floor(Date.parse(lead.created_time) / 1000));
  }

  estado.vistos = [...vistos].slice(-500);
  await store.setJSON('estado', estado);
  console.log(`Leads revisados: ${leads.length}, nuevos avisados: ${nuevos.length}`);
};

export const config = { schedule: '*/5 * * * *' };
