import { createServer } from 'net';

/**
 * Verifica se uma porta está disponível
 * @param port - Porta a ser verificada
 * @returns Promise<boolean> - true se a porta estiver disponível
 */
export function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Encontra a próxima porta disponível a partir de uma porta base
 * @param basePort - Porta base para começar a busca
 * @param maxAttempts - Número máximo de tentativas (padrão: 10)
 * @returns Promise<number> - Próxima porta disponível
 */
export async function findAvailablePort(basePort: number, maxAttempts: number = 10): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = basePort + i;
    const available = await isPortAvailable(port);
    
    if (available) {
      return port;
    }
  }
  
  throw new Error(`Nenhuma porta disponível encontrada a partir da porta ${basePort} (tentativas: ${maxAttempts})`);
}

/**
 * Verifica se uma porta específica está em uso e fornece informações detalhadas
 * @param port - Porta a ser verificada
 * @returns Promise<{available: boolean, message: string}>
 */
export async function checkPortStatus(port: number): Promise<{available: boolean, message: string}> {
  const available = await isPortAvailable(port);
  
  if (available) {
    return {
      available: true,
      message: `Porta ${port} está disponível`
    };
  } else {
    return {
      available: false,
      message: `Porta ${port} está em uso. Considere usar uma porta diferente ou parar o processo que está usando esta porta.`
    };
  }
}