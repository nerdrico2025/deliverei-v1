/*
  Warnings:

  - Added the required column `empresaId` to the `pagamentos` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_pagamentos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pedidoId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "metodo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "transacaoId" TEXT,
    "asaasPaymentId" TEXT,
    "dataPagamento" DATETIME,
    "gatewayResposta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pagamentos_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "pagamentos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_pagamentos" ("asaasPaymentId", "createdAt", "dataPagamento", "gatewayResposta", "id", "metodo", "pedidoId", "status", "transacaoId", "updatedAt", "valor") SELECT "asaasPaymentId", "createdAt", "dataPagamento", "gatewayResposta", "id", "metodo", "pedidoId", "status", "transacaoId", "updatedAt", "valor" FROM "pagamentos";
DROP TABLE "pagamentos";
ALTER TABLE "new_pagamentos" RENAME TO "pagamentos";
CREATE INDEX "pagamentos_pedidoId_idx" ON "pagamentos"("pedidoId");
CREATE INDEX "pagamentos_empresaId_idx" ON "pagamentos"("empresaId");
CREATE INDEX "pagamentos_status_idx" ON "pagamentos"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
