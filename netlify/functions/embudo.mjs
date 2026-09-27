// Contador anónimo del embudo del formulario: sin cookies ni datos personales.
// Cada evento se guarda como una clave vacía «AAAA-MM-DD/landing/paso/aleatorio» en el store «embudo».
// Leer: node embudo-informe.mjs
import { getStore } from '@netlify/blobs';

const PASOS = new Set(['visita', 'inicio', 'paso2', 'paso3', 'envio']);
const LANDINGS = new Set(['index', 'empieza', 'dentistas', 'abogados', 'fontaneros', 'reformas']);

export default async (req) => {
  if (req.method !== 'POST') return new Response(null, { status: 405 });
  let d;
  try { d = JSON.parse(await req.text()); } catch { return new Response(null, { status: 400 }); }
  if (!PASOS.has(d.paso) || !LANDINGS.has(d.landing)) return new Response(null, { status: 400 });
  const utm = /^[a-z0-9]{1,20}$/.test(d.utm || '') ? d.utm : 'directo';
  const dia = new Date().toISOString().slice(0, 10);
  await getStore('embudo').set(`${dia}/${d.landing}/${d.paso}/${utm}/${crypto.randomUUID()}`, '');
  return new Response(null, { status: 204 });
};

export const config = { path: '/api/embudo' };
