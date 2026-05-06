import React from 'react';

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
}) => {
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
          <strong>Mensajes cargados:</strong> {messages.length}
        </div>
      ) : (
        <div className="conversation-contact-info empty-state">
          No hay conversación activa para este contacto. Escribe el primer mensaje para iniciarla.
        </div>
      )}
      <div className="testing-guide">
        <strong>Flujo de prueba:</strong> 1. Selecciona un contacto. 2. Simula un mensaje entrante. 3. Responde desde el CRM.
      </div>
      <div className="simulator-box">
        <label className="simulator-label" htmlFor="simulate-message">
          Simular mensaje entrante
        </label>
        <div className="simulator-row">
          <input
            id="simulate-message"
            type="text"
            value={simulateMessage}
            onChange={onSimulateMessageChange}
            placeholder="Escribe el mensaje que enviaría el cliente..."
            className="msg-input"
          />
          <button type="button" className="refresh-btn" onClick={onSimulateIncoming}>
            Simular
          </button>
        </div>
      </div>
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
                  {msg.is_read && msg.direction === 'incoming' && '(leído)'}
                </div>
              </div>
            ))
          )}
        </div>
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
