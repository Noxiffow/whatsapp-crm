import React, { useState, useEffect, useRef } from 'react';

const TIPO_CONFIG = {
  cambio_estado: { icon: '🔄', label: 'Cambio de estado' },
  nota: { icon: '📝', label: 'Nota' },
  mensaje: { icon: '💬', label: 'Mensaje' },
};

function ConversationView({
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
  isRefreshing,
  isSending,
  onSaveNote,
  actividad,
  showTimeline,
  onToggleTimeline,
}) {
  const [localNote, setLocalNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const noteTimerRef = useRef(null);

  useEffect(() => {
    setLocalNote(selectedContact?.notes || '');
    setNoteSaved(false);
    setNotesOpen(false);
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
    if (msg.direction !== 'outgoing') return null;
    const labels = { pending: 'pendiente', sent: 'enviado', delivered: 'entregado', error: 'error' };
    return labels[msg.delivery_status] || msg.delivery_status || null;
  };

  const hasNotes = (selectedContact?.notes || '').trim().length > 0;

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) + ' · ' +
           d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`conversation-view ${showTimeline ? 'has-timeline-open' : ''}`}>
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
          <button type="button" className="refresh-btn" onClick={onRefresh} disabled={isRefreshing} title="Refrescar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={isRefreshing ? 'spin' : ''}>
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
          <button
            type="button"
            className={`timeline-toggle-btn ${showTimeline ? 'active' : ''}`}
            onClick={onToggleTimeline}
            title="Historial"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>
          <button type="button" className="delete-chat-btn" onClick={onDeleteChat}>
            Eliminar chat
          </button>
          <button type="button" className="delete-contact-chat-btn" onClick={onDeleteContact}>
            Eliminar contacto
          </button>
        </div>
      </div>
      {actionError ? (
        <div className="feedback feedback-error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0, marginTop: 1}}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{actionError}</span>
        </div>
      ) : null}
      {selectedContact ? (
        <div className="conversation-contact-info">
          <span className="contact-info-pill">ID: {selectedContact.id}</span>
          <span className="contact-info-pill">{conversation?.is_active ? 'Activa' : 'Inactiva'}</span>
          <button
            type="button"
            className={`notes-toggle ${notesOpen ? 'notes-toggle-open' : ''} ${hasNotes ? 'notes-toggle-filled' : ''}`}
            onClick={() => setNotesOpen(!notesOpen)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Notas{hasNotes ? ' (' + (selectedContact.notes || '').trim().length + ')' : ''}
          </button>
        </div>
      ) : (
        <div className="conversation-contact-info empty-state">
          No hay conversación activa. Escribe el primer mensaje para iniciarla.
        </div>
      )}
      {notesOpen && selectedContact ? (
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
      <div className="conversation-body">
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
                    {msg.delivery_status === 'error' ? (
                      <span className="msg-error-dot" title="Error al enviar"> ⚠</span>
                    ) : null}
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

      {/* ── Timeline panel ── */}
      {showTimeline && selectedContact ? (
        <>
          <div className="timeline-backdrop" onClick={onToggleTimeline} />
          <aside className="timeline-panel">
            <div className="timeline-header">
              <h3>Historial de actividad</h3>
              <button type="button" className="timeline-close-btn" onClick={onToggleTimeline} aria-label="Cerrar historial">
                ×
              </button>
            </div>
            <div className="timeline-body">
              {actividad.length === 0 ? (
                <p className="timeline-empty">Sin actividad registrada todavía. Los cambios de estado y notas aparecerán aquí.</p>
              ) : (
                <ul className="timeline-list">
                  {actividad.map((act) => {
                    const config = TIPO_CONFIG[act.tipo] || { icon: '📌', label: act.tipo };
                    return (
                      <li key={act.id} className="timeline-item">
                        <div className="timeline-dot" />
                        <div className="timeline-content">
                          <div className="timeline-event-header">
                            <span className="timeline-icon">{config.icon}</span>
                            <span className="timeline-type">{config.label}</span>
                          </div>
                          <p className="timeline-desc">{act.descripcion}</p>
                          <time className="timeline-time">{formatTime(act.created_at)}</time>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}

export default ConversationView;
