import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
export declare const LIMITE_KEY = "limite";
export declare class LimitesGuard implements CanActivate {
    private reflector;
    private prisma;
    constructor(reflector: Reflector, prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
