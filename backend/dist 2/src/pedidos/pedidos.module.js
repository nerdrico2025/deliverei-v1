"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PedidosModule = void 0;
const common_1 = require("@nestjs/common");
const pedidos_service_1 = require("./pedidos.service");
const pedidos_controller_1 = require("./pedidos.controller");
const prisma_module_1 = require("../database/prisma.module");
const notificacoes_module_1 = require("../modules/notificacoes/notificacoes.module");
const whatsapp_module_1 = require("../modules/whatsapp/whatsapp.module");
let PedidosModule = class PedidosModule {
};
exports.PedidosModule = PedidosModule;
exports.PedidosModule = PedidosModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, notificacoes_module_1.NotificacoesModule, whatsapp_module_1.WhatsappModule],
        controllers: [pedidos_controller_1.PedidosController],
        providers: [pedidos_service_1.PedidosService],
        exports: [pedidos_service_1.PedidosService],
    })
], PedidosModule);
//# sourceMappingURL=pedidos.module.js.map