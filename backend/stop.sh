#!/bin/bash

echo "🛑 Parando serviços do DELIVEREI Backend..."
echo ""

# Parar containers Docker
echo "🐳 Parando containers Docker..."
docker-compose down
if [ $? -ne 0 ]; then
    echo "❌ Erro ao parar containers Docker"
    exit 1
fi
echo "✅ Containers Docker parados"
echo ""

echo "✨ Serviços parados com sucesso!"
