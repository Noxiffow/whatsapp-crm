import { findOrCreateContactByPhone, ensureConversation, storeMessage } from '../_lib/contacts.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const verifyToken = process.env.META_VERIFY_TOKEN;
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token && verifyToken && token === verifyToken) {
      return res.status(200).send(challenge);
    }

    if (!verifyToken) {
      return res.status(500).json({ ok: false, error: 'Falta META_VERIFY_TOKEN en Vercel.' });
    }

    return res.status(403).json({ ok: false, error: 'Verificación de Meta fallida.' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
  }

  try {
    const body = req.body || {};
    const entries = Array.isArray(body.entry) ? body.entry : [];

    for (const entry of entries) {
      const changes = Array.isArray(entry.changes) ? entry.changes : [];

      for (const change of changes) {
        const value = change.value || {};
        const contacts = Array.isArray(value.contacts) ? value.contacts : [];
        const messages = Array.isArray(value.messages) ? value.messages : [];

        for (const incomingMessage of messages) {
          if (incomingMessage.type !== 'text') {
            continue;
          }

          const phone = incomingMessage.from;
          const profileName = contacts[0]?.profile?.name;
          const content = incomingMessage.text?.body?.trim();

          if (!phone || !content) {
            continue;
          }

          const contact = await findOrCreateContactByPhone(phone, profileName);
          const conversation = await ensureConversation(contact.id);

          await storeMessage({
            conversationId: conversation.id,
            direction: 'incoming',
            content,
            timestamp: incomingMessage.timestamp
              ? new Date(Number(incomingMessage.timestamp) * 1000).toISOString()
              : new Date().toISOString(),
            isRead: false,
            deliveryStatus: 'delivered',
          });
        }
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error procesando webhook de Meta:', error);
    return res.status(500).json({ ok: false, error: error.message || 'Error interno.' });
  }
};
