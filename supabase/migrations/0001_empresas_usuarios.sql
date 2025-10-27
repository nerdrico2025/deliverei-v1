-- Extensão para gen_random_uuid()
create extension if not exists "pgcrypto";

-- Tabela de empresas
create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  email text not null,
  telefone text,
  endereco text,
  cidade text,
  estado text,
  cep text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists empresas_slug_idx on public.empresas (slug);

-- Tabela de usuários (perfil), vinculada ao auth.users
create table if not exists public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  "empresaId" uuid not null references public.empresas(id) on delete cascade,
  nome text not null,
  telefone text,
  tipo text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Habilitar RLS
alter table public.empresas enable row level security;
alter table public.usuarios enable row level security;

-- Trigger para updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists empresas_updated_at on public.empresas;
create trigger empresas_updated_at
before update on public.empresas
for each row
execute procedure public.set_updated_at();

drop trigger if exists usuarios_updated_at on public.usuarios;
create trigger usuarios_updated_at
before update on public.usuarios
for each row
execute procedure public.set_updated_at();

-- Políticas de acesso
-- Empresas: ler somente empresas às quais o usuário pertence
drop policy if exists empresas_select_own on public.empresas;
create policy empresas_select_own on public.empresas
for select
using (
  exists (
    select 1
    from public.usuarios u
    where u."empresaId"::text = empresas.id::text
      and u.id::text = auth.uid()::text
  )
);

-- Usuários: ler somente o próprio perfil
drop policy if exists usuarios_select_self on public.usuarios;
create policy usuarios_select_self on public.usuarios
for select
using (id::text = auth.uid()::text);