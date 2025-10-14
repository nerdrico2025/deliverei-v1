const { PrismaClient } = require('@prisma/client');

async function checkTables() {
  const prisma = new PrismaClient();
  
  try {
    // Query para listar todas as tabelas
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;
    
    console.log('\n✅ Tabelas criadas no banco de produção:');
    console.log('=' .repeat(50));
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.tablename}`);
    });
    console.log('=' .repeat(50));
    console.log(`\n📊 Total de tabelas: ${tables.length}`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
