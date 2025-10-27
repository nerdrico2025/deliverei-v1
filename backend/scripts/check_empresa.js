const { PrismaClient } = require('@prisma/client');

async function run() {
  const prisma = new PrismaClient();
  try {
    const slugs = ['pizza-express', 'burger-king'];
    for (const slug of slugs) {
      const empresa = await prisma.empresa.findUnique({ where: { slug } });
      console.log(`Slug ${slug}:`, empresa ? `ENCONTRADA (id=${empresa.id})` : 'NÃO ENCONTRADA');
      const countProdutos = await prisma.produto.count({ where: { empresaId: empresa?.id } });
      console.log(`  Produtos: ${countProdutos}`);
    }
  } catch (err) {
    console.error('Erro ao consultar empresas:', err);
  } finally {
    await prisma.$disconnect();
  }
}
run();