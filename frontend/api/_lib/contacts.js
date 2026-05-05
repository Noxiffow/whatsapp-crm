const { supabaseServer } = require('./supabaseServer');

const normalizeWhatsappNumber = (rawValue = '') => String(rawValue).replace(/[\s()-]/g, '');

const formatDisplayNameFromNumber = (whatsappNumber) => {
  const trimmed = normalizeWhatsappNumber(whatsappNumber);
  return trimmed || 'Nuevo contacto';
};

async function findOrCreateContactByPhone(whatsappNumber, preferredName) {
  const normalizedPhone = normalizeWhatsappNumber(whatsappNumber);

  const { data: existingContact, error: existingError } = await supabaseServer
    .from('contactos')
    .select('*')
    .eq('whatsapp_number', normalizedPhone)
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error('No se pudo consultar el contacto en Supabase.');
  }

  if (existingContact) {
    return existingContact;
  }

  const now = new Date().toISOString();
  const { data: createdContact, error: createError } = await supabaseServer
    .from('contactos')
    .insert({
      name: preferredName || formatDisplayNameFromNumber(normalizedPhone),
      whatsapp_number: normalizedPhone,
      lead_status: 'contactado',
      created_at: now,
      updated_at: now,
    })
    .select('*')
    .single();

  if (createError) {
    throw new Error('No se pudo crear el contacto automáticamente en Supabase.');
  }

  return createdContact;
}

async function ensureConversation(contactId) {
  const { data: existingConversation, error: existingError } = await supabaseServer
    .from('conversaciones')
    .select('*')
    .eq('contacto_id', contactId)
    .eq('is_active', true)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error('No se pudo consultar la conversación en Supabase.');
  }

  if (existingConversation) {
    return existingConversation;
  }

  const now = new Date().toISOString();
  const { data: createdConversation, error: createError } = await supabaseServer
    .from('conversaciones')
    .insert({
      contacto_id: contactId,
      started_at: now,
      last_message_at: now,
      is_active: true,
    })
    .select('*')
    .single();

  if (createError) {
    throw new Error('No se pudo crear la conversación en Supabase.');
  }

  return createdConversation;
}

async function storeMessage({ conversationId, direction, content, timestamp, isRead, deliveryStatus }) {
  const messageTimestamp = timestamp || new Date().toISOString();

  const { data: message, error: messageError } = await supabaseServer
    .from('mensajes')
    .insert({
      conversacion_id: conversationId,
      direction,
      content,
      timestamp: messageTimestamp,
      received_at: messageTimestamp,
      is_read: isRead,
      delivery_status: deliveryStatus,
    })
    .select('*')
    .single();

  if (messageError) {
    throw new Error('No se pudo guardar el mensaje en Supabase.');
  }

  const { error: conversationError } = await supabaseServer
    .from('conversaciones')
    .update({ last_message_at: messageTimestamp })
    .eq('id', conversationId);

  if (conversationError) {
    throw new Error('No se pudo actualizar la conversación en Supabase.');
  }

  return message;
}

module.exports = {
  normalizeWhatsappNumber,
  findOrCreateContactByPhone,
  ensureConversation,
  storeMessage,
};
