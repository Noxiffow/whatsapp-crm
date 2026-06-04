import React, { useState, useEffect, useRef } from 'react';

const ConversationView = ({
  conversation,
  messages,
  newMessage,
  onMessageChange,
  onSendMessage,
  onRefresh,
  onDeleteChat,
  onDeleteContact,
  onCloseConversation,
  onSimulateIncoming,
  simulateMessage,
  onSimulateMessageChange,
  selectedContact,
  actionError,
  actionInfo,
  isRefreshing,
  isSending,
  onSaveNote,
}) => {
  const [localNote, setLocalNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const noteTimerRef = useRef(null);

  useEffect(() => {
    setLocalNote(selectedContact?.notes || '');
    setNoteSaved(false);
  }, [selectedContact]);

  const handleNoteBlur = async () => {
    if (!selectedContact || !onSaveNote) return;
    const trimmed = localNote.trim();
    if (trimmed === (selectedContact.notes || '').trim()) return;

    const saved = await onSaveNote(selectedContact.id, trimmed);
    if (saved) {
      setNoteSaved(true);
      if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
      noteTimerRef.current = setTimeout(() => setNoteSaved(false), 2000);
    }
  };

  const handleMessageKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSendMessage(event);
    }
  };

  const getDeliveryLabel = (msg) => {
    if (msg.direction !== 'outgoing') {
      return null;
    }

    const labels = {
      pending: 'pendiente',
      sent: 'enviado',
      delivered: 'entregado',
      error: 'error',
    };

    return labels[msg.delivery_status] || msg.delivery_status || null;
  };

  return (
    <div className="conversation-view">
      <button
        type="button"
        className="conversation-close-btn"
        onClick={onCloseConversation}
        aria-label="Cerrar conversación"
      >
        ×
      </button>
      <div className="conversation-header">
        <div>
          <h2>Conversación</h2>
          {selectedContact ? (
            <p className="selected-contact-name">
              {selectedContact.name} · {selectedContact.whatsapp_number}
            </p>
          ) : null}
        </div>
        <div className="conversation-actions">
          <button type="button" className="refresh-btn" onClick={onRefresh} disabled={isRefreshing}>
            {isRefreshing ? 'Actualizando...' : 'Refrescar'}
          </button>
          <button type="button" className="delete-chat-btn" onClick={onDeleteChat}>
            Eliminar chat
          </button>
          <button type="button" className="delete-contact-chat-btn" onClick={onDeleteContact}>
            Eliminar contacto
          </button>
        </div>
      </div>
      {actionError ? <div className="feedback feedback-error">{actionError}</div> : null}
      {!actionError && actionInfo ? <div className="feedback feedback-info">{actionInfo}</div> : null}
      {conversation ? (
        <div className="conversation-contact-info">
          <strong>Contacto ID:</strong> {conversation.contacto_id}<br />
          <strong>Activa:</strong> {conversation.is_active ? 'Sí' : 'No'}<br />
        </div>
      ) : (
        <div className="conversation-contact-info empty-state">
          No hay conversación activa para este contacto. Escribe el primer mensaje para iniciarla.
        </div>
      )}
      <div className="messages-container">
        <div className="messages-list messages">
          {messages.length === 0 ? (
            <p className="empty-messages">Todavía no hay mensajes en esta conversación.</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`msg ${msg.direction} msg-animated`}>
                <div className="msg-content">{msg.content}</div>
                <div className="msg-meta">
                  {msg.direction === 'incoming' ? 'Entrante' : 'Saliente'} ·
                  {new Date(msg.timestamp).toLocaleTimeString()} ·
                  {getDeliveryLabel(msg) ? ` ${getDeliveryLabel(msg)} ·` : ''}
                  {msg.is_read && msg.direction === 'incoming' && '(leído)'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {selectedContact ? (
        <div className="notes-section">
          <div className="notes-header">
            <span className="notes-label">Notas internas</span>
            {noteSaved ? <span className="notes-saved">Guardado ✓</span> : null}
          </div>
          <textarea
            className="notes-textarea"
            value={localNote}
            onChange={(e) => { setLocalNote(e.target.value); setNoteSaved(false); }}
            onBlur={handleNoteBlur}
            placeholder="Notas privadas sobre este contacto..."
            rows={3}
          />
        </div>
      ) : null}
      <form className="msg-form" onSubmit={onSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={onMessageChange}
          onKeyDown={handleMessageKeyDown}
          placeholder="Escribe un mensaje..."
          className="msg-input"
          disabled={isSending}
        />
        <button type="submit" className="msg-btn" disabled={isSending}>
          {isSending ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
};

export default ConversationView;
