"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEntityExists = validateEntityExists;
exports.validateOwnershipOrAdmin = validateOwnershipOrAdmin;
const common_1 = require("@nestjs/common");
function validateEntityExists(entity, entityName) {
    if (!entity) {
        throw new common_1.NotFoundException(`${entityName} não encontrado`);
    }
    return entity;
}
function validateOwnershipOrAdmin(entityUserId, currentUserId, isAdmin = false) {
    if (!isAdmin && entityUserId !== currentUserId) {
        throw new common_1.ForbiddenException('Acesso negado: você não tem permissão para acessar este recurso');
    }
}
//# sourceMappingURL=validation.helpers.js.map