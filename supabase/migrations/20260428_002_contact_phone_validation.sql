update contactos
set whatsapp_number = regexp_replace(whatsapp_number, '[\s\-\(\)]', '', 'g');

alter table contactos
drop constraint if exists contactos_whatsapp_number_format_check;

alter table contactos
add constraint contactos_whatsapp_number_format_check
check (whatsapp_number ~ '^\+[1-9][0-9]{8,14}$');
