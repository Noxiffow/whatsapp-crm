import React, { useState } from 'react';

const ContactList = ({ contacts, onContactSelect, onCreateContact, onDeleteContact, selectedId, errorMessage }) => {
  const [name, setName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [leadStatus, setLeadStatus] = useState('nuevo');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('todos');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingContactId, setDeletingContactId] = useState(null);

  const getContactStatus = (contact) =>
    String(contact.lead_status ?? contact.estado ?? contact.status ?? '').toLowerCase();
  const normalizeSearchValue = (value) =>
    String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  const normalizePhoneValue = (value) =>
    String(value ?? '').replace(/[^\d]/g, '');

  const statusCounts = contacts.reduce(
    (acc, contact) => {
      const contactStatus = getContactStatus(contact);
      acc.todos += 1;
      if (Object.prototype.hasOwnProperty.call(acc, contactStatus)) {
        acc[contactStatus] += 1;
      }
      return acc;
    },
    {
      todos: 0,
      nuevo: 0,
      contactado: 0,
      cualificado: 0,
      perdido: 0,
    }
  );

  const statusFilters = [
    { value: 'todos', label: 'Todos', count: statusCounts.todos },
    { value: 'nuevo', label: 'Nuevo', count: statusCounts.nuevo },
    { value: 'contactado', label: 'Contactado', count: statusCounts.contactado },
    { value: 'cualificado', label: 'Cualificado', count: statusCounts.cualificado },
    { value: 'perdido', label: 'Perdido', count: statusCounts.perdido },
  ];
  const selectedStatusOption =
    statusFilters.find((filter) => filter.value === selectedStatusFilter) ?? statusFilters[0];
  const statusCountTextMap = {
    todos: `Total contactos: ${statusCounts.todos}`,
    nuevo: `Total nuevos: ${statusCounts.nuevo}`,
    contactado: `Total contactados: ${statusCounts.contactado}`,
    cualificado: `Total cualificados: ${statusCounts.cualificado}`,
    perdido: `Total perdidos: ${statusCounts.perdido}`,
  };

  const normalizedSearchTerm = normalizeSearchValue(searchTerm);
  const normalizedSearchPhone = normalizePhoneValue(searchTerm);
  const filteredContacts = contacts.filter((contact) => {
    const contactName = normalizeSearchValue(contact.name ?? contact.nombre ?? '');
    const contactPhone = normalizeSearchValue(
      contact.whatsapp_number ?? contact.telefono ?? contact.phone ?? ''
    );
    const contactPhoneDigits = normalizePhoneValue(
      contact.whatsapp_number ?? contact.telefono ?? contact.phone ?? ''
    );
    const contactStatus = getContactStatus(contact);

    const matchesSearch =
      !normalizedSearchTerm ||
      contactName.includes(normalizedSearchTerm) ||
      contactPhone.includes(normalizedSearchTerm) ||
      (!!normalizedSearchPhone && contactPhoneDigits.includes(normalizedSearchPhone));

    const matchesStatus =
      selectedStatusFilter === 'todos' || contactStatus === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !whatsappNumber.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await onCreateContact({
        name: name.trim(),
        whatsappNumber: whatsappNumber.trim(),
        leadStatus,
      });

      if (created) {
        setName('');
        setWhatsappNumber('');
        setLeadStatus('nuevo');
        setSearchTerm('');
        setSelectedStatusFilter('todos');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async (e, contact) => {
    e.stopPropagation();
    if (!onDeleteContact) {
      return;
    }

    const contactId = contact.id ?? contact.contacto_id ?? contact.contactoId;
    console.log('Delete contact object:', contact);
    console.log('Delete ID candidates:', {
      id: contact.id,
      contacto_id: contact.contacto_id,
      contactoId: contact.contactoId,
      resolvedId: contactId,
    });

    setDeletingContactId(contactId);
    await onDeleteContact(contactId);
    setDeletingContactId(null);
  };

  return (
    <div className="contact-list">
      <h2>Contactos</h2>
      <form className="contact-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del contacto"
        />
        <input
          type="text"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          placeholder="+34..."
        />
        <select value={leadStatus} onChange={(e) => setLeadStatus(e.target.value)}>
          <option value="nuevo">Nuevo</option>
          <option value="contactado">Contactado</option>
          <option value="cualificado">Cualificado</option>
          <option value="perdido">Perdido</option>
        </select>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creando...' : 'Crear contacto'}
        </button>
      </form>
      {errorMessage ? <p className="contact-form-error">{errorMessage}</p> : null}
      <input
        type="text"
        className="contact-search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar por nombre o teléfono..."
      />
      <select
        className="contact-status-select"
        value={selectedStatusFilter}
        onChange={(e) => setSelectedStatusFilter(e.target.value)}
        aria-label="Filtrar contactos por estado"
      >
        {statusFilters.map((filter) => (
          <option key={filter.value} value={filter.value}>
            {filter.label}
          </option>
        ))}
      </select>
      <div className={`contact-status-summary contact-status-summary-${selectedStatusOption.value}`}>
        {statusCountTextMap[selectedStatusOption.value]}
      </div>
      <ul>
        {filteredContacts.length === 0 ? (
          <li className="contact-list-empty">
            {selectedStatusFilter !== 'todos' ? 'No hay contactos con este filtro' : 'No se encontraron contactos'}
          </li>
        ) : (
          filteredContacts.map((contact) => {
            const resolvedId = contact.id ?? contact.contacto_id ?? contact.contactoId;

            return (
              <li
                key={resolvedId}
                className={selectedId === resolvedId ? 'selected' : ''}
                onClick={() => onContactSelect(resolvedId)}
              >
                <div className="contact-card-main">
                  <div className="contact-card-name">{contact.name} ({contact.whatsapp_number})</div>
                  <small className={`status-badge status-${contact.lead_status}`}>{contact.lead_status}</small>
                </div>
                <button
                  type="button"
                  className="delete-contact-btn"
                  onClick={(e) => handleDeleteClick(e, contact)}
                  disabled={deletingContactId === resolvedId}
                >
                  {deletingContactId === resolvedId ? 'Eliminando...' : 'Eliminar'}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};

export default ContactList;
