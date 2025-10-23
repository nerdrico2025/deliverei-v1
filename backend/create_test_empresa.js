const { PrismaClient } = require('@prisma/client');

async function createTestEmpresa() {
  const prisma = new PrismaClient();
  
  try {
    // Verificar se já existe alguma empresa
    const count = await prisma.empresa.count();
    console.log(`\n📊 Empresas existentes: ${count}`);
    
    if (count > 0) {
      console.log('\n✅ Já existem empresas cadastradas!');
      const empresas = await prisma.empresa.findMany();
      empresas.forEach(e => {
        console.log(`  - ${e.nome} (slug: ${e.slug})`);
      });
      return;
    }
    
    // Criar empresa de teste
    console.log('\n🏗️  Criando empresa de teste...');
    const empresa = await prisma.empresa.create({
      data: {
        nome: 'Pizza Express',
        slug: 'pizza-express',
        subdominio: 'pizza-express',
        ativo: true,
        whatsappNumero: '+5511999999999'
      }
    });
    
    console.log('\n✅ Empresa criada com sucesso!');
    console.log(`  ID: ${empresa.id}`);
    console.log(`  Nome: ${empresa.nome}`);
    console.log(`  Slug: ${empresa.slug}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestEmpresa();
