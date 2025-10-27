"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCupomDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_cupom_dto_1 = require("./create-cupom.dto");
class UpdateCupomDto extends (0, mapped_types_1.PartialType)(create_cupom_dto_1.CreateCupomDto) {
}
exports.UpdateCupomDto = UpdateCupomDto;
//# sourceMappingURL=update-cupom.dto.js.map