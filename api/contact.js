/**
 * Serverless function to handle contact form submissions
 * Sends email via Formspree (required)
 * Saves to Supabase contacts table (optional — skipped if credentials missing)
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

    // 1. Save to Supabase (optional — don't fail if creds are missing)
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

    // 2. Send email via Formspree (required)
    const formspreeUrl = process.env.FORMSPREE_ENDPOINT;

    if (!formspreeUrl) {
      console.error('Missing FORMSPREE_ENDPOINT env var');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const formspreeResponse = await fetch(formspreeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone || '',
        message: contactData.message
      })
    });

    if (!formspreeResponse.ok) {
      const error = await formspreeResponse.text();
      console.error('Formspree error:', error);
      return res.status(500).json({ error: 'Error sending email' });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
