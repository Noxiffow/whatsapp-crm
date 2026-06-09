const {
  findOrCreateContactByPhone,
  ensureConversation,
  storeMessage,
  normalizeWhatsappNumber,
  normalizeWhatsappNumberForMeta,
  isValidWhatsappNumber,
  updateMessageDeliveryStatus,
} = require('../_lib/contacts');

const getFriendlyMetaError = (metaError) => {
  const message = metaError?.message || '';
  const code = metaError?.code ? ` Código de Meta: ${metaError.code}.` : '';

  if (message.toLowerCase().includes('access token')) {
    return `No se pudo enviar el mensaje porque el token de Meta no es válido o ha caducado.${code}`;
  }

  if (message.toLowerCase().includes('recipient') || message.toLowerCase().includes('phone')) {
    return `No se pudo enviar el mensaje porque Meta no acepta ese teléfono como destinatario.${code}`;
  }

  if (message.toLowerCase().includes('permission')) {
    return `No se pudo enviar el mensaje porque faltan permisos en Meta.${code}`;
  }

  return message || `Meta rechazó el envío del mensaje.${code}`;
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
  }

  let pendingMessage = null;

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
    const metaRecipientPhone = normalizeWhatsappNumberForMeta(whatsappNumber);
    const metaAccessToken = process.env.META_ACCESS_TOKEN;
    const metaPhoneNumberId = process.env.META_PHONE_NUMBER_ID;

    if (!isValidWhatsappNumber(normalizedPhone) || !metaRecipientPhone) {
      return res.status(400).json({ ok: false, error: 'El teléfono no tiene un formato válido.' });
    }

    const contact = contactId
      ? { id: contactId }
      : await findOrCreateContactByPhone(normalizedPhone, contactName);

    const conversation = await ensureConversation(contact.id);
    const timestamp = new Date().toISOString();
    pendingMessage = await storeMessage({
      conversationId: conversation.id,
      direction: 'outgoing',
      content: String(content).trim(),
      timestamp,
      isRead: true,
      deliveryStatus: 'pending',
    });

    if (!metaAccessToken || !metaPhoneNumberId) {
      const message = await updateMessageDeliveryStatus({
        messageId: pendingMessage.id,
        deliveryStatus: 'error',
        metaErrorMessage: 'Faltan META_ACCESS_TOKEN o META_PHONE_NUMBER_ID en Vercel.',
      });

      return res.status(400).json({
        ok: false,
        requiresMetaConfig: true,
        message,
        error: 'Faltan META_ACCESS_TOKEN o META_PHONE_NUMBER_ID en Vercel.',
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
        to: metaRecipientPhone,
        type: 'text',
        text: {
          body: String(content).trim(),
        },
      }),
    });

    const responseText = await response.text();
    let responseJson = {};

    if (responseText) {
      try {
        responseJson = JSON.parse(responseText);
      } catch (parseError) {
        console.warn('Meta respondió con un cuerpo no JSON:', responseText);
      }
    }

    if (!response.ok) {
      const friendlyError = getFriendlyMetaError(responseJson?.error);
      const message = await updateMessageDeliveryStatus({
        messageId: pendingMessage.id,
        deliveryStatus: 'error',
        metaErrorCode: responseJson?.error?.code,
        metaErrorMessage: responseJson?.error?.message || friendlyError,
      });

      return res.status(response.status).json({
        ok: false,
        error: friendlyError,
        message,
        meta: responseJson,
      });
    }

    const message = await updateMessageDeliveryStatus({
      messageId: pendingMessage.id,
      deliveryStatus: 'sent',
      metaMessageId: responseJson?.messages?.[0]?.id,
    });

    return res.status(200).json({
      ok: true,
      message,
      meta: responseJson,
    });
  } catch (error) {
    console.error('Error enviando mensaje con Meta:', error);

    if (pendingMessage?.id) {
      try {
        await updateMessageDeliveryStatus({
          messageId: pendingMessage.id,
          deliveryStatus: 'error',
          metaErrorMessage: error.message || 'Error interno al enviar el mensaje.',
        });
      } catch (statusError) {
        console.error('No se pudo marcar el mensaje como error:', statusError);
      }
    }

    return res.status(500).json({ ok: false, error: error.message || 'Error interno.' });
  }
};
