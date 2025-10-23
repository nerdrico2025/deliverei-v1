
#!/bin/bash

# Script helper para executar migrations do Prisma
# Uso: npm run migrate

echo "🚀 Executando migrations do Prisma..."
echo ""

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "❌ Erro: Arquivo .env não encontrado!"
    echo "📝 Copie o arquivo .env.example e configure suas variáveis:"
    echo "   cp .env.example .env"
    echo ""
    echo "⚠️  Não esqueça de configurar a DATABASE_URL com sua connection string do Supabase!"
    exit 1
fi

# Verificar se DATABASE_URL está configurada
if ! grep -q "DATABASE_URL=" .env; then
    echo "❌ Erro: DATABASE_URL não encontrada no arquivo .env!"
    echo "📝 Configure a DATABASE_URL com sua connection string do Supabase"
    exit 1
fi

# Verificar se a DATABASE_URL ainda está com placeholder
if grep -q "\[YOUR-PASSWORD\]" .env || grep -q "\[PROJECT-REF\]" .env; then
    echo "❌ Erro: DATABASE_URL ainda contém placeholders!"
    echo "📝 Substitua [YOUR-PASSWORD] e [PROJECT-REF] pelos valores reais do Supabase"
    echo ""
    echo "Exemplo:"
    echo "DATABASE_URL=\"postgresql://postgres.abcdefg:SuaSenha@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true\""
    exit 1
fi

echo "✅ Arquivo .env encontrado e configurado"
echo ""

# Executar migrations
echo "📦 Executando: npx prisma migrate deploy"
echo ""

npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migrations executadas com sucesso!"
    echo ""
    echo "📊 Próximos passos:"
    echo "   1. Execute o seed: npm run seed"
    echo "   2. Inicie o servidor: npm run start:dev"
    echo ""
else
    echo ""
    echo "❌ Erro ao executar migrations!"
    echo ""
    echo "🔍 Possíveis causas:"
    echo "   - DATABASE_URL incorreta"
    echo "   - Senha do banco incorreta"
    echo "   - Sem conexão com a internet"
    echo "   - Projeto Supabase pausado (reative no dashboard)"
    echo ""
    echo "📚 Consulte SUPABASE-SETUP.md para mais informações"
    exit 1
fi
