import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto, SignupDto, CreateAccountFromOrderDto, CadastroEmpresaDto } from './dto';
export declare class AuthService {
    private readonly prisma;
    private jwtService;
    private configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    validateUser(email: string, senha: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            nome: any;
            role: any;
            empresaId: any;
            empresa: any;
        };
    }>;
    signup(signupDto: SignupDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            nome: string;
            tipo: string;
            empresaId: string;
            empresa: {
                id: string;
                nome: string;
                email: string;
                telefone: string | null;
                endereco: string | null;
                ativo: boolean;
                slug: string | null;
                subdominio: string | null;
                createdAt: Date;
                updatedAt: Date;
                asaasCustomerId: string | null;
            };
        };
    }>;
    refreshAccessToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    logout(refreshToken: string): Promise<{
        message: string;
    }>;
    private generateRefreshToken;
    createAccountFromOrder(createAccountDto: CreateAccountFromOrderDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            nome: string;
            telefone: string;
            tipo: string;
        };
    }>;
    cadastroEmpresa(cadastroEmpresaDto: CadastroEmpresaDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            nome: string;
            tipo: string;
            empresaId: string;
            empresa: {
                id: string;
                nome: string;
                email: string;
                telefone: string | null;
                endereco: string | null;
                ativo: boolean;
                slug: string | null;
                subdominio: string | null;
                createdAt: Date;
                updatedAt: Date;
                asaasCustomerId: string | null;
            };
        };
        empresa: {
            id: string;
            nome: string;
            slug: string;
        };
    }>;
    private parseTimeToMs;
}
