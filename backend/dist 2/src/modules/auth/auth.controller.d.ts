import { AuthService } from './auth.service';
import { LoginDto, SignupDto, RefreshTokenDto, CreateAccountFromOrderDto, CadastroEmpresaDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    refresh(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
    }>;
    logout(refreshTokenDto: RefreshTokenDto): Promise<{
        message: string;
    }>;
}
