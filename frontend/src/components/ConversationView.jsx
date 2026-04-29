import React from 'react';

const ConversationView = ({
  conversation,
  messages,
  newMessage,
  onMessageChange,
  onSendMessage,
  onRefresh,
  selectedContact,
  selectedContactId,
  isRefreshing,
}) => {
  if (!selectedContactId) {
    return <p>Selecciona un contacto para ver la conversación.</p>
  }

  return (
    <div className="conversation-view">
      <div className="conversation-header">
        <div>
          <h2>Conversación</h2>
          {selectedContact ? (
            <p className="selected-contact-name">
              {selectedContact.name} · {selectedContact.whatsapp_number}
            </p>
          ) : null}
        </div>
        <button type="button" className="refresh-btn" onClick={onRefresh} disabled={isRefreshing}>
          {isRefreshing ? 'Actualizando...' : 'Refrescar'}
        </button>
      </div>
      {conversation ? (
        <div className="contact-info">
          <strong>Contacto ID:</strong> {conversation.contacto_id}<br />
          <strong>Activa:</strong> {conversation.is_active ? 'Sí' : 'No'}
        </div>
      ) : (
        <div className="contact-info empty-state">
          No hay conversación activa para este contacto. Escribe el primer mensaje para iniciarla.
        </div>
      )}
      <div className="messages">
        {messages.length === 0 ? (
          <p className="empty-messages">Todavía no hay mensajes en esta conversación.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`msg ${msg.direction}`}>
              <div className="msg-content">{msg.content}</div>
              <div className="msg-meta">
                {msg.direction === 'incoming' ? 'Entrante' : 'Saliente'} ·
                {new Date(msg.timestamp).toLocaleTimeString()} ·
                {msg.is_read && msg.direction === 'incoming' && '(leído)'}
              </div>
            </div>
          ))
        )}
      </div>
      <form className="msg-form" onSubmit={onSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={onMessageChange}
          placeholder="Escribe un mensaje..."
          className="msg-input"
        />
        <button type="submit" className="msg-btn">Enviar</button>
      </form>
    </div>
  );
};

export default ConversationView;