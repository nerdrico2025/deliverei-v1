-- Adiciona colunas 'email' e 'senha' na tabela public.usuarios para compatibilidade com o backend
-- Observação: usa colunas NULL inicialmente para não quebrar registros existentes; novas inserções devem preencher

alter table public.usuarios
  add column if not exists email text,
  add column if not exists senha text;

-- Índice e unicidade em email (se preferir evitar conflitos, ajuste conforme necessário)
create unique index if not exists usuarios_email_unique_idx on public.usuarios (email) where email is not null;

-- Opcional: definir valores padrão para registros existentes (não recomendado para produção)
-- update public.usuarios set email = concat('placeholder-', id, '@example.com') where email is null;
-- update public.usuarios set senha = '' where senha is null;