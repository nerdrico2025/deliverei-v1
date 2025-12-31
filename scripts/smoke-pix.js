#!/usr/bin/env node
import http from 'http';

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };
    const r = http.request(options, (res) => {
      let chunks = '';
      res.on('data', (c) => (chunks += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(chunks || '{}') });
        } catch {
          resolve({ status: res.statusCode, data: chunks });
        }
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function run() {
  const pagamento = await req('POST', '/pagamentos', {
    pedidoId: 'SMOKE-PEDIDO',
    metodo: 'PIX',
    valor: 10,
    dataVencimento: new Date(Date.now() + 3600_000).toISOString(),
    descricao: 'Smoke Test PIX',
    clienteNome: 'Teste',
    clienteEmail: 'teste@example.com',
    clienteCpfCnpj: '00000000000',
    clienteTelefone: '11999999999',
  });
  console.log('criar pagamento', pagamento.status);
  const asaasEvent = {
    event: 'PAYMENT_RECEIVED',
    payment: {
      id: pagamento.data?.asaasPaymentId || 'unknown',
      paymentDate: new Date().toISOString(),
    },
  };
  const webhook = await req('POST', '/webhooks/asaas', asaasEvent);
  console.log('webhook asaas', webhook.status);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
