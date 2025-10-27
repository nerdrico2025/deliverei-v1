const { PrismaClient } = require('@prisma/client');

async function run() {
  const prisma = new PrismaClient();
  try {
    const emails = [
      'rafael@nerdrico.com.br',
      'rafael+2@nerdrico.com.br',
    ];

    for (const email of emails) {
      const u = await prisma.usuario.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          ativo: true,
          tipo: true,
          empresaId: true,
          empresa: { select: { id: true, nome: true, slug: true, ativo: true } },
        },
      });

      console.log(`Email: ${email}`);
      if (!u) {
        console.log('  Status: NÃO ENCONTRADO');
      } else {
        console.log(`  ID: ${u.id}`);
        console.log(`  Tipo: ${u.tipo}`);
        console.log(`  Ativo: ${u.ativo}`);
        console.log(`  EmpresaId: ${u.empresaId}`);
        console.log(
          `  Empresa: ${u.empresa ? `${u.empresa.nome} (slug=${u.empresa.slug}, ativo=${u.empresa.ativo})` : 'null'}`
        );
      }
    }
  } catch (err) {
    console.error('Erro ao consultar usuários:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();