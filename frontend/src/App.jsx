import React, { useState, useEffect } from 'react';
import ContactList from './components/ContactList';
import ConversationView from './components/ConversationView';
import { supabase } from './lib/supabase';
import './App.css';
import winowinLogo from './assets/winowin-logo.svg';

const normalizeWhatsappNumber = (rawValue) =>
  rawValue.replace(/[\s()-]/g, '');

const isValidWhatsappNumber = (rawValue) => {
  const normalizedValue = normalizeWhatsappNumber(rawValue);
  return /^\+[1-9]\d{8,14}$/.test(normalizedValue);
};

function App() {
  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [simulateMessage, setSimulateMessage] = useState('Hola, escribo para pedir información.');
  const [contactError, setContactError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionInfo, setActionInfo] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedContact = contacts.find((contact) => contact.id === selectedContactId) || null;

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setActionError('');
    const { data, error } = await supabase
      .from('contactos')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      setActionError('No se pudo cargar la lista de contactos desde Supabase.');
      return;
    }

    setContacts(data || []);
  };

  const updateConversationTimestamp = async (conversationId, timestamp) => {
    const { error } = await supabase
      .from('conversaciones')
      .update({ last_message_at: timestamp })
      .eq('id', conversationId);

    if (error) {
      throw new Error('No se pudo actualizar la conversación.');
    }
  };

  const ensureConversation = async (contactId) => {
    const { data, error } = await supabase
      .from('conversaciones')
      .select('*')
      .eq('contacto_id', contactId)
      .eq('is_active', true)
      .order('started_at', { ascending: false })
      .limit(1);

    if (error) {
      throw new Error('No se pudo consultar la conversación en Supabase.');
    }

    if (data && data.length > 0) {
      return data[0];
    }

    const now = new Date().toISOString();
    const { data: createdConversation, error: createError } = await supabase
      .from('conversaciones')
      .insert({
        contacto_id: contactId,
        started_at: now,
        last_message_at: now,
        is_active: true,
      })
      .select()
      .single();

    if (createError) {
      throw new Error('No se pudo crear la conversación en Supabase.');
    }

    return createdConversation;
  };

  const handleContactSelect = async (contactId) => {
    setSelectedContactId(contactId);
    setActionError('');
    setActionInfo('');

    const contact = contacts.find((item) => item.id === contactId);
    if (!contact) {
      setActionError('No se encontró el contacto seleccionado.');
      return;
    }

    try {
      await fetchConversation(contact.id);
    } catch (error) {
      setConversation(null);
      setMessages([]);
      setActionError(error.message || 'No se pudo preparar el contacto en Supabase.');
    }
  };

  const handleRefreshCurrentView = async () => {
    setActionInfo('Vista actualizada.');
    await fetchContacts();
    setIsRefreshing(true);

    const refreshedContacts = await fetchContacts();
    if (!refreshedContacts) {
      setIsRefreshing(false);
      return;
    }

    if (selectedContactId) {
      const selectedStillExists = refreshedContacts.some((contact) => contact.id === selectedContactId);
      if (!selectedStillExists) {
        setSelectedContactId(null);
        setConversation(null);
        setMessages([]);
        setNewMessage('');
        setIsRefreshing(false);
        return;
      }

      await fetchConversation(selectedContactId);
    }

    setIsRefreshing(false);
  };

  const fetchConversation = async (contactId) => {
    setActionError('');
    const { data, error } = await supabase
      .from('conversaciones')
      .select('*')
      .eq('contacto_id', contactId)
      .eq('is_active', true)
      .order('started_at', { ascending: false })
      .limit(1);

    if (error) {
      setActionError('No se pudo cargar la conversación desde Supabase.');
      return;
    }

    if (data.length > 0) {
      setConversation(data[0]);
      await fetchMessages(data[0].id);
    } else {
      setConversation(null);
      setMessages([]);
    }
  };

  const fetchMessages = async (conversationId) => {
    const { data, error } = await supabase
      .from('mensajes')
      .select('*')
      .eq('conversacion_id', conversationId)
      .order('timestamp', { ascending: true });

    if (error) {
      setActionError('No se pudieron cargar los mensajes desde Supabase.');
      return;
    }

    setMessages(data || []);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContactId) return;
    setActionError('');
    setActionInfo('');

    let activeConversation = conversation;
    if (!conversation) {
      try {
        activeConversation = await ensureConversation(selectedContactId);
        setConversation(activeConversation);
      } catch (error) {
        setActionError(error.message || 'No se pudo crear la conversación para este contacto.');
        return;
      }
    }

    const timestamp = new Date().toISOString();
    const { data: msgData, error } = await supabase
      .from('mensajes')
      .insert({
        conversacion_id: activeConversation.id,
        direction: 'outgoing',
        content: newMessage,
        timestamp,
        received_at: timestamp,
        is_read: true,
        delivery_status: 'sent',
      })
      .select()
      .single();

    if (error) {
      setActionError('No se pudo enviar el mensaje en Supabase.');
      return;
    }

    try {
      await updateConversationTimestamp(activeConversation.id, timestamp);
    } catch (timestampError) {
      setActionError(timestampError.message);
      return;
    }

    setMessages([...messages, msgData]);
    setNewMessage('');
    setActionInfo('Mensaje enviado correctamente.');
    await fetchConversation(selectedContactId);
  };

  const handleSimulateIncoming = async () => {
    if (!selectedContact || !simulateMessage.trim()) return;

    setActionError('');
    setActionInfo('');

    let activeConversation = conversation;
    if (!conversation) {
      try {
        activeConversation = await ensureConversation(selectedContact.id);
        setConversation(activeConversation);
      } catch (error) {
        setActionError(error.message || 'No se pudo preparar la conversación para simular mensajes.');
        return;
      }
    }

    const timestamp = new Date().toISOString();
    const { error } = await supabase
      .from('mensajes')
      .insert({
        conversacion_id: activeConversation.id,
        direction: 'incoming',
        content: simulateMessage.trim(),
        timestamp,
        received_at: timestamp,
        is_read: false,
        delivery_status: 'delivered',
      });

    if (error) {
      setActionError('No se pudo simular el mensaje entrante en Supabase.');
      return;
    }

    try {
      await updateConversationTimestamp(activeConversation.id, timestamp);
    } catch (timestampError) {
      setActionError(timestampError.message);
      return;
    }

    setActionInfo('Mensaje entrante simulado correctamente.');
    await fetchConversation(selectedContact.id);
  };

  const handleCreateContact = async ({ name, whatsappNumber, leadStatus }) => {
    setContactError('');
    setActionError('');
    setActionInfo('');

    const normalizedWhatsappNumber = normalizeWhatsappNumber(whatsappNumber);
    if (!isValidWhatsappNumber(normalizedWhatsappNumber)) {
      setContactError('El número debe estar en formato internacional válido, por ejemplo +34604923459.');
      return false;
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('contactos')
      .insert({
        name,
        whatsapp_number: normalizedWhatsappNumber,
        lead_status: leadStatus,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        setContactError('Ya existe un contacto con ese número de WhatsApp.');
      } else {
        setContactError('No se pudo crear el contacto en Supabase.');
      }
      return false;
    }

    try {
      await fetchContacts();
      setSelectedContactId(data.id);
      await fetchConversation(data.id);
      setActionInfo('Contacto creado correctamente en Supabase.');
      return true;
    } catch (supabaseError) {
      setActionError(supabaseError.message || 'El contacto se creó en Supabase, pero no se pudo abrir su conversación.');
      await fetchContacts();
      return true;
    }
  };

  const handleDeleteContact = async (contactId) => {
    const confirmed = window.confirm('¿Seguro que quieres eliminar este contacto?');
    if (!confirmed) {
      return false;
    }

    console.log('Delete contact ID before fetch:', contactId);
    setContactError('');

    try {
      const res = await fetch(`/api/contactos/${contactId}`, { method: 'DELETE' });

      if (!res.ok) {
        console.error('Error DELETE:', res.status, await res.text());
        throw new Error('No se pudo eliminar el contacto.');
      }

      setContacts((currentContacts) => currentContacts.filter((contact) => contact.id !== contactId));

      if (selectedContactId === contactId) {
        setSelectedContactId(null);
        setConversation(null);
        setMessages([]);
        setNewMessage('');
      }

      await fetchContacts();
      return true;
    } catch (error) {
      setContactError(error.message || 'No se pudo eliminar el contacto.');
      return false;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="App-headerContent">
          <h1>CRM de WhatsApp</h1>
          <img className="App-headerLogo" src={winowinLogo} alt="Logo de WinoWin" />
        </div>
      </header>
      <div className="App-main">
        <ContactList
          contacts={contacts}
          onContactSelect={handleContactSelect}
          onCreateContact={handleCreateContact}
          onDeleteContact={handleDeleteContact}
          selectedId={selectedContactId}
          errorMessage={contactError}
        />
        <ConversationView
          conversation={conversation}
          messages={messages}
          newMessage={newMessage}
          onMessageChange={(e) => setNewMessage(e.target.value)}
          onSendMessage={handleSendMessage}
          onRefresh={handleRefreshCurrentView}
          onSimulateIncoming={handleSimulateIncoming}
          simulateMessage={simulateMessage}
          onSimulateMessageChange={(e) => setSimulateMessage(e.target.value)}
          selectedContact={selectedContact}
          selectedContactId={selectedContactId}
          actionError={actionError}
          actionInfo={actionInfo}
          isRefreshing={isRefreshing}
        />
      </div>
    </div>
  );
}

export default App;