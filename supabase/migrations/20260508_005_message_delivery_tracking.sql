alter table mensajes
add column if not exists meta_message_id text,
add column if not exists meta_error_code text,
add column if not exists meta_error_message text;

create index if not exists idx_mensajes_meta_message_id
on mensajes(meta_message_id)
where meta_message_id is not null;
