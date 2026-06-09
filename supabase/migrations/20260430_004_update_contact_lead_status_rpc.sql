create or replace function public.update_contact_lead_status(
  p_contact_id bigint,
  p_new_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_normalized_status text;
  v_exists boolean;
begin
  v_normalized_status := lower(trim(p_new_status));

  if v_normalized_status not in ('nuevo', 'contactado', 'cualificado', 'perdido') then
    raise exception 'Estado no válido'
      using errcode = '22023';
  end if;

  select exists (
    select 1
    from public.contactos
    where id = p_contact_id
  ) into v_exists;

  if not v_exists then
    raise exception 'Contacto no encontrado'
      using errcode = 'P0002';
  end if;

  update public.contactos
  set
    lead_status = v_normalized_status,
    updated_at = now()
  where id = p_contact_id;

  return jsonb_build_object(
    'ok', true,
    'contact_id', p_contact_id,
    'lead_status', v_normalized_status
  );
end;
$$;

revoke all on function public.update_contact_lead_status(bigint, text) from public;
grant execute on function public.update_contact_lead_status(bigint, text) to anon;
