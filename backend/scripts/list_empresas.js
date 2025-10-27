const { PrismaClient } = require('@prisma/client');

async function run() {
  const prisma = new PrismaClient();
  try {
    const empresas = await prisma.empresa.findMany({
      select: { id: true, nome: true, slug: true, ativo: true, email: true },
      orderBy: { nome: 'asc' },
    });
    console.log('\nEmpresas no banco atual:');
    for (const e of empresas) {
      console.log(`- ${e.nome} (slug=${e.slug}, ativo=${e.ativo}, email=${e.email || 'n/a'})`);
    }
  } catch (err) {
    console.error('Erro ao listar empresas:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();