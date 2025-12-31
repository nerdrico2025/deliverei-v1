"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPortAvailable = isPortAvailable;
exports.findAvailablePort = findAvailablePort;
exports.checkPortStatus = checkPortStatus;
const net_1 = require("net");
function isPortAvailable(port) {
    return new Promise((resolve) => {
        const server = (0, net_1.createServer)();
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
async function findAvailablePort(basePort, maxAttempts = 10) {
    for (let i = 0; i < maxAttempts; i++) {
        const port = basePort + i;
        const available = await isPortAvailable(port);
        if (available) {
            return port;
        }
    }
    throw new Error(`Nenhuma porta disponível encontrada a partir da porta ${basePort} (tentativas: ${maxAttempts})`);
}
async function checkPortStatus(port) {
    const available = await isPortAvailable(port);
    if (available) {
        return {
            available: true,
            message: `Porta ${port} está disponível`
        };
    }
    else {
        return {
            available: false,
            message: `Porta ${port} está em uso. Considere usar uma porta diferente ou parar o processo que está usando esta porta.`
        };
    }
}
//# sourceMappingURL=port-checker.js.map