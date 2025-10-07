import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto, SignupDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, senha: string): Promise<any> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      include: { empresa: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!usuario.ativo) {
      throw new UnauthorizedException('Usuário inativo');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const { senha: _, ...result } = usuario;
    return result;
  }

  async login(loginDto: LoginDto) {
    const usuario = await this.validateUser(loginDto.email, loginDto.senha);

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      role: usuario.role,
      empresaId: usuario.empresaId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(usuario.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        role: usuario.role,
        empresaId: usuario.empresaId,
        empresa: usuario.empresa,
      },
    };
  }

  async signup(signupDto: SignupDto) {
    // Verificar se email já existe
    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { email: signupDto.email },
    });

    if (usuarioExistente) {
      throw new ConflictException('Email já cadastrado');
    }

    // Verificar se empresa existe (se empresaId foi fornecido)
    if (signupDto.empresaId) {
      const empresa = await this.prisma.empresa.findUnique({
        where: { id: signupDto.empresaId },
      });

      if (!empresa) {
        throw new BadRequestException('Empresa não encontrada');
      }

      if (!empresa.ativo) {
        throw new BadRequestException('Empresa inativa');
      }
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(signupDto.senha, 10);

    // Criar usuário
    const usuario = await this.prisma.usuario.create({
      data: {
        email: signupDto.email,
        senha: hashedPassword,
        nome: signupDto.nome,
        empresaId: signupDto.empresaId,
        role: signupDto.empresaId ? 'CLIENTE' : 'SUPER_ADMIN',
      },
      include: { empresa: true },
    });

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      role: usuario.role,
      empresaId: usuario.empresaId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(usuario.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        role: usuario.role,
        empresaId: usuario.empresaId,
        empresa: usuario.empresa,
      },
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Token inválido');
    }

    if (new Date() > storedToken.expiresAt) {
      await this.prisma.refreshToken.delete({
        where: { token: refreshToken },
      });
      throw new UnauthorizedException('Token expirado');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: storedToken.usuarioId },
    });

    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException('Usuário inválido ou inativo');
    }

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      role: usuario.role,
      empresaId: usuario.empresaId,
    };

    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async logout(refreshToken: string) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (storedToken) {
      await this.prisma.refreshToken.delete({
        where: { token: refreshToken },
      });
    }

    return { message: 'Logout realizado com sucesso' };
  }

  private async generateRefreshToken(usuarioId: string): Promise<string> {
    const token = uuidv4();
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    
    // Converter expiresIn para milissegundos
    const expiresInMs = this.parseTimeToMs(expiresIn);
    const expiresAt = new Date(Date.now() + expiresInMs);

    await this.prisma.refreshToken.create({
      data: {
        token,
        usuarioId,
        expiresAt,
      },
    });

    return token;
  }

  private parseTimeToMs(time: string): number {
    const match = time.match(/^(\d+)([dhms])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7 dias

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'm':
        return value * 60 * 1000;
      case 's':
        return value * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }
}
