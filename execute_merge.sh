#!/bin/bash

echo "🚀 EXECUTANDO MERGE DO COMMIT e97bc84..."
echo "📍 Branch atual: main"
echo "🎯 Commit: fix: Corrigir erro de inicialização do avaliacoesApi e reinstalar dependências"
echo ""

# Executar cherry-pick do commit
echo "🔄 Aplicando commit e97bc84..."
git cherry-pick e97bc8412df962d7b077acbf9003d2ab66a01808

if [ $? -eq 0 ]; then
    echo "✅ MERGE REALIZADO COM SUCESSO!"
    echo ""
    echo "📊 Últimos commits no main:"
    git log --oneline -5
    echo ""
    echo "🚀 Fazendo push para origin/main..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 SUCESSO TOTAL!"
        echo "✅ Suas alterações estão agora no branch main"
        echo "✅ Push realizado para o GitHub"
        echo ""
        echo "📋 Arquivos mergeados:"
        echo "  - src/services/backendApi.ts (correção avaliacoesApi)"
        echo "  - REINSTALACAO_DEPENDENCIAS_LOG.md"
        echo "  - package.json e package-lock.json"
        echo "  - backend/package-lock.json"
    else
        echo "❌ Erro no push para o repositório remoto"
        echo "🔍 Verificando status..."
        git status
    fi
else
    echo "❌ Erro no cherry-pick. Verificando conflitos..."
    git status
    echo ""
    echo "💡 Se houver conflitos, resolva-os e execute:"
    echo "   git add ."
    echo "   git cherry-pick --continue"
fi