create table if not exists contactos (
  id bigint generated always as identity primary key,
  whatsapp_number text not null unique,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  lead_status text not null default 'nuevo',
  notes text
);

create table if not exists conversaciones (
  id bigint generated always as identity primary key,
  contacto_id bigint not null references contactos(id) on delete cascade,
  started_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  is_active boolean not null default true
);

create table if not exists mensajes (
  id bigint generated always as identity primary key,
  conversacion_id bigint not null references conversaciones(id) on delete cascade,
  direction text not null check (direction in ('incoming', 'outgoing')),
  content text not null,
  timestamp timestamptz not null default now(),
  received_at timestamptz not null default now(),
  is_read boolean not null default false,
  delivery_status text not null default 'pending'
);

create index if not exists idx_contactos_whatsapp_number on contactos(whatsapp_number);
create index if not exists idx_conversaciones_contacto_id on conversaciones(contacto_id);
create index if not exists idx_mensajes_conversacion_id on mensajes(conversacion_id);

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_contactos_updated_at on contactos;

create trigger set_contactos_updated_at
before update on contactos
for each row
execute function update_updated_at_column();
