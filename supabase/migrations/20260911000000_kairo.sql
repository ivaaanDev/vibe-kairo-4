-- Kairo · esquema inicial
-- Tareas, etiquetas y su relación N:M, aisladas por usuario con Row Level Security.

create table public.etiquetas (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nombre      text not null check (char_length(nombre) between 1 and 40 and nombre = btrim(nombre)),
  color       text not null check (color in ('pizarra','salvia','arena','ciruela','teja','bruma','musgo','grafito')),
  creada_en   timestamptz not null default now()
);

-- Nombres únicos por usuario sin distinguir mayúsculas.
create unique index etiquetas_nombre_unico on public.etiquetas (usuario_id, lower(nombre));

create table public.tareas (
  id                 uuid primary key default gen_random_uuid(),
  usuario_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titulo             text not null check (char_length(titulo) between 1 and 140),
  descripcion        text check (descripcion is null or char_length(descripcion) <= 500),
  fecha_vencimiento  date,
  hora_vencimiento   time,
  completada         boolean not null default false,
  completada_en      timestamptz,
  creada_en          timestamptz not null default now(),
  actualizada_en     timestamptz not null default now(),
  constraint hora_requiere_fecha check (hora_vencimiento is null or fecha_vencimiento is not null)
);

create index tareas_usuario_idx on public.tareas (usuario_id);

create table public.tareas_etiquetas (
  tarea_id     uuid not null references public.tareas (id) on delete cascade,
  etiqueta_id  uuid not null references public.etiquetas (id) on delete cascade,
  usuario_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  asignada_en  timestamptz not null default clock_timestamp(),
  primary key (tarea_id, etiqueta_id)
);

create index tareas_etiquetas_etiqueta_idx on public.tareas_etiquetas (etiqueta_id);

-- ─── Row Level Security ─────────────────────────────────────────────────────

alter table public.etiquetas enable row level security;
alter table public.tareas enable row level security;
alter table public.tareas_etiquetas enable row level security;

create policy "etiquetas propias" on public.etiquetas
  for all to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

create policy "tareas propias" on public.tareas
  for all to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

-- La relación exige que la tarea y la etiqueta pertenezcan al mismo usuario.
create policy "relaciones propias" on public.tareas_etiquetas
  for all to authenticated
  using (usuario_id = (select auth.uid()))
  with check (
    usuario_id = (select auth.uid())
    and exists (select 1 from public.tareas t where t.id = tarea_id and t.usuario_id = (select auth.uid()))
    and exists (select 1 from public.etiquetas e where e.id = etiqueta_id and e.usuario_id = (select auth.uid()))
  );

-- ─── Guardado atómico de una tarea con sus etiquetas ───────────────────────
-- SECURITY INVOKER: se ejecuta con los permisos del usuario, así que RLS sigue aplicando.

create or replace function public.guardar_tarea(
  p_id uuid,
  p_titulo text,
  p_descripcion text,
  p_fecha_vencimiento date,
  p_hora_vencimiento time,
  p_completada boolean,
  p_completada_en timestamptz,
  p_etiqueta_ids uuid[]
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.tareas set
    titulo = p_titulo,
    descripcion = p_descripcion,
    fecha_vencimiento = p_fecha_vencimiento,
    hora_vencimiento = p_hora_vencimiento,
    completada = p_completada,
    completada_en = p_completada_en,
    actualizada_en = now()
  where id = p_id;

  if not found then
    raise exception 'tarea no encontrada' using errcode = 'P0002';
  end if;

  -- Conserva el orden de asignación de las etiquetas que siguen presentes.
  delete from public.tareas_etiquetas
  where tarea_id = p_id and not (etiqueta_id = any (coalesce(p_etiqueta_ids, '{}')));

  insert into public.tareas_etiquetas (tarea_id, etiqueta_id)
  select p_id, ids.etiqueta_id
  from unnest(coalesce(p_etiqueta_ids, '{}')) with ordinality as ids (etiqueta_id, posicion)
  order by ids.posicion
  on conflict (tarea_id, etiqueta_id) do nothing;
end;
$$;

revoke execute on function public.guardar_tarea from public, anon;
grant execute on function public.guardar_tarea to authenticated;
