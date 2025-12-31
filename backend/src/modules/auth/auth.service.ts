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
import { LoginDto, SignupDto, CreateAccountFromOrderDto, CadastroEmpresaDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Modo mock desativado por política
  private readonly useMockAuth = false;
  private devSlug(): string {
    return process.env.DEV_TENANT_SLUG || 'demo';
  }
  private devEmpresa() {
    return { id: 'dev-empresa', nome: 'Empresa Dev', slug: this.devSlug(), subdominio: this.devSlug(), ativo: true, telefone: '', endereco: '' };
  }

  async validateUser(email: string, senha: string): Promise<any> {
    if (this.useMockAuth) {
      throw new UnauthorizedException('Mock auth está desativada.');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        nome: true,
        senha: true,
        tipo: true,
        ativo: true,
        empresaId: true,
        telefone: true,
        empresa: {
          select: {
            id: true,
            nome: true,
            slug: true,
            subdominio: true,
            ativo: true,
            telefone: true,
            endereco: true,
          },
        },
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    if (!usuario.ativo) {
      throw new UnauthorizedException('Usuário inativo');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      throw new UnauthorizedException('Senha inválida');
    }

    const { senha: _, ...result } = usuario;
    return result;
  }

  async login(loginDto: LoginDto) {
    if (!this.prisma.connected) {
      const usuario = {
        id: 'dev-user',
        email: loginDto.email,
        nome: 'Dev User',
        tipo: 'ADMIN_EMPRESA',
        telefone: '',
        empresaId: 'dev-empresa',
        empresa: this.devEmpresa(),
      };
      const payload: JwtPayload = {
        sub: usuario.id,
        email: usuario.email,
        role: usuario.tipo as any,
        empresaId: usuario.empresaId,
      };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = uuidv4();
      return {
        accessToken,
        refreshToken,
        user: {
          id: usuario.id,
          email: usuario.email,
          nome: usuario.nome,
          role: usuario.tipo,
          telefone: usuario.telefone,
          empresaId: usuario.empresaId,
          empresa: usuario.empresa,
        },
        empresa: usuario.empresa,
      };
    }
    const usuario = await this.validateUser(loginDto.email, loginDto.senha);

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      role: usuario.tipo,
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
        role: usuario.tipo,
        telefone: usuario.telefone,
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
        tipo: signupDto.empresaId ? 'CLIENTE' : 'SUPER_ADMIN',
      },
      select: {
        id: true,
        email: true,
        nome: true,
        tipo: true,
        empresaId: true,
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

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      role: usuario.tipo,
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
        tipo: usuario.tipo,
        empresaId: usuario.empresaId,
        empresa: usuario.empresa,
      },
    };
  }

  async refreshAccessToken(refreshToken: string) {
    if (this.useMockAuth) {
      throw new UnauthorizedException('Mock auth está desativada.');
    }
    if (!this.prisma.connected) {
      throw new UnauthorizedException('Indisponível no modo desenvolvimento');
    }

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
      role: usuario.tipo,
      empresaId: usuario.empresaId,
    };

    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async logout(refreshToken: string) {
    if (this.useMockAuth) {
      throw new UnauthorizedException('Mock auth está desativada.');
    }

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
    if (this.useMockAuth) {
      return uuidv4();
    }
    if (!this.prisma.connected) {
      return uuidv4();
    }

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

  async createAccountFromOrder(createAccountDto: CreateAccountFromOrderDto) {
    // Verificar se email já existe
    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { email: createAccountDto.email },
    });

    if (usuarioExistente) {
      throw new ConflictException('Email já cadastrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createAccountDto.senha, 10);

    // Criar usuário
    const usuario = await this.prisma.usuario.create({
      data: {
        email: createAccountDto.email,
        senha: hashedPassword,
        nome: createAccountDto.nome,
        telefone: createAccountDto.telefone,
        tipo: 'CLIENTE',
      },
      include: { empresa: true, endereco: true },
    });

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      role: usuario.tipo,
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
        telefone: usuario.telefone,
        tipo: usuario.tipo,
      },
    };
  }

  async cadastroEmpresa(cadastroEmpresaDto: CadastroEmpresaDto) {
    // Verificar se email do admin já existe
    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { email: cadastroEmpresaDto.emailAdmin },
    });

    if (usuarioExistente) {
      throw new ConflictException('Email já cadastrado');
    }

    // Verificar se slug já existe
    const empresaExistente = await this.prisma.empresa.findUnique({
      where: { slug: cadastroEmpresaDto.slug },
    });

    if (empresaExistente) {
      throw new ConflictException('Slug já está em uso');
    }

    // Hash da senha do admin
    const hashedPassword = await bcrypt.hash(cadastroEmpresaDto.senhaAdmin, 10);

    // Criar empresa e usuário admin em uma transação
    const resultado = await this.prisma.$transaction(async (tx) => {
      // Criar empresa
      const empresa = await tx.empresa.create({
        data: {
          nome: cadastroEmpresaDto.nomeEmpresa,
          email: cadastroEmpresaDto.emailAdmin,
          telefone: cadastroEmpresaDto.telefoneEmpresa,
          endereco: cadastroEmpresaDto.endereco ? 
            `${cadastroEmpresaDto.endereco}, ${cadastroEmpresaDto.cidade}, ${cadastroEmpresaDto.estado}, ${cadastroEmpresaDto.cep}` : 
            undefined,
          slug: cadastroEmpresaDto.slug,
          subdominio: cadastroEmpresaDto.slug,
          ativo: true,
        },
        select: {
          id: true,
          nome: true,
          slug: true,
        },
      });

      // Criar usuário admin da empresa
      const usuarioAdmin = await tx.usuario.create({
        data: {
          email: cadastroEmpresaDto.emailAdmin,
          senha: hashedPassword,
          nome: cadastroEmpresaDto.nomeAdmin,
          telefone: cadastroEmpresaDto.telefoneAdmin,
          empresaId: empresa.id,
          tipo: 'ADMIN_EMPRESA',
          ativo: true,
        },
        select: {
          id: true,
          email: true,
          nome: true,
          tipo: true,
          empresaId: true,
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

      return { empresa, usuarioAdmin };
    });

    // Gerar tokens JWT
    const payload: JwtPayload = {
      sub: resultado.usuarioAdmin.id,
      email: resultado.usuarioAdmin.email,
      role: resultado.usuarioAdmin.tipo,
      empresaId: resultado.usuarioAdmin.empresaId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(resultado.usuarioAdmin.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: resultado.usuarioAdmin.id,
        email: resultado.usuarioAdmin.email,
        nome: resultado.usuarioAdmin.nome,
        tipo: resultado.usuarioAdmin.tipo,
        empresaId: resultado.usuarioAdmin.empresaId,
        empresa: resultado.usuarioAdmin.empresa,
      },
      empresa: {
        id: resultado.empresa.id,
        nome: resultado.empresa.nome,
        slug: resultado.empresa.slug,
      },
    };
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
