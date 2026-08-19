import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const body = req.body;
    
    // Core payload normalization targeting the root structure
    const payload = body.body || body;
    const entry = payload.entry || {};
    const media = payload.media || {};

    // Extracting fields exactly matching your updated keys list
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
    
    // Media details mapping
    const mediaName = media.name || 'undefined';
    const mediaUrl = media.url || 'undefined';
    const mediaCreatedAt = media.createdAt || 'undefined';
    const mediaUpdatedAt = media.updatedAt || 'undefined';

    // Combining multiple optional value paths safely
    const entryValue = entry.value || 'undefined';
    const entryContent = entry.content || 'undefined';
    const combinedContent = `${entryValue}, ${entryContent}`;
    
    // Components collection tracking
    const components = entry.Components || [];

    // Loop dynamically through any payload array items on separate rows
    const formattedComponents = components.map((item, index) => {
      const fields = Object.entries(item)
        .map(([key, value]) => `<strong>${key}:</strong> ${typeof value === 'object' ? JSON.stringify(value) : value}<br>`)
        .join('');
      return `<li style="margin-bottom:15px; list-style:none; padding:10px; border:1px solid #e2e8f0; background:#ffffff; border-radius:4px;">
                <span style="font-weight:bold; color:#1a202c;">Component #${index + 1}</span><br>${fields}
              </li>`;
    }).join('');

    // Fixed template compilation with validated, legal HTML tags
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

    await resend.emails.send({
      from: 'CMS Updates <onboarding@resend.dev>',
      to: 'soni.redsoda@GMAIL.COM', // <-- Confirm your destination email address is here
      subject: 'Prod CMS Data - Details of Change',
      html: emailHtml,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
