import React, { useState, useEffect } from 'react';
import ContactList from './components/ContactList';
import ConversationView from './components/ConversationView';
import './App.css';
import winowinLogo from './assets/winowin-logo.svg';

function App() {
  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [contactError, setContactError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedContact = contacts.find((contact) => contact.id === selectedContactId) || null;

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/contactos/', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('No se pudieron cargar los contactos.');
      }
      const data = await res.json();
      setContacts(data);
      setContactError('');
      return data;
    } catch (error) {
      setContactError('No se pudieron cargar los contactos.');
      return null;
    }
  };

  const handleContactSelect = (contactId) => {
    setSelectedContactId(contactId);
    fetchConversation(contactId);
  };

  const handleRefreshCurrentView = async () => {
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
    try {
      const res = await fetch(`/api/conversaciones/?contacto_id=${contactId}`, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('No se pudo cargar la conversación.');
      }
      const data = await res.json();
      if (data.length > 0) {
        setConversation(data[0]);
        await fetchMessages(data[0].id);
      } else {
        setConversation(null);
        setMessages([]);
      }
    } catch (error) {
      setConversation(null);
      setMessages([]);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const res = await fetch(`/api/mensajes/?conversacion_id=${conversationId}`, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('No se pudieron cargar los mensajes.');
      }
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      setMessages([]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContactId) return;

    let activeConversation = conversation;
    if (!conversation) {
      const convRes = await fetch('/api/conversaciones/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacto_id: selectedContactId }),
      });
      const convData = await convRes.json();
      activeConversation = convData;
      setConversation(convData);
    }

    const msgRes = await fetch(`/api/conversaciones/${activeConversation.id}/messages/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        direction: 'outgoing',
        content: newMessage,
      }),
    });
    const msgData = await msgRes.json();
    setMessages([...messages, msgData]);
    setNewMessage('');
    fetchMessages(activeConversation.id);
  };

  const handleCreateContact = async ({ name, whatsappNumber, leadStatus }) => {
    setContactError('');

    const response = await fetch('/api/contactos/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        whatsapp_number: whatsappNumber,
        lead_status: leadStatus,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      setContactError(errorData.detail || 'No se pudo crear el contacto.');
      return false;
    }

    const newContact = await response.json();
    await fetchContacts();
    handleContactSelect(newContact.id);
    return true;
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
          selectedContact={selectedContact}
          selectedContactId={selectedContactId}
          isRefreshing={isRefreshing}
        />
      </div>
    </div>
  );
}

export default App;