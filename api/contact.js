// Parche M&P (15 oct 2026): el envío de leads es de Invas; esto es un respaldo vía Resend.
// Si el correo falla, no se muestra "Solicitud recibida" en falso y se registra el error.
const esc = (v) => String(v || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const fila = (label, valor) =>
  `<tr><td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;background:#f9fafb;width:160px;">${label}</td>` +
  `<td style="padding:10px;border:1px solid #e5e7eb;">${esc(valor) || 'No indicado'}</td></tr>`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.redirect(302, '/');
  }

  const { nombre, empresa, email, telefono, cargo, tamano, pais, sitios, desafio, mensaje } = req.body || {};

  if (!nombre || !email || !telefono || !empresa) {
    return res.redirect(302, '/?error=campos');
  }

  const lead = { nombre, empresa, email, telefono, cargo, tamano, pais, sitios, desafio, mensaje, fecha: new Date().toISOString() };
  // Queda en los logs de Vercel aunque falle el correo.
  console.log('LEAD', JSON.stringify(lead));

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'invasWMS Landing <contacto@mulleryperez.cl>',
        to: ['contacto@impruvex.com', 'cvilo@impruvex.com', 'mfierro@impruvex.com'],
        cc: ['contacto@invaswms.com', 'contacto@mulleryperez.cl'],
        reply_to: email,
        subject: `🔴 Nueva solicitud demo WMS — ${empresa}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#1746a2;border-bottom:2px solid #1746a2;padding-bottom:12px;">Nueva solicitud de demo — invasWMS</h2>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
              ${fila('Nombre', nombre)}
              ${fila('Empresa', empresa)}
              ${fila('Email', email)}
              ${fila('Teléfono', telefono)}
              ${fila('Cargo', cargo)}
              ${fila('Tamaño empresa', tamano)}
              ${fila('País', pais)}
              ${fila('Sitios / CDs', sitios)}
              ${fila('Desafío logístico', desafio)}
              ${mensaje ? fila('Mensaje', mensaje) : ''}
            </table>
            <p style="color:#6b7280;font-size:12px;">Enviado desde landing.invaswms.com</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      console.error('LEAD_NO_ENVIADO Resend', response.status, await response.text());
      return res.redirect(302, '/?error=envio');
    }
  } catch (err) {
    console.error('LEAD_NO_ENVIADO', err);
    return res.redirect(302, '/?error=envio');
  }

  return res.redirect(302, '/gracias.html');
}
