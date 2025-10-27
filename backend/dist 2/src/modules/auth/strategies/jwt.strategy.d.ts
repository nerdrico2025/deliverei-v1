import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { PrismaService } from '../../../database/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly prisma;
    private configService;
    constructor(prisma: PrismaService, configService: ConfigService);
    validate(payload: JwtPayload): Promise<{
        sub: string;
        id: string;
        email: string;
        nome: string;
        role: string;
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
    }>;
}
export {};
