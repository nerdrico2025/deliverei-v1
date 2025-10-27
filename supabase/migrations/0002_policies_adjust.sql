-- Migration incremental para ajustar RLS policies com comparações em texto
-- Evita erros de tipo: "operator does not exist: uuid = text"

-- Empresas: usuário só enxerga a própria empresa
DROP POLICY IF EXISTS empresas_select_own ON public.empresas;
CREATE POLICY empresas_select_own ON public.empresas
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u."empresaId"::text = empresas.id::text
      AND u.id::text = auth.uid()::text
  )
);

-- Usuários: cada usuário só pode selecionar a si mesmo
DROP POLICY IF EXISTS usuarios_select_self ON public.usuarios;
CREATE POLICY usuarios_select_self ON public.usuarios
FOR SELECT
USING (id::text = auth.uid()::text);