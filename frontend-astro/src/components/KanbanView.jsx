import React, { useState, useRef } from 'react';

const STATUS_CONFIG = {
  nuevo: { label: 'Nuevo', color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' },
  contactado: { label: 'Contactado', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  cualificado: { label: 'Cualificado', color: '#15803d', bg: '#ecfdf3', border: '#bbf7d0' },
  perdido: { label: 'Perdido', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

function KanbanView({ contacts, onUpdateContactStatus, onContactSelect, onBack, actionInfo }) {
  const [draggedContactId, setDraggedContactId] = useState(null);
  const [dropTargetStatus, setDropTargetStatus] = useState(null);
  const dragCounter = useRef(0);

  const columns = ['nuevo', 'contactado', 'cualificado', 'perdido'];

  const contactsByStatus = columns.reduce((acc, status) => {
    acc[status] = contacts.filter(
      (c) => (c.lead_status || '').toLowerCase() === status
    );
    return acc;
  }, {});

  const handleDragStart = (e, contactId) => {
    setDraggedContactId(contactId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', contactId);
  };

  const handleDragEnd = () => {
    setDraggedContactId(null);
    setDropTargetStatus(null);
  };

  const handleDragEnter = (e, status) => {
    e.preventDefault();
    dragCounter.current += 1;
    if (draggedContactId) {
      const contact = contacts.find((c) => c.id === draggedContactId);
      if (contact && (contact.lead_status || '').toLowerCase() !== status) {
        setDropTargetStatus(status);
      }
    }
  };

  const handleDragLeave = (e) => {
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setDropTargetStatus(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, status) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDropTargetStatus(null);

    const contactId = e.dataTransfer.getData('text/plain');
    if (!contactId) return;

    const contact = contacts.find((c) => c.id === contactId || String(c.id) === contactId);
    if (!contact) return;

    const currentStatus = (contact.lead_status || '').toLowerCase();
    if (currentStatus === status) return;

    await onUpdateContactStatus(contactId, status);
  };

  return (
    <div className="kanban-view">
      <div className="kanban-header">
        <div>
          <h2>Pipeline de contactos</h2>
          <p className="kanban-subtitle">Arrastra contactos entre columnas para cambiar su estado.</p>
        </div>
        <button type="button" className="stats-nav-btn" onClick={onBack}>
          Volver al CRM
        </button>
      </div>
      {actionInfo ? <div className="feedback feedback-info">{actionInfo}</div> : null}
      <div className="kanban-board">
        {columns.map((status) => {
          const config = STATUS_CONFIG[status];
          const isTarget = dropTargetStatus === status;
          const columnContacts = contactsByStatus[status] || [];

          return (
            <div
              key={status}
              className={`kanban-column ${isTarget ? 'kanban-column-target' : ''}`}
              style={{ borderColor: isTarget ? config.color : config.border }}
              onDragEnter={(e) => handleDragEnter(e, status)}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="kanban-column-header" style={{ background: config.bg, borderColor: config.border }}>
                <span className="kanban-column-title" style={{ color: config.color }}>
                  {config.label}
                </span>
                <span className="kanban-column-count" style={{ background: config.color }}>
                  {columnContacts.length}
                </span>
              </div>
              <div className="kanban-column-body">
                {columnContacts.length === 0 ? (
                  <div className="kanban-empty">Sin contactos</div>
                ) : (
                  columnContacts.map((contact) => {
                    const contactId = contact.id ?? contact.contacto_id;
                    const isDragging = draggedContactId === contactId;

                    return (
                      <div
                        key={contactId}
                        className={`kanban-card ${isDragging ? 'kanban-card-dragging' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, contactId)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onContactSelect(contactId)}
                      >
                        <div className="kanban-card-name">{contact.name}</div>
                        <div className="kanban-card-phone">{contact.whatsapp_number}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default KanbanView;
