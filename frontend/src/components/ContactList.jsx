import React, { useState } from 'react';

const ContactList = ({ contacts, onContactSelect, onCreateContact, selectedId, errorMessage }) => {
  const [name, setName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [leadStatus, setLeadStatus] = useState('nuevo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !whatsappNumber.trim()) return;

    setIsSubmitting(true);
    const created = await onCreateContact({
      name: name.trim(),
      whatsappNumber: whatsappNumber.trim(),
      leadStatus,
    });

    if (created) {
      setName('');
      setWhatsappNumber('');
      setLeadStatus('nuevo');
    }

    setIsSubmitting(false);
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
      <ul>
        {contacts.map((contact) => (
          <li
            key={contact.id}
            className={selectedId === contact.id ? 'selected' : ''}
            onClick={() => onContactSelect(contact.id)}
          >
            {contact.name} ({contact.whatsapp_number})
            <br />
            <small>{contact.lead_status}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContactList;
