-- Verificación de Row Level Security y de guardar_tarea.
-- Se ejecuta dentro de una transacción que se revierte: no deja datos.
-- Funciona en Supabase (SQL editor) y en el PostgreSQL de verificación con stub-auth.sql.

begin;

insert into auth.users (id) values
  ('11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222');

set local role authenticated;

-- ─── Usuaria A crea una tarea con dos etiquetas ────────────────────────────
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);

insert into public.etiquetas (id, nombre, color) values
  ('a0000000-0000-4000-8000-000000000001', 'Trabajo', 'pizarra'),
  ('a0000000-0000-4000-8000-000000000002', 'Casa', 'arena');
insert into public.tareas (id, titulo) values ('a0000000-0000-4000-8000-0000000000a1', 'Informe de A');

select public.guardar_tarea(
  'a0000000-0000-4000-8000-0000000000a1', 'Informe de A', null, '2026-09-10', '09:00', false, null,
  array['a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002']::uuid[]
);

do $$
begin
  if (select count(*) from public.tareas_etiquetas) <> 2 then
    raise exception 'guardar_tarea no asignó las dos etiquetas';
  end if;
  if (select usuario_id from public.tareas limit 1) <> auth.uid() then
    raise exception 'usuario_id no se tomó de auth.uid()';
  end if;
end $$;

-- La hora exige fecha.
do $$
begin
  begin
    update public.tareas set fecha_vencimiento = null where id = 'a0000000-0000-4000-8000-0000000000a1';
    raise exception 'se permitió hora sin fecha';
  exception when check_violation then null;
  end;
end $$;

-- El título respeta 1–140 caracteres.
do $$
begin
  begin
    insert into public.tareas (titulo) values (repeat('x', 141));
    raise exception 'se permitió un título de 141 caracteres';
  exception when check_violation then null;
  end;
end $$;

-- ─── Usuario B no ve ni toca nada de A ─────────────────────────────────────
select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}', true);

do $$
declare
  filas integer;
begin
  if (select count(*) from public.tareas) <> 0 then raise exception 'RLS: B ve tareas de A'; end if;
  if (select count(*) from public.etiquetas) <> 0 then raise exception 'RLS: B ve etiquetas de A'; end if;
  if (select count(*) from public.tareas_etiquetas) <> 0 then raise exception 'RLS: B ve relaciones de A'; end if;

  update public.tareas set titulo = 'hackeada' where id = 'a0000000-0000-4000-8000-0000000000a1';
  get diagnostics filas = row_count;
  if filas <> 0 then raise exception 'RLS: B modificó una tarea de A'; end if;

  delete from public.etiquetas where id = 'a0000000-0000-4000-8000-000000000001';
  get diagnostics filas = row_count;
  if filas <> 0 then raise exception 'RLS: B eliminó una etiqueta de A'; end if;

  -- guardar_tarea es SECURITY INVOKER: sobre una tarea ajena no encuentra la fila.
  begin
    perform public.guardar_tarea('a0000000-0000-4000-8000-0000000000a1', 'x', null, null, null, false, null, '{}');
    raise exception 'RLS: B ejecutó guardar_tarea sobre una tarea de A';
  exception when no_data_found then null;
  end;
end $$;

-- B no puede enlazar una etiqueta de A a su propia tarea.
insert into public.tareas (id, titulo) values ('b0000000-0000-4000-8000-0000000000b1', 'Tarea de B');
do $$
begin
  begin
    insert into public.tareas_etiquetas (tarea_id, etiqueta_id) values
      ('b0000000-0000-4000-8000-0000000000b1', 'a0000000-0000-4000-8000-000000000001');
    raise exception 'RLS: B enlazó una etiqueta ajena';
  exception when insufficient_privilege then null;
  end;
end $$;

-- ─── Eliminar una etiqueta conserva la tarea ───────────────────────────────
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
delete from public.etiquetas where id = 'a0000000-0000-4000-8000-000000000001';
do $$
begin
  if (select count(*) from public.tareas where id = 'a0000000-0000-4000-8000-0000000000a1') <> 1 then
    raise exception 'eliminar una etiqueta eliminó la tarea';
  end if;
  if (select count(*) from public.tareas_etiquetas) <> 1 then
    raise exception 'la relación con la etiqueta eliminada no desapareció';
  end if;
end $$;

select 'RLS y reglas de datos verificadas' as resultado;

rollback;
