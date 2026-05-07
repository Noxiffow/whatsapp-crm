import React, { useEffect, useState } from 'react';
import ContactList from './components/ContactList';
import ConversationView from './components/ConversationView';
import StatsView from './components/StatsView';
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
  const [activeView, setActiveView] = useState('crm');
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

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentContacts = contacts.filter((contact) => {
    if (!contact.created_at) {
      return false;
    }

    const createdAt = new Date(contact.created_at);
    if (Number.isNaN(createdAt.getTime())) {
      return false;
    }

    return createdAt >= thirtyDaysAgo;
  });

  const stats = recentContacts.reduce(
    (acc, contact) => {
      acc.total += 1;

      const normalizedStatus = String(contact.lead_status || '').trim().toLowerCase();
      if (normalizedStatus === 'nuevo') acc.nuevo += 1;
      if (normalizedStatus === 'contactado') acc.contactado += 1;
      if (normalizedStatus === 'cualificado') acc.cualificado += 1;
      if (normalizedStatus === 'perdido') acc.perdido += 1;

      return acc;
    },
    { total: 0, nuevo: 0, contactado: 0, cualificado: 0, perdido: 0 }
  );

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
    return data || [];
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
    setContactError('');
    setActionError('');
    setActionInfo('Vista actualizada.');
    setIsRefreshing(true);

    const refreshedContacts = await fetchContacts();

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

  const handleDeleteSelectedContact = async () => {
    if (!selectedContact) {
      setActionError('No hay ningún contacto seleccionado para eliminar.');
      return;
    }

    setActionError('');
    setActionInfo('');

    const { error } = await supabase.rpc('delete_contact_cascade', {
      p_contact_id: selectedContact.id,
    });

    if (error) {
      setActionError('No se pudo eliminar el contacto desde la capa segura de Supabase.');
      return;
    }

    setSelectedContactId(null);
    setConversation(null);
    setMessages([]);
    setNewMessage('');
    setActionInfo('Contacto eliminado correctamente.');
    await fetchContacts();
  };

  const handleDeleteChat = async () => {
    if (!selectedContactId || !selectedContact) {
      setActionError('No hay ningún contacto seleccionado.');
      return;
    }

    if (!conversation) {
      setActionError('');
      setActionInfo('No hay chat activo para eliminar.');
      setMessages([]);
      setNewMessage('');
      return;
    }

    const confirmed = window.confirm('¿Seguro que quieres eliminar este chat?');
    if (!confirmed) {
      return;
    }

    setActionError('');
    setActionInfo('');

    const { error: messagesError } = await supabase
      .from('mensajes')
      .delete()
      .eq('conversacion_id', conversation.id);

    if (messagesError) {
      setActionError('No se pudo eliminar el chat desde Supabase.');
      return;
    }

    const { error: conversationError } = await supabase
      .from('conversaciones')
      .update({ is_active: false })
      .eq('id', conversation.id);

    if (conversationError) {
      setActionError('No se pudo cerrar el chat en Supabase.');
      return;
    }

    setConversation(null);
    setMessages([]);
    setNewMessage('');
    setActionInfo('Chat eliminado correctamente.');
  };

  const handleCloseConversation = () => {
    setSelectedContactId(null);
    setConversation(null);
    setMessages([]);
    setNewMessage('');
    setActionError('');
    setActionInfo('');
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
    if (!newMessage.trim() || !selectedContactId || !selectedContact) return;
    setActionError('');
    setActionInfo('');
    const messageToSend = newMessage.trim();

    try {
      const response = await fetch('/api/meta/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId: selectedContactId,
          whatsappNumber: selectedContact.whatsapp_number,
          contactName: selectedContact.name,
          content: messageToSend,
        }),
      });

      const responseText = await response.text();
      let result = {};
      let hasValidJson = false;

      if (responseText) {
        try {
          result = JSON.parse(responseText);
          hasValidJson = true;
        } catch (parseError) {
          console.error('Respuesta no válida al enviar mensaje:', parseError, responseText);
        }
      } else {
        console.error('Respuesta vacía al enviar mensaje.');
      }

      if (!response.ok) {
        throw new Error(
          result.error ||
          (hasValidJson
            ? 'No se pudo enviar el mensaje con Meta.'
            : 'No se pudo contactar correctamente con el endpoint de envío.')
        );
      }

      setNewMessage('');
      setActionInfo('Mensaje enviado correctamente por Meta.');
      await fetchConversation(selectedContactId);
    } catch (error) {
      console.error('Error enviando mensaje desde frontend:', error);
      setActionError(error.message || 'No se pudo enviar el mensaje.');
    }
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
      setActionError(
        supabaseError.message || 'El contacto se creó en Supabase, pero no se pudo abrir su conversación.'
      );
      await fetchContacts();
      return true;
    }
  };

  const handleDeleteContact = async (contactId) => {
    const confirmed = window.confirm('¿Seguro que quieres eliminar este contacto?');
    if (!confirmed) {
      return false;
    }

    setContactError('');
    setActionError('');

    try {
      const { error } = await supabase.rpc('delete_contact_cascade', {
        p_contact_id: contactId,
      });

      if (error) {
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
      setActionInfo('Contacto eliminado correctamente.');
      return true;
    } catch (error) {
      setContactError(error.message || 'No se pudo eliminar el contacto.');
      setActionError(error.message || 'No se pudo eliminar el contacto.');
      return false;
    }
  };

  const handleUpdateContactStatus = async (contactId, leadStatus) => {
    setContactError('');
    setActionError('');

    const { error } = await supabase
      .from('contactos')
      .update({ lead_status: leadStatus })
      .eq('id', contactId);

    if (error) {
      setContactError('No se pudo actualizar el estado del contacto.');
      setActionError('No se pudo actualizar el estado del contacto.');
      return false;
    }

    setContacts((currentContacts) =>
      currentContacts.map((contact) =>
        contact.id === contactId ? { ...contact, lead_status: leadStatus } : contact
      )
    );
    setActionInfo('Estado del contacto actualizado.');
    return true;
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="App-headerContent">
          <div className="App-headerTitleGroup">
            <h1>ChatPanel CRM</h1>
            {activeView === 'crm' ? (
              <button
                type="button"
                className="header-nav-btn"
                onClick={() => setActiveView('stats')}
              >
                Estadísticas
              </button>
            ) : null}
          </div>
          <img className="App-headerLogo" src={winowinLogo} alt="Logo de WinoWin" />
        </div>
      </header>
      {activeView === 'crm' ? (
        <div className="App-main">
          <ContactList
            contacts={contacts}
            onContactSelect={handleContactSelect}
            onCreateContact={handleCreateContact}
            onDeleteContact={handleDeleteContact}
            onUpdateContactStatus={handleUpdateContactStatus}
            selectedId={selectedContactId}
            errorMessage={contactError}
          />
          {selectedContactId ? (
            <ConversationView
              conversation={conversation}
              messages={messages}
              newMessage={newMessage}
              onMessageChange={(e) => setNewMessage(e.target.value)}
              onSendMessage={handleSendMessage}
              onRefresh={handleRefreshCurrentView}
              onDeleteChat={handleDeleteChat}
              onDeleteContact={handleDeleteSelectedContact}
              onCloseConversation={handleCloseConversation}
              onSimulateIncoming={handleSimulateIncoming}
              simulateMessage={simulateMessage}
              onSimulateMessageChange={(e) => setSimulateMessage(e.target.value)}
              selectedContact={selectedContact}
              selectedContactId={selectedContactId}
              actionError={actionError}
              actionInfo={actionInfo}
              isRefreshing={isRefreshing}
            />
          ) : (
            <div className="conversation-view conversation-empty">
              <p>Selecciona un contacto para ver la conversación.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="App-main App-main-stats">
          <StatsView stats={stats} onBack={() => setActiveView('crm')} />
        </div>
      )}
    </div>
  );
}

export default App;
