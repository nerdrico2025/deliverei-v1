const axios = require('axios');

const API_URL = 'https://deliverei-backend.onrender.com/api';

async function testDashboardAPI() {
  console.log('🔍 Testando API do Dashboard...\n');
  
  // Test 1: Health check
  console.log('1️⃣ Testando health check...');
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check OK:', response.status);
  } catch (error) {
    console.log('❌ Health check falhou:', error.message);
  }
  
  // Test 2: Dashboard vendas endpoint (sem autenticação - deve retornar 401)
  console.log('\n2️⃣ Testando endpoint /dashboard/vendas (sem auth)...');
  try {
    const response = await axios.get(`${API_URL}/dashboard/vendas`);
    console.log('✅ Resposta:', response.status);
  } catch (error) {
    if (error.response) {
      console.log(`⚠️  Status: ${error.response.status} - ${error.response.statusText}`);
      console.log('Mensagem:', error.response.data);
    } else {
      console.log('❌ Erro:', error.message);
    }
  }
  
  // Test 3: Verificar se a rota existe (OPTIONS request)
  console.log('\n3️⃣ Verificando se a rota existe (OPTIONS)...');
  try {
    const response = await axios.options(`${API_URL}/dashboard/vendas`);
    console.log('✅ Rota existe:', response.status);
  } catch (error) {
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
    } else {
      console.log('❌ Erro:', error.message);
    }
  }
  
  console.log('\n📊 Teste concluído!');
}

testDashboardAPI();
