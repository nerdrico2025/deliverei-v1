"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagamentosModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const pagamentos_controller_1 = require("./pagamentos.controller");
const pagamentos_service_1 = require("./pagamentos.service");
const asaas_service_1 = require("./asaas.service");
const prisma_service_1 = require("../../database/prisma.service");
let PagamentosModule = class PagamentosModule {
};
exports.PagamentosModule = PagamentosModule;
exports.PagamentosModule = PagamentosModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule],
        controllers: [pagamentos_controller_1.PagamentosController],
        providers: [pagamentos_service_1.PagamentosService, asaas_service_1.AsaasService, prisma_service_1.PrismaService],
        exports: [pagamentos_service_1.PagamentosService, asaas_service_1.AsaasService],
    })
], PagamentosModule);
//# sourceMappingURL=pagamentos.module.js.map