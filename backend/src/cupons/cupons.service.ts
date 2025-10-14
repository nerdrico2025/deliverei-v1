
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCupomDto } from './dto/create-cupom.dto';
import { UpdateCupomDto } from './dto/update-cupom.dto';
import { ValidarCupomDto } from './dto/validar-cupom.dto';
import { validateEntityExists } from '../utils';

@Injectable()
export class CuponsService {
  constructor(private prisma: PrismaService) {}

  async create(createCupomDto: CreateCupomDto, empresaId: string) {
    // Verificar se o código já existe para esta empresa
    const cupomExistente = await this.prisma.cupom.findFirst({
      where: { 
        codigo: createCupomDto.codigo,
        empresaId 
      },
    });

    if (cupomExistente) {
      throw new BadRequestException('Código de cupom já existe');
    }

    return this.prisma.cupom.create({
      data: {
        ...createCupomDto,
        empresaId,
      },
    });
  }

  async findAll(empresaId: string) {
    return this.prisma.cupom.findMany({
      where: { empresaId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, empresaId: string) {
    const cupom = await this.prisma.cupom.findFirst({
      where: { id, empresaId },
    });

    validateEntityExists(cupom, 'Cupom');

    return cupom;
  }

  async update(id: string, updateCupomDto: UpdateCupomDto, empresaId: string) {
    await this.findOne(id, empresaId);

    return this.prisma.cupom.update({
      where: { id },
      data: updateCupomDto,
    });
  }

  async remove(id: string, empresaId: string) {
    await this.findOne(id, empresaId);

    return this.prisma.cupom.delete({
      where: { id },
    });
  }

  async validar(validarCupomDto: ValidarCupomDto, empresaId: string) {
    const cupom = await this.prisma.cupom.findFirst({
      where: {
        codigo: validarCupomDto.codigo,
        empresaId,
        ativo: true,
      },
    });

    validateEntityExists(cupom, 'Cupom (não encontrado ou inativo)');

    const agora = new Date();
    if (agora < cupom.dataInicio || agora > cupom.dataFim) {
      throw new BadRequestException('Cupom fora do período de validade');
    }

    if (cupom.usoMaximo && cupom.usoAtual >= cupom.usoMaximo) {
      throw new BadRequestException('Cupom atingiu o limite de uso');
    }

    if (cupom.valorMinimo && validarCupomDto.valorCompra < Number(cupom.valorMinimo)) {
      throw new BadRequestException(
        `Valor mínimo de compra não atingido. Mínimo: R$ ${cupom.valorMinimo}`,
      );
    }

    let desconto = 0;
    if (cupom.tipo === 'PERCENTUAL') {
      desconto = (validarCupomDto.valorCompra * Number(cupom.valor)) / 100;
    } else {
      desconto = Number(cupom.valor);
    }

    return {
      cupom,
      desconto,
      valorFinal: validarCupomDto.valorCompra - desconto,
    };
  }

  async incrementarUso(codigo: string) {
    return this.prisma.cupom.update({
      where: { codigo },
      data: {
        usoAtual: {
          increment: 1,
        },
      },
    });
  }
}
