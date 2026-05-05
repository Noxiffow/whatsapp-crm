const { findOrCreateContactByPhone, ensureConversation, storeMessage, normalizeWhatsappNumber } = require('../_lib/contacts');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
  }

  try {
    const {
      contactId,
      whatsappNumber,
      contactName,
      content,
    } = req.body || {};

    if (!whatsappNumber || !content || !String(content).trim()) {
      return res.status(400).json({ ok: false, error: 'Faltan teléfono o contenido.' });
    }

    const normalizedPhone = normalizeWhatsappNumber(whatsappNumber);
    const metaAccessToken = process.env.META_ACCESS_TOKEN;
    const metaPhoneNumberId = process.env.META_PHONE_NUMBER_ID;

    if (!metaAccessToken || !metaPhoneNumberId) {
      return res.status(400).json({
        ok: false,
        requiresMetaConfig: true,
        error: 'Faltan las credenciales de Meta en Vercel.',
      });
    }

    const response = await fetch(`https://graph.facebook.com/v23.0/${metaPhoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${metaAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizedPhone,
        type: 'text',
        text: {
          body: String(content).trim(),
        },
      }),
    });

    const responseJson = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: responseJson?.error?.message || 'Meta rechazó el envío del mensaje.',
        meta: responseJson,
      });
    }

    const contact = contactId
      ? { id: contactId }
      : await findOrCreateContactByPhone(normalizedPhone, contactName);

    const conversation = await ensureConversation(contact.id);
    const timestamp = new Date().toISOString();
    const message = await storeMessage({
      conversationId: conversation.id,
      direction: 'outgoing',
      content: String(content).trim(),
      timestamp,
      isRead: true,
      deliveryStatus: 'sent',
    });

    return res.status(200).json({
      ok: true,
      message,
      meta: responseJson,
    });
  } catch (error) {
    console.error('Error enviando mensaje con Meta:', error);
    return res.status(500).json({ ok: false, error: error.message || 'Error interno.' });
  }
};
