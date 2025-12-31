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
exports.TenantMiddleware = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let TenantMiddleware = class TenantMiddleware {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async use(req, res, next) {
        const tenantSlug = req.get('x-tenant-slug');
        let empresa;
        if (tenantSlug) {
            empresa = await this.prisma.empresa.findUnique({
                where: { slug: tenantSlug },
            });
        }
        else {
            const host = req.get('host') || req.hostname;
            const subdomain = this.extractSubdomain(host);
            if (!subdomain) {
                return next();
            }
            empresa = await this.prisma.empresa.findUnique({
                where: { subdominio: subdomain },
            });
        }
        if (!empresa) {
            throw new common_1.NotFoundException(`Loja não encontrada`);
        }
        if (!empresa.ativo) {
            throw new common_1.NotFoundException(`Loja está inativa`);
        }
        req['empresa'] = empresa.id;
        req['empresaId'] = empresa.id;
        next();
    }
    extractSubdomain(host) {
        const hostWithoutPort = host.split(':')[0];
        if (hostWithoutPort === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostWithoutPort)) {
            return null;
        }
        const parts = hostWithoutPort.split('.');
        if (parts.length < 3) {
            return null;
        }
        return parts[0];
    }
};
exports.TenantMiddleware = TenantMiddleware;
exports.TenantMiddleware = TenantMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantMiddleware);
//# sourceMappingURL=tenant.middleware.js.map