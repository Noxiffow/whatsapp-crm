import React, { useState, useEffect } from 'react';
import ContactList from './components/ContactList';
import ConversationView from './components/ConversationView';
import './App.css';

function App() {
  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [contactError, setContactError] = useState('');

  const selectedContact = contacts.find((contact) => contact.id === selectedContactId) || null;

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const res = await fetch('/api/contactos/');
    const data = await res.json();
    setContacts(data);
  };

  const handleContactSelect = (contactId) => {
    setSelectedContactId(contactId);
    fetchConversation(contactId);
  };

  const handleRefreshCurrentView = async () => {
    await fetchContacts();
    if (selectedContactId) {
      await fetchConversation(selectedContactId);
    }
  };

  const fetchConversation = async (contactId) => {
    const res = await fetch(`/api/conversaciones/?contacto_id=${contactId}`);
    const data = await res.json();
    if (data.length > 0) {
      setConversation(data[0]);
      fetchMessages(data[0].id);
    } else {
      setConversation(null);
      setMessages([]);
    }
  };

  const fetchMessages = async (conversationId) => {
    const res = await fetch(`/api/mensajes/?conversacion_id=${conversationId}`);
    const data = await res.json();
    setMessages(data);
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>CRM de WhatsApp</h1>
      </header>
      <div className="App-main">
        <ContactList
          contacts={contacts}
          onContactSelect={handleContactSelect}
          onCreateContact={handleCreateContact}
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
        />
      </div>
    </div>
  );
}

export default App;
