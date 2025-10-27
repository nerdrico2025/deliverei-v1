"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentEmpresa = void 0;
const common_1 = require("@nestjs/common");
exports.CurrentEmpresa = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.empresa;
});
//# sourceMappingURL=current-empresa.decorator.js.map