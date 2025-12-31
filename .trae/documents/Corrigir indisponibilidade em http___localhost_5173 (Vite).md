## Diagnóstico
- A mensagem "service is unvaliable" indica indisponibilidade do dev server no preview/ambiente atual.
- Logs de navegador mostram dezenas de `net::ERR_ABORTED` ao carregar módulos de `lucide-react` direto de `node_modules`, típico quando Vite não pré-empacota a lib e/ou o servidor não está exposto corretamente.
- O app possui rota de saúde (`/__health`) e estrutura base (`index.html` com `#root`, `src/main.tsx`) corretas.

## Ajustes no Vite
- Expor servidor para a rede: configurar `server.host: true`, `server.port: 5173`, `server.strictPort: true` no `vite.config.ts` para evitar variações em ambientes de preview.
- Pré-empacotar `lucide-react`: adicionar `optimizeDeps.include: ['lucide-react']` para reduzir múltiplos carregamentos ESM que geram `ERR_ABORTED`.
- (Opcional) Ativar `optimizeDeps.force: true` temporariamente na primeira execução se a lockfile mudou.

## Validações
- Reiniciar o Vite e acessar `http://localhost:5173/` e `http://localhost:5173/__health`.
- Fazer hard refresh e limpar cache se necessário.
- Verificar se os logs `ERR_ABORTED` desaparecem no console; em caso de persistência, testar acesso pelo endereço de rede (ex.: `http://<ip-local>:5173/`).

## Mitigações adicionais (se persistir)
- Verificar se há algum service worker antigo ativo e desregistrar via DevTools.
- Revisar importações de ícones: evitar import dinâmico massivo; concentrar importações necessárias em um único módulo e reexportar.
- Caso o backend também esteja indisponível, manter o frontend carregando ao tratar erros de rede (já há ErrorBoundary). Ajustes de fallback podem ser aplicados em páginas que fazem chamadas imediatas.

## Entregáveis
- Atualização do `vite.config.ts` com `server` e `optimizeDeps.include`.
- Reinício do servidor e comprovação via rota `__health` e ausência dos 97 logs.
- Documentação curta do passo a passo para desenvolvimento local sem indisponibilidade.