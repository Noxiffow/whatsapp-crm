drop policy if exists "anon_delete_contactos" on public.contactos;
drop policy if exists "anon_delete_conversaciones" on public.conversaciones;
drop policy if exists "anon_delete_mensajes" on public.mensajes;

create or replace function public.delete_contact_cascade(p_contact_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_exists boolean;
begin
  select exists (
    select 1
    from public.contactos
    where id = p_contact_id
  ) into v_exists;

  if not v_exists then
    raise exception 'Contacto no encontrado'
      using errcode = 'P0002';
  end if;

  delete from public.contactos
  where id = p_contact_id;

  return jsonb_build_object(
    'ok', true,
    'deleted_contact_id', p_contact_id
  );
end;
$$;

revoke all on function public.delete_contact_cascade(bigint) from public;
grant execute on function public.delete_contact_cascade(bigint) to anon;
