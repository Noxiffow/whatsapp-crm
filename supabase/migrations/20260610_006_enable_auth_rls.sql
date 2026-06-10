-- Eliminar políticas anon existentes
drop policy if exists "anon_delete_contactos" on public.contactos;
drop policy if exists "anon_delete_conversaciones" on public.conversaciones;
drop policy if exists "anon_delete_mensajes" on public.mensajes;
drop policy if exists "anon_insert_contactos" on public.contactos;
drop policy if exists "anon_select_contactos" on public.contactos;
drop policy if exists "anon_update_contactos" on public.contactos;
drop policy if exists "anon_insert_conversaciones" on public.conversaciones;
drop policy if exists "anon_select_conversaciones" on public.conversaciones;
drop policy if exists "anon_update_conversaciones" on public.conversaciones;
drop policy if exists "anon_insert_mensajes" on public.mensajes;
drop policy if exists "anon_select_mensajes" on public.mensajes;
drop policy if exists "anon_update_mensajes" on public.mensajes;
drop policy if exists "anon_select_actividad" on public.actividad;
drop policy if exists "anon_insert_actividad" on public.actividad;
drop policy if exists "anon_update_actividad" on public.actividad;
drop policy if exists "anon_delete_actividad" on public.actividad;

-- Habilitar RLS en todas las tablas
alter table public.contactos enable row level security;
alter table public.conversaciones enable row level security;
alter table public.mensajes enable row level security;

-- Intentar habilitar RLS en actividad (si existe)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'actividad'
  ) then
    execute 'alter table public.actividad enable row level security';
  end if;
end $$;

-- ── POLÍTICAS: solo usuarios autenticados ──

-- contactos
create policy "authenticated_select_contactos" on public.contactos
  for select to authenticated using (true);

create policy "authenticated_insert_contactos" on public.contactos
  for insert to authenticated with check (true);

create policy "authenticated_update_contactos" on public.contactos
  for update to authenticated using (true);

create policy "authenticated_delete_contactos" on public.contactos
  for delete to authenticated using (true);

-- conversaciones
create policy "authenticated_select_conversaciones" on public.conversaciones
  for select to authenticated using (true);

create policy "authenticated_insert_conversaciones" on public.conversaciones
  for insert to authenticated with check (true);

create policy "authenticated_update_conversaciones" on public.conversaciones
  for update to authenticated using (true);

create policy "authenticated_delete_conversaciones" on public.conversaciones
  for delete to authenticated using (true);

-- mensajes
create policy "authenticated_select_mensajes" on public.mensajes
  for select to authenticated using (true);

create policy "authenticated_insert_mensajes" on public.mensajes
  for insert to authenticated with check (true);

create policy "authenticated_update_mensajes" on public.mensajes
  for update to authenticated using (true);

create policy "authenticated_delete_mensajes" on public.mensajes
  for delete to authenticated using (true);

-- actividad (si existe)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'actividad'
  ) then
    execute 'create policy "authenticated_select_actividad" on public.actividad for select to authenticated using (true)';
    execute 'create policy "authenticated_insert_actividad" on public.actividad for insert to authenticated with check (true)';
    execute 'create policy "authenticated_update_actividad" on public.actividad for update to authenticated using (true)';
    execute 'create policy "authenticated_delete_actividad" on public.actividad for delete to authenticated using (true)';
  end if;
end $$;

-- Actualizar funciones RPC: solo authenticated (no anon)
revoke all on function public.delete_contact_cascade(bigint) from public;
grant execute on function public.delete_contact_cascade(bigint) to authenticated;

revoke all on function public.update_contact_lead_status(bigint, text) from public;
grant execute on function public.update_contact_lead_status(bigint, text) to authenticated;
