-- AlterTable
ALTER TABLE "empresas" ADD COLUMN "asaasCustomerId" TEXT;

-- AlterTable
ALTER TABLE "pagamentos" ADD COLUMN "asaasInvoiceUrl" TEXT;
ALTER TABLE "pagamentos" ADD COLUMN "boletoUrl" TEXT;
ALTER TABLE "pagamentos" ADD COLUMN "dataVencimento" DATETIME;
ALTER TABLE "pagamentos" ADD COLUMN "pixCopyPaste" TEXT;
ALTER TABLE "pagamentos" ADD COLUMN "pixQrCode" TEXT;
