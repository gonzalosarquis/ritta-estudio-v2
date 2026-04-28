/**
 * Serverless function to handle contact form submissions
 * Primary:  Resend (branded HTML email)
 * Fallback: Formspree (plain but reliable)
 * Optional: Supabase (saves to contacts table)
 */

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const contactData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : null,
      message: message.trim(),
      status: 'nuevo',
      created_at: new Date().toISOString()
    };

    // 1. Save to Supabase (optional — skipped if creds missing)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/contacts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify(contactData)
        });
      } catch (e) {
        console.error('Supabase save failed (non-fatal):', e);
      }
    }

    // 2. Try Resend first (branded HTML email)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const sent = await trySendResend(resendKey, contactData);
      if (sent) return res.status(200).json({ success: true });
      console.warn('Resend failed, falling back to Formspree');
    }

    // 3. Fallback: Formspree
    const formspreeUrl = process.env.FORMSPREE_ENDPOINT;
    if (formspreeUrl) {
      const sent = await trySendFormspree(formspreeUrl, contactData);
      if (sent) return res.status(200).json({ success: true });
    }

    console.error('All email methods failed');
    return res.status(500).json({ error: 'Error sending email' });

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/* ── Resend ─────────────────────────────────────────── */
async function trySendResend(apiKey, data) {
  try {
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-AR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    const html = buildEmailHtml(data, dateStr);

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'RITTA Estudio <onboarding@resend.dev>',
        to: ['rittaestudio@gmail.com'],
        reply_to: data.email,
        subject: `Nueva consulta de ${data.name} — RITTA Estudio`,
        html
      })
    });

    if (!r.ok) {
      const err = await r.text();
      console.error('Resend API error:', err);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Resend exception:', e);
    return false;
  }
}

/* ── Formspree fallback ──────────────────────────────── */
async function trySendFormspree(endpoint, data) {
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        message: data.message
      })
    });
    if (!r.ok) {
      console.error('Formspree error:', await r.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error('Formspree exception:', e);
    return false;
  }
}

/* ── HTML email template ─────────────────────────────── */
function buildEmailHtml(data, dateStr) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva consulta — RITTA Estudio</title>
</head>
<body style="margin:0;padding:0;background:#e8e4de;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e4de;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="padding:0 0 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td><p style="margin:0;font-size:13px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#1a1814;">·ritta· ESTUDIO</p></td>
                  <td align="right"><p style="margin:0;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#8a857e;">Nueva consulta</p></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#f1efeb;border:1px solid #d7d2cb;">
              <table width="100%" cellpadding="0" cellspacing="0">

                <!-- Card header -->
                <tr>
                  <td style="padding:36px 40px 28px;border-bottom:1px solid #e0ddd8;">
                    <p style="margin:0 0 6px;font-size:11px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:#9c968f;">Recibiste una consulta</p>
                    <h1 style="margin:0;font-size:22px;font-weight:500;letter-spacing:-0.02em;color:#1a1814;line-height:1.2;">${data.name}</h1>
                    <p style="margin:6px 0 0;font-size:12px;color:#9c968f;">${dateStr}</p>
                  </td>
                </tr>

                <!-- Fields -->
                <tr>
                  <td style="padding:28px 40px 0;">

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr><td style="padding-bottom:4px;"><p style="margin:0;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#9c968f;">Email</p></td></tr>
                      <tr><td style="border-bottom:1px solid #e0ddd8;padding-bottom:12px;"><a href="mailto:${data.email}" style="font-size:14px;color:#1a1814;text-decoration:none;">${data.email}</a></td></tr>
                    </table>

                    ${data.phone ? `
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr><td style="padding-bottom:4px;"><p style="margin:0;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#9c968f;">Teléfono</p></td></tr>
                      <tr><td style="border-bottom:1px solid #e0ddd8;padding-bottom:12px;"><a href="tel:${data.phone}" style="font-size:14px;color:#1a1814;text-decoration:none;">${data.phone}</a></td></tr>
                    </table>` : ''}

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                      <tr><td style="padding-bottom:8px;"><p style="margin:0;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#9c968f;">Mensaje</p></td></tr>
                      <tr><td style="background:#ebe8e2;padding:16px 18px;"><p style="margin:0;font-size:14px;line-height:1.65;color:#1a1814;">${data.message.replace(/\n/g, '<br>')}</p></td></tr>
                    </table>

                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td style="padding:0 40px 36px;">
                    <a href="mailto:${data.email}?subject=Re: Tu consulta a RITTA Estudio"
                       style="display:inline-block;background:#1a1814;color:#f1efeb;font-size:12px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;padding:14px 28px;">
                      Responder a ${data.name.split(' ')[0]}
                    </a>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 0 0;text-align:center;">
              <p style="margin:0;font-size:11px;color:#9c968f;letter-spacing:0.06em;">RITTA Estudio · Buenos Aires, Argentina</p>
              <p style="margin:4px 0 0;font-size:11px;color:#b5b0a9;">rittaestudio@gmail.com</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
