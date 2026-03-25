/**
 * Serverless function to handle contact form submissions
 * Saves to Supabase and sends email via Formspree
 */

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Prepare contact data
    const contactData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : null,
      message: message.trim(),
      status: 'nuevo',
      created_at: new Date().toISOString()
    };

    // 1. Save to Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify(contactData)
    });

    if (!supabaseResponse.ok) {
      const error = await supabaseResponse.text();
      console.error('Supabase error:', error);
      // Don't fail if Supabase fails, try Formspree
    }

    // 2. Send email via Formspree
    const formspreeUrl = process.env.FORMSPREE_ENDPOINT;

    if (!formspreeUrl) {
      console.error('Missing Formspree endpoint');
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

    // Success
    return res.status(200).json({
      success: true,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
