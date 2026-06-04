import { supabaseServer } from './supabaseServer.js';

const normalizeWhatsappNumber = (rawValue = '') => {
  const compactValue = String(rawValue).replace(/[\s()-]/g, '');
  const digitsOnly = compactValue.replace(/[^\d]/g, '');

  if (!digitsOnly) {
    return '';
  }

  return `+${digitsOnly}`;
};

const normalizeWhatsappNumberForMeta = (rawValue = '') =>
  normalizeWhatsappNumber(rawValue).replace(/^\+/, '');

const isValidWhatsappNumber = (rawValue = '') =>
  /^\+[1-9][0-9]{8,14}$/.test(normalizeWhatsappNumber(rawValue));

const formatDisplayNameFromNumber = (whatsappNumber) => {
  const trimmed = normalizeWhatsappNumber(whatsappNumber);
  return trimmed || 'Nuevo contacto';
};

async function findOrCreateContactByPhone(whatsappNumber, preferredName) {
  const normalizedPhone = normalizeWhatsappNumber(whatsappNumber);

  if (!isValidWhatsappNumber(normalizedPhone)) {
    throw new Error('El teléfono recibido no tiene un formato válido.');
  }

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
    if (createError.code === '23505') {
      const { data: contactAfterRace, error: raceError } = await supabaseServer
        .from('contactos')
        .select('*')
        .eq('whatsapp_number', normalizedPhone)
        .limit(1)
        .maybeSingle();

      if (!raceError && contactAfterRace) {
        return contactAfterRace;
      }
    }

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

async function updateMessageDeliveryStatus({ messageId, deliveryStatus, metaMessageId, metaErrorCode, metaErrorMessage }) {
  const { data: message, error: statusError } = await supabaseServer
    .from('mensajes')
    .update({ delivery_status: deliveryStatus })
    .eq('id', messageId)
    .select('*')
    .single();

  if (statusError) {
    throw new Error('No se pudo actualizar el estado del mensaje en Supabase.');
  }

  const metadataUpdate = {};

  if (metaMessageId) {
    metadataUpdate.meta_message_id = metaMessageId;
  }

  if (metaErrorCode) {
    metadataUpdate.meta_error_code = String(metaErrorCode);
  }

  if (metaErrorMessage) {
    metadataUpdate.meta_error_message = metaErrorMessage;
  }

  if (Object.keys(metadataUpdate).length === 0) {
    return message;
  }

  const { data: messageWithMeta, error: metadataError } = await supabaseServer
    .from('mensajes')
    .update(metadataUpdate)
    .eq('id', messageId)
    .select('*')
    .single();

  if (metadataError) {
    console.warn('No se pudieron guardar metadatos de Meta en el mensaje:', metadataError.message);
    return message;
  }

  return messageWithMeta;
}

export {
  normalizeWhatsappNumber,
  normalizeWhatsappNumberForMeta,
  isValidWhatsappNumber,
  findOrCreateContactByPhone,
  ensureConversation,
  storeMessage,
  updateMessageDeliveryStatus,
};
