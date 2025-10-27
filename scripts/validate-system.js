#!/usr/bin/env node

import http from 'http';
import https from 'https';
import { createServer } from 'net';

/**
 * Script de validação do sistema de cadastro
 * Testa conectividade, endpoints e funcionalidades básicas
 */

const CONFIG = {
  backend: {
    host: 'localhost',
    port: 3002,
    protocol: 'http'
  },
  frontend: {
    host: 'localhost',
    port: 5174,
    protocol: 'http'
  }
};

class SystemValidator {
  constructor() {
    this.results = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
    
    if (type === 'error') {
      this.errors.push(message);
    }
  }

  async checkPort(host, port, service) {
    try {
      const url = `http://${host}:${port}`;
      const response = await this.makeRequest(url, { timeout: 2000 });
      return true; // Se conseguiu fazer a requisição, o serviço está rodando
    } catch (error) {
      return false; // Se deu erro, o serviço não está rodando
    }
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      
      const req = client.request(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        timeout: 5000
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed, headers: res.headers });
          } catch {
            resolve({ status: res.statusCode, data, headers: res.headers });
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  async validateBackend() {
    this.log('🔍 Validando Backend...', 'info');
    
    // Verificar se o backend está rodando
    const backendRunning = await this.checkPort(CONFIG.backend.host, CONFIG.backend.port, 'backend');
    
    if (!backendRunning) {
      this.log(`Backend não está rodando na porta ${CONFIG.backend.port}`, 'error');
      return false;
    }
    
    this.log(`Backend está rodando na porta ${CONFIG.backend.port}`, 'success');

    try {
      // Testar endpoint de health
      const healthUrl = `${CONFIG.backend.protocol}://${CONFIG.backend.host}:${CONFIG.backend.port}/api`;
      const healthResponse = await this.makeRequest(healthUrl);
      
      if (healthResponse.status === 200) {
        this.log('Endpoint /api está respondendo', 'success');
      } else {
        this.log(`Endpoint /api retornou status ${healthResponse.status}`, 'error');
        return false;
      }

      // Testar endpoint de cadastro
      const cadastroUrl = `${CONFIG.backend.protocol}://${CONFIG.backend.host}:${CONFIG.backend.port}/api/auth/cadastro-empresa`;
      const testData = {
        nome: 'Empresa Teste',
        email: 'teste@exemplo.com',
        senha: 'senha123',
        telefone: '11999999999',
        endereco: {
          rua: 'Rua Teste',
          numero: '123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01000-000'
        }
      };

      const cadastroResponse = await this.makeRequest(cadastroUrl, {
        method: 'POST',
        body: testData
      });

      if (cadastroResponse.status === 201 || cadastroResponse.status === 400) {
        this.log('Endpoint de cadastro está funcionando', 'success');
      } else {
        this.log(`Endpoint de cadastro retornou status ${cadastroResponse.status}`, 'error');
        return false;
      }

      return true;
    } catch (error) {
      this.log(`Erro ao validar backend: ${error.message}`, 'error');
      return false;
    }
  }

  async validateFrontend() {
    this.log('🔍 Validando Frontend...', 'info');
    
    // Verificar se o frontend está rodando
    const frontendRunning = await this.checkPort(CONFIG.frontend.host, CONFIG.frontend.port, 'frontend');
    
    if (!frontendRunning) {
      this.log(`Frontend não está rodando na porta ${CONFIG.frontend.port}`, 'error');
      return false;
    }
    
    this.log(`Frontend está rodando na porta ${CONFIG.frontend.port}`, 'success');

    try {
      // Testar página principal
      const frontendUrl = `${CONFIG.frontend.protocol}://${CONFIG.frontend.host}:${CONFIG.frontend.port}`;
      const frontendResponse = await this.makeRequest(frontendUrl);
      
      if (frontendResponse.status === 200) {
        this.log('Frontend está respondendo', 'success');
        return true;
      } else {
        this.log(`Frontend retornou status ${frontendResponse.status}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`Erro ao validar frontend: ${error.message}`, 'error');
      return false;
    }
  }

  async validateConnectivity() {
    this.log('🔍 Validando conectividade entre serviços...', 'info');
    
    // Simular requisição do frontend para o backend
    try {
      const apiUrl = `${CONFIG.backend.protocol}://${CONFIG.backend.host}:${CONFIG.backend.port}/api`;
      const response = await this.makeRequest(apiUrl, {
        headers: {
          'Origin': `${CONFIG.frontend.protocol}://${CONFIG.frontend.host}:${CONFIG.frontend.port}`
        }
      });

      if (response.status === 200) {
        this.log('Conectividade entre frontend e backend OK', 'success');
        return true;
      } else {
        this.log('Problema de conectividade entre serviços', 'error');
        return false;
      }
    } catch (error) {
      this.log(`Erro de conectividade: ${error.message}`, 'error');
      return false;
    }
  }

  async run() {
    console.log('🚀 Iniciando validação do sistema...\n');
    
    const backendOk = await this.validateBackend();
    const frontendOk = await this.validateFrontend();
    const connectivityOk = await this.validateConnectivity();
    
    console.log('\n📊 Resumo da validação:');
    console.log(`Backend: ${backendOk ? '✅' : '❌'}`);
    console.log(`Frontend: ${frontendOk ? '✅' : '❌'}`);
    console.log(`Conectividade: ${connectivityOk ? '✅' : '❌'}`);
    
    if (this.errors.length > 0) {
      console.log('\n🚨 Erros encontrados:');
      this.errors.forEach(error => console.log(`  - ${error}`));
      
      console.log('\n💡 Sugestões para correção:');
      console.log('  1. Verifique se os serviços estão rodando nas portas corretas');
      console.log('  2. Confirme as configurações de CORS no backend');
      console.log('  3. Verifique as variáveis de ambiente (.env)');
      console.log('  4. Reinicie os serviços se necessário');
    } else {
      console.log('\n🎉 Sistema validado com sucesso!');
      console.log('✅ Todos os componentes estão funcionando corretamente');
    }
    
    process.exit(this.errors.length > 0 ? 1 : 0);
  }
}

// Executar validação
const validator = new SystemValidator();
validator.run().catch(error => {
  console.error('❌ Erro fatal na validação:', error);
  process.exit(1);
});