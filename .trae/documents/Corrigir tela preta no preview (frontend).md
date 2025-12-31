# Diagnóstico inicial
- A aplicação monta em `src/main.tsx:14-20` via `createRoot` dentro de `index.html:10` (`#root`).
- O roteamento está em `src/App.tsx:19-31` com `BrowserRouter` e `AppRouter` (`src/routes/AppRouter.tsx:74-127`). A rota `/` renderiza `Home` (`src/routes/public.routes.tsx:21-23`).
- O fallback de `Suspense` mostra “Carregando...” em tela cheia; se nada aparece, é provável erro em tempo de execução antes/ao carregar rotas.
- `Sentry.init` é chamado incondicionalmente em `src/main.tsx:8-12`. Se `VITE_SENTRY_DSN` estiver ausente/inválida, algumas versões do SDK podem lançar erro e interromper a renderização.

# Plano de correção
## 1) Inicialização defensiva do Sentry
- Alterar `src/main.tsx` para só inicializar o Sentry quando `import.meta.env.VITE_SENTRY_DSN` estiver presente e válida.
- Racional: evita crash de boot causado por DSN ausente/ inválida.

## 2) Error Boundary global
- Criar `src/components/util/ErrorBoundary.tsx` e envolver o `AppRouter` em `src/App.tsx` (dentro dos providers), exibindo um fallback visível com mensagem e botão de tentar novamente.
- Racional: captura erros de importação lazy e runtime nas rotas, evitando tela preta e mostrando contexto para depuração.

## 3) Rota de saúde para validação
- Adicionar uma rota simples `/__health` em `src/routes/public.routes.tsx` que renderiza um componente mínimo (`OK`), sem dependências.
- Racional: isolar se o problema é do boot ou das páginas lazy; se `/__health` renderizar, o boot está íntegro.

## 4) Telemetria leve para desenvolvimento
- No fallback de `ErrorBoundary`, registrar o erro no console apenas em `DEV`.
- Opcional: se Sentry estiver ativo, enviar o erro capturado.

# Validação
- Abrir o preview e acessar `http://localhost:5173/__health` para confirmar render básico.
- Acessar `/` para verificar que a `Home` (`src/pages/public/Home.tsx`) aparece e não é coberta por overlays.
- Conferir o Console do navegador: verificar se há erros do Sentry, imports lazy ou hooks fora de provider.
- Navegar por rotas principais: `/login`, `/storefront-backend`, `/admin` (após login), garantindo que o fallback “Carregando...” aparece durante lazy e que erros são capturados pelo `ErrorBoundary`.

# Impacto e riscos
- Mudanças locais e reversíveis; não afetam build de produção além de tornar o boot mais robusto.
- Nenhum segredo adicionado; seguimos boas práticas de não inicializar serviços externos sem configuração válida.

# Entregáveis
- `src/main.tsx` atualizado para init condicional do Sentry.
- `src/components/util/ErrorBoundary.tsx` criado.
- `src/App.tsx` ajustado para envolver `AppRouter` no `ErrorBoundary`.
- `src/routes/public.routes.tsx` com rota `/__health`.

Confirma prosseguir com essas mudanças?