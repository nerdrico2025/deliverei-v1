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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificacoesController = void 0;
const common_1 = require("@nestjs/common");
const notificacoes_service_1 = require("./notificacoes.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const roles_guard_1 = require("../../guards/roles.guard");
const roles_decorator_1 = require("../../decorators/roles.decorator");
const TipoUsuario = {
    CLIENTE: 'CLIENTE',
    ADMIN_EMPRESA: 'ADMIN_EMPRESA',
    SUPER_ADMIN: 'SUPER_ADMIN'
};
let NotificacoesController = class NotificacoesController {
    constructor(notificacoesService) {
        this.notificacoesService = notificacoesService;
    }
    create(createNotificacaoDto) {
        return this.notificacoesService.create(createNotificacaoDto);
    }
    findAll(req, page, limit, tipo, lida) {
        return this.notificacoesService.findAll(req.user.sub, page, limit, tipo, lida);
    }
    countNaoLidas(req) {
        return this.notificacoesService.countNaoLidas(req.user.sub);
    }
    findOne(id, req) {
        return this.notificacoesService.findOne(id, req.user.sub);
    }
    update(id, updateNotificacaoDto, req) {
        return this.notificacoesService.update(id, updateNotificacaoDto, req.user.sub);
    }
    marcarComoLida(id, req) {
        return this.notificacoesService.marcarComoLida(id, req.user.sub);
    }
    marcarTodasComoLidas(req) {
        return this.notificacoesService.marcarTodasComoLidas(req.user.sub);
    }
    remove(id, req) {
        return this.notificacoesService.remove(id, req.user.sub);
    }
};
exports.NotificacoesController = NotificacoesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(TipoUsuario.ADMIN_EMPRESA, TipoUsuario.SUPER_ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateNotificacaoDto]),
    __metadata("design:returntype", void 0)
], NotificacoesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('tipo')),
    __param(4, (0, common_1.Query)('lida')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, Boolean]),
    __metadata("design:returntype", void 0)
], NotificacoesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('nao-lidas'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificacoesController.prototype, "countNaoLidas", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NotificacoesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateNotificacaoDto, Object]),
    __metadata("design:returntype", void 0)
], NotificacoesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/marcar-lida'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NotificacoesController.prototype, "marcarComoLida", null);
__decorate([
    (0, common_1.Patch)('marcar-todas-lidas'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificacoesController.prototype, "marcarTodasComoLidas", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NotificacoesController.prototype, "remove", null);
exports.NotificacoesController = NotificacoesController = __decorate([
    (0, common_1.Controller)('notificacoes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [notificacoes_service_1.NotificacoesService])
], NotificacoesController);
//# sourceMappingURL=notificacoes.controller.js.map