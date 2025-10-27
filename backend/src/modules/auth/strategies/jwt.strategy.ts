import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // Modo mock desativado por política: sempre validar contra o banco
  private readonly useMockAuth = false;

  async validate(payload: JwtPayload) {
    if (this.useMockAuth) {
      // Mock desativado
      throw new UnauthorizedException('Mock auth está desativada.');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        nome: true,
        tipo: true,
        empresaId: true,
        ativo: true,
        empresa: {
          select: {
            id: true,
            nome: true,
            slug: true,
            subdominio: true,
            ativo: true,
          },
        },
      },
    });

    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException('Usuário inválido ou inativo');
    }

    return {
      sub: usuario.id,
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      role: usuario.tipo,
      empresaId: usuario.empresaId,
      empresa: usuario.empresa,
    };
  }
}
