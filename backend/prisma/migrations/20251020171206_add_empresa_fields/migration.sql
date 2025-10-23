-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_empresas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "endereco" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "slug" TEXT,
    "subdominio" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_empresas" ("ativa", "createdAt", "email", "endereco", "id", "nome", "telefone", "updatedAt") SELECT "ativa", "createdAt", "email", "endereco", "id", "nome", "telefone", "updatedAt" FROM "empresas";
DROP TABLE "empresas";
ALTER TABLE "new_empresas" RENAME TO "empresas";
CREATE UNIQUE INDEX "empresas_email_key" ON "empresas"("email");
CREATE UNIQUE INDEX "empresas_slug_key" ON "empresas"("slug");
CREATE UNIQUE INDEX "empresas_subdominio_key" ON "empresas"("subdominio");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
