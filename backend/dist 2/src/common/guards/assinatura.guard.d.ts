import { CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
export declare class AssinaturaGuard implements CanActivate {
    private prisma;
    constructor(prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
