
#!/bin/bash

# Script helper para executar seed do Prisma
# Uso: npm run seed

echo "🌱 Executando seed do banco de dados..."
echo ""

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "❌ Erro: Arquivo .env não encontrado!"
    echo "📝 Copie o arquivo .env.example e configure suas variáveis:"
    echo "   cp .env.example .env"
    exit 1
fi

# Verificar se DATABASE_URL está configurada
if ! grep -q "DATABASE_URL=" .env; then
    echo "❌ Erro: DATABASE_URL não encontrada no arquivo .env!"
    exit 1
fi

echo "✅ Arquivo .env encontrado"
echo ""

# Executar seed
echo "📦 Executando: npx prisma db seed"
echo ""

npx prisma db seed

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Seed executado com sucesso!"
    echo ""
    echo "📊 Dados criados:"
    echo "   - 1 Empresa (Pizza Express)"
    echo "   - 2 Usuários (admin e cliente)"
    echo "   - Produtos de exemplo"
    echo ""
    echo "🔐 Credenciais de teste:"
    echo "   Admin: admin@pizzaexpress.com / admin123"
    echo "   Cliente: cliente@example.com / cliente123"
    echo ""
    echo "🚀 Próximo passo:"
    echo "   Inicie o servidor: npm run start:dev"
    echo ""
else
    echo ""
    echo "❌ Erro ao executar seed!"
    echo ""
    echo "🔍 Verifique se as migrations foram executadas:"
    echo "   npm run migrate"
    echo ""
    exit 1
fi
