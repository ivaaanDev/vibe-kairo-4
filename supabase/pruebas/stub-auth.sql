-- Solo para verificar la migración en un PostgreSQL sin Supabase.
-- Reproduce lo mínimo del entorno de Supabase: roles, auth.users, auth.uid()
-- y los privilegios por defecto que Supabase concede a `authenticated`.
-- NO ejecutar en un proyecto de Supabase real.

create role anon nologin;
create role authenticated nologin;

create schema auth;
create table auth.users (id uuid primary key);

create function auth.uid() returns uuid
language sql stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;

grant usage on schema auth to anon, authenticated;
grant usage on schema public to anon, authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges in schema public grant execute on functions to anon, authenticated;
