export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.redirect(302, '/');
  }

  const { nombre, empresa, email, telefono, pais, sitios, mensaje } = req.body;

  if (!nombre || !email || !telefono || !empresa) {
    return res.redirect(302, '/?error=campos');
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'invasWMS Landing <contacto@mulleryperez.cl>',
        to: ['contacto@impruvex.com'],
        cc: ['contacto@invaswms.com', 'contacto@mulleryperez.cl'],
        subject: `🔴 Nueva solicitud demo WMS — ${empresa}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#1746a2;border-bottom:2px solid #1746a2;padding-bottom:12px;">Nueva solicitud de demo — invasWMS</h2>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
              <tr><td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;background:#f9fafb;width:140px;">Nombre</td><td style="padding:10px;border:1px solid #e5e7eb;">${nombre}</td></tr>
              <tr><td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;background:#f9fafb;">Empresa</td><td style="padding:10px;border:1px solid #e5e7eb;">${empresa}</td></tr>
              <tr><td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;background:#f9fafb;">Email</td><td style="padding:10px;border:1px solid #e5e7eb;"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;background:#f9fafb;">Telefono</td><td style="padding:10px;border:1px solid #e5e7eb;">${telefono}</td></tr>
              <tr><td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;background:#f9fafb;">Pais</td><td style="padding:10px;border:1px solid #e5e7eb;">${pais || 'No indicado'}</td></tr>
              <tr><td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;background:#f9fafb;">Sitios / CDs</td><td style="padding:10px;border:1px solid #e5e7eb;">${sitios || 'No indicado'}</td></tr>
              <tr><td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;background:#f9fafb;">Mensaje</td><td style="padding:10px;border:1px solid #e5e7eb;">${mensaje || 'Sin mensaje'}</td></tr>
            </table>
            <p style="color:#6b7280;font-size:12px;">Enviado desde landing.invaswms.com</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      console.error('Resend error:', await response.text());
    }
  } catch (err) {
    console.error('Error enviando email:', err);
  }

  return res.redirect(302, '/gracias.html');
}
