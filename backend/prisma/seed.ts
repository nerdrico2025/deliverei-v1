
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes (opcional, comentar em produção)
  await prisma.refreshToken.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.produto.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.empresa.deleteMany();

  // Criar empresa Pizza Express
  const empresaPizza = await prisma.empresa.create({
    data: {
      nome: 'Pizza Express',
      email: 'contato@pizza-express.com',
      slug: 'pizza-express',
      subdominio: 'pizza-express',
      ativo: true,
    },
  });

  console.log('✅ Empresa criada:', empresaPizza.nome);

  // Criar empresa Burger King
  const empresaBurger = await prisma.empresa.create({
    data: {
      nome: 'Burger King',
      email: 'contato@burger-king.com',
      slug: 'burger-king',
      subdominio: 'burger-king',
      ativo: true,
    },
  });

  console.log('✅ Empresa criada:', empresaBurger.nome);

  // Criar Super Admin
  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
  const superAdmin = await prisma.usuario.create({
    data: {
      email: 'admin@deliverei.com.br',
      senha: hashedPasswordAdmin,
      nome: 'Super Administrador',
      tipo: 'SUPER_ADMIN',
      ativo: true,
    },
  });

  console.log('✅ Super Admin criado:', superAdmin.email);

  // Criar Admin da empresa Pizza Express
  const hashedPasswordPizza = await bcrypt.hash('pizza123', 10);
  const adminPizza = await prisma.usuario.create({
    data: {
      email: 'admin@pizza-express.com',
      senha: hashedPasswordPizza,
      nome: 'Admin Pizza Express',
      tipo: 'ADMIN_EMPRESA',
      empresaId: empresaPizza.id,
      ativo: true,
    },
  });

  console.log('✅ Admin da empresa criado:', adminPizza.email);

  // Criar Admin da empresa Burger King
  const adminBurger = await prisma.usuario.create({
    data: {
      email: 'admin@burger-king.com',
      senha: hashedPasswordPizza, // Same password as Pizza Express
      nome: 'Admin Burger King',
      tipo: 'ADMIN_EMPRESA',
      empresaId: empresaBurger.id,
      ativo: true,
    },
  });

  console.log('✅ Admin da empresa criado:', adminBurger.email);

  // Criar cliente exemplo (associado à Pizza Express)
  const hashedPasswordCliente = await bcrypt.hash('cliente123', 10);
  const cliente = await prisma.usuario.create({
    data: {
      email: 'cliente@exemplo.com',
      senha: hashedPasswordCliente,
      nome: 'João Silva',
      tipo: 'CLIENTE',
      empresaId: empresaPizza.id,
      ativo: true,
    },
  });

  console.log('✅ Cliente criado:', cliente.email);

  // Criar produtos para Pizza Express
  const produtosPizza = [
    {
      nome: 'Pizza Margherita',
      descricao: 'Molho de tomate, mussarela e manjericão',
      preco: 35.90,
      imagem: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002',
      categoria: 'Pizza',
      estoque: 50,
      empresaId: empresaPizza.id,
    },
    {
      nome: 'Pizza Calabresa',
      descricao: 'Molho de tomate, mussarela, calabresa e cebola',
      preco: 39.90,
      imagem: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
      categoria: 'Pizza',
      estoque: 45,
      empresaId: empresaPizza.id,
    },
    {
      nome: 'Pizza Portuguesa',
      descricao: 'Molho de tomate, mussarela, presunto, ovos, cebola e azeitona',
      preco: 42.90,
      imagem: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
      categoria: 'Pizza',
      estoque: 40,
      empresaId: empresaPizza.id,
    },
    {
      nome: 'Pizza Quatro Queijos',
      descricao: 'Molho de tomate, mussarela, provolone, parmesão e gorgonzola',
      preco: 44.90,
      imagem: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f',
      categoria: 'Pizza',
      estoque: 35,
      empresaId: empresaPizza.id,
    },
    {
      nome: 'Refrigerante Coca-Cola 2L',
      descricao: 'Refrigerante Coca-Cola 2 litros',
      preco: 8.90,
      imagem: 'https://images.unsplash.com/photo-1554866585-cd94860890b7',
      categoria: 'Bebida',
      estoque: 100,
      empresaId: empresaPizza.id,
    },
  ];

  for (const produto of produtosPizza) {
    await prisma.produto.create({ data: produto });
  }

  console.log(`✅ ${produtosPizza.length} produtos criados para Pizza Express`);

  // Criar produtos para Burger King
  const produtosBurger = [
    {
      nome: 'Whopper',
      descricao: 'Hambúrguer de carne grelhada, tomate, alface, maionese, ketchup, picles e cebola',
      preco: 28.90,
      imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
      categoria: 'Hambúrguer',
      estoque: 60,
      empresaId: empresaBurger.id,
    },
    {
      nome: 'Mega Stacker 2.0',
      descricao: 'Dois hambúrgueres, bacon, queijo cheddar e molho especial',
      preco: 32.90,
      imagem: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
      categoria: 'Hambúrguer',
      estoque: 50,
      empresaId: empresaBurger.id,
    },
    {
      nome: 'Batata Frita Grande',
      descricao: 'Batatas fritas crocantes porção grande',
      preco: 12.90,
      imagem: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877',
      categoria: 'Acompanhamento',
      estoque: 80,
      empresaId: empresaBurger.id,
    },
  ];

  for (const produto of produtosBurger) {
    await prisma.produto.create({ data: produto });
  }

  console.log(`✅ ${produtosBurger.length} produtos criados para Burger King`);

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📋 Credenciais criadas:');
  console.log('   Super Admin: admin@deliverei.com.br / admin123');
  console.log('   Admin Pizza Express: admin@pizza-express.com / pizza123');
  console.log('   Admin Burger King: admin@burger-king.com / pizza123');
  console.log('   Cliente: cliente@exemplo.com / cliente123');
  console.log('\n📊 Dados criados:');
  console.log(`   - 2 empresas: Pizza Express e Burger King`);
  console.log(`   - ${produtosPizza.length} produtos para Pizza Express`);
  console.log(`   - ${produtosBurger.length} produtos para Burger King`);
  console.log(`   - 1 cliente de teste (João Silva)`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
