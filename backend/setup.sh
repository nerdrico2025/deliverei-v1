#!/bin/bash

echo "🚀 Iniciando setup do DELIVEREI Backend..."
echo ""

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Por favor, instale o Node.js 18+ primeiro."
    exit 1
fi

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se o docker-compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose não está instalado. Por favor, instale o docker-compose primeiro."
    exit 1
fi

echo "✅ Verificações de pré-requisitos concluídas"
echo ""

# Instalar dependências
echo "📦 Instalando dependências do npm..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi
echo "✅ Dependências instaladas"
echo ""

# Subir containers do Docker
echo "🐳 Iniciando containers Docker (PostgreSQL + Redis)..."
docker-compose up -d
if [ $? -ne 0 ]; then
    echo "❌ Erro ao iniciar containers Docker"
    exit 1
fi
echo "✅ Containers Docker iniciados"
echo ""

# Aguardar PostgreSQL estar pronto
echo "⏳ Aguardando PostgreSQL estar pronto..."
sleep 5

# Gerar Prisma Client
echo "🔧 Gerando Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Erro ao gerar Prisma Client"
    exit 1
fi
echo "✅ Prisma Client gerado"
echo ""

# Executar migrations
echo "🗄️  Executando migrations do banco de dados..."
npx prisma migrate dev --name init
if [ $? -ne 0 ]; then
    echo "❌ Erro ao executar migrations"
    exit 1
fi
echo "✅ Migrations executadas"
echo ""

# Popular banco com seeds
echo "🌱 Populando banco de dados com dados iniciais..."
npm run seed
if [ $? -ne 0 ]; then
    echo "❌ Erro ao executar seed"
    exit 1
fi
echo "✅ Seeds executados"
echo ""

echo "✨ Setup concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "  1. Execute 'npm run dev' para iniciar o servidor em modo desenvolvimento"
echo "  2. Acesse http://localhost:3000/api para ver a API"
echo ""
echo "📚 Credenciais criadas:"
echo "  Super Admin: admin@deliverei.com.br / admin123"
echo "  Admin Pizza Express: admin@pizza-express.com / pizza123"
echo "  Admin Burger King: admin@burger-king.com / pizza123"
echo "  Cliente: cliente@exemplo.com / cliente123"
echo ""
