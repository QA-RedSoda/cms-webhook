import { Resend } from 'resend';

export default async function handler(req, res) {
  // Prevent crash if opened casually in a web browser
  if (req.method !== 'POST') {
    return res.status(200).json({ 
      success: false, 
      message: "Your webhook is working! However, you must trigger it with a POST request from your CMS, not via a browser URL window." 
    });
  }

  // Safety check to prevent crash if the API Key environment variable is missing
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ 
      success: false, 
      error: "Missing RESEND_API_KEY environment variable. Please add it to your Vercel Project Settings." 
    });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = req.body || {};
    
    // Core payload normalization targeting the root structure safely
    const payload = body.body || body;
    const entry = payload.entry || {};
    const media = payload.media || {};

    const event = payload.event || 'undefined';
    const model = payload.model || 'undefined';
    const entryId = entry.id || 'undefined';
    const entryKey = entry.key || 'undefined';
    const entryName = entry.name || 'undefined';
    const entryTitle = entry.title || 'undefined';
    const pageCode = entry.pageCode || 'undefined';
    const createdAt = entry.createdAt || 'undefined';
    const updatedAt = entry.updatedAt || 'undefined';
    const publishedAt = entry.publishedAt || 'undefined';
    
    const mediaName = media.name || 'undefined';
    const mediaUrl = media.url || 'undefined';
    const mediaCreatedAt = media.createdAt || 'undefined';
    const mediaUpdatedAt = media.updatedAt || 'undefined';

    const entryValue = entry.value || 'undefined';
    const entryContent = entry.content || 'undefined';
    const combinedContent = `${entryValue}, ${entryContent}`;
    
    const components = entry.Components || [];

    const formattedComponents = components.map((item, index) => {
      const fields = Object.entries(item)
        .map(([key, value]) => `<strong>${key}:</strong> ${typeof value === 'object' ? JSON.stringify(value) : value}<br>`)
        .join('');
      return `<li style="margin-bottom:15px; list-style:none; padding:10px; border:1px solid #e2e8f0; background:#ffffff; border-radius:4px;">
                <span style="font-weight:bold; color:#1a202c;">Component #${index + 1}</span><br>${fields}
              </li>`;
    }).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <body>
        <h1 style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 32px; font-weight: 300; letter-spacing: -0.5px; color: #111111; border-bottom: 2px solid #222222; padding-bottom: 8px; margin-bottom: 24px;">
          Prod CMS Data: Details of Change
        </h1>
        <ul style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.8; color: #333333; padding-left: 0;">
          <li><strong>Trigger event: ${event}</strong></li>
          <li><strong>Entry type: ${model}</strong></li>
          <li><strong>Entry ID: ${entryId}</strong></li>
          <li>Entry key: ${entryKey}</li>
          <li>Entry name: ${entryName}</li>
          <li>Entry title: ${entryTitle}</li>
          <li><strong>Entry pageCode: ${pageCode}</strong></li>
          <li><strong>Created at: ${createdAt}</strong></li>
          <li><strong>Updated at: ${updatedAt}</strong></li>
          <li><strong>Published at: ${publishedAt}</strong></li>
          <li>Media name: ${mediaName}</li>
          <li>Media URL: ${mediaUrl}</li>
          <li>Media created at: ${mediaCreatedAt}</li>
          <li>Media updated at: ${mediaUpdatedAt}</li>
          <li>Entry value/content: ${combinedContent}</li>
          <li style="margin-top: 20px; list-style: none;">
            <span style="font-size: 18px; font-weight: bold; display: block; margin-bottom: 10px;">Components:</span>
            <ul style="padding-left: 0;">
              ${formattedComponents || '<li>No components found</li>'}
            </ul>
          </li>
        </ul>
      </body>
      </html>
    `;

    // Send the email
    await resend.emails.send({
      from: 'Resend <onboarding@resend.dev>',
      to: 'soni.redsoda@gmail.com', // <-- MUST BE YOUR EXACT RESEND ACCOUNT REGISTRATION EMAIL
      subject: 'Prod CMS Data: Record of Modification',
      html: emailHtml,
    });

    return res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    // This catches the email runtime error cleanly instead of crashing the serverless instance
    return res.status(200).json({ 
      success: false, 
      error: "The email transmission failed.",
      details: error.message 
    });
  }
}
