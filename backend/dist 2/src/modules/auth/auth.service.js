"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../database/prisma.service");
const bcrypt = require("bcryptjs");
const uuid_1 = require("uuid");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async validateUser(email, senha) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { email },
            include: { empresa: true },
        });
        if (!usuario) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        if (!usuario.ativo) {
            throw new common_1.UnauthorizedException('Usuário inativo');
        }
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        const { senha: _, ...result } = usuario;
        return result;
    }
    async login(loginDto) {
        const usuario = await this.validateUser(loginDto.email, loginDto.senha);
        const payload = {
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
                role: usuario.role,
                empresaId: usuario.empresaId,
                empresa: usuario.empresa,
            },
        };
    }
    async signup(signupDto) {
        const usuarioExistente = await this.prisma.usuario.findUnique({
            where: { email: signupDto.email },
        });
        if (usuarioExistente) {
            throw new common_1.ConflictException('Email já cadastrado');
        }
        if (signupDto.empresaId) {
            const empresa = await this.prisma.empresa.findUnique({
                where: { id: signupDto.empresaId },
            });
            if (!empresa) {
                throw new common_1.BadRequestException('Empresa não encontrada');
            }
            if (!empresa.ativo) {
                throw new common_1.BadRequestException('Empresa inativa');
            }
        }
        const hashedPassword = await bcrypt.hash(signupDto.senha, 10);
        const usuario = await this.prisma.usuario.create({
            data: {
                email: signupDto.email,
                senha: hashedPassword,
                nome: signupDto.nome,
                empresaId: signupDto.empresaId,
                tipo: signupDto.empresaId ? 'CLIENTE' : 'SUPER_ADMIN',
            },
            include: { empresa: true },
        });
        const payload = {
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
    async refreshAccessToken(refreshToken) {
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
        });
        if (!storedToken) {
            throw new common_1.UnauthorizedException('Token inválido');
        }
        if (new Date() > storedToken.expiresAt) {
            await this.prisma.refreshToken.delete({
                where: { token: refreshToken },
            });
            throw new common_1.UnauthorizedException('Token expirado');
        }
        const usuario = await this.prisma.usuario.findUnique({
            where: { id: storedToken.usuarioId },
        });
        if (!usuario || !usuario.ativo) {
            throw new common_1.UnauthorizedException('Usuário inválido ou inativo');
        }
        const payload = {
            sub: usuario.id,
            email: usuario.email,
            role: usuario.tipo,
            empresaId: usuario.empresaId,
        };
        const accessToken = this.jwtService.sign(payload);
        return { accessToken };
    }
    async logout(refreshToken) {
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
    async generateRefreshToken(usuarioId) {
        const token = (0, uuid_1.v4)();
        const expiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d');
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
    async createAccountFromOrder(createAccountDto) {
        const usuarioExistente = await this.prisma.usuario.findUnique({
            where: { email: createAccountDto.email },
        });
        if (usuarioExistente) {
            throw new common_1.ConflictException('Email já cadastrado');
        }
        const hashedPassword = await bcrypt.hash(createAccountDto.senha, 10);
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
        const payload = {
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
    async cadastroEmpresa(cadastroEmpresaDto) {
        const usuarioExistente = await this.prisma.usuario.findUnique({
            where: { email: cadastroEmpresaDto.emailAdmin },
        });
        if (usuarioExistente) {
            throw new common_1.ConflictException('Email já cadastrado');
        }
        const empresaExistente = await this.prisma.empresa.findUnique({
            where: { slug: cadastroEmpresaDto.slug },
        });
        if (empresaExistente) {
            throw new common_1.ConflictException('Slug já está em uso');
        }
        const hashedPassword = await bcrypt.hash(cadastroEmpresaDto.senhaAdmin, 10);
        const resultado = await this.prisma.$transaction(async (tx) => {
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
            });
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
                include: { empresa: true },
            });
            return { empresa, usuarioAdmin };
        });
        const payload = {
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
    parseTimeToMs(time) {
        const match = time.match(/^(\d+)([dhms])$/);
        if (!match)
            return 7 * 24 * 60 * 60 * 1000;
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map