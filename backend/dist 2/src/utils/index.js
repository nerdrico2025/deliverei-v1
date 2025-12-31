"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePagination = exports.paginatedResponse = exports.validateOwnershipOrAdmin = exports.validateEntityExists = void 0;
var validation_helpers_1 = require("./validation.helpers");
Object.defineProperty(exports, "validateEntityExists", { enumerable: true, get: function () { return validation_helpers_1.validateEntityExists; } });
Object.defineProperty(exports, "validateOwnershipOrAdmin", { enumerable: true, get: function () { return validation_helpers_1.validateOwnershipOrAdmin; } });
var response_helpers_1 = require("./response.helpers");
Object.defineProperty(exports, "paginatedResponse", { enumerable: true, get: function () { return response_helpers_1.paginatedResponse; } });
Object.defineProperty(exports, "calculatePagination", { enumerable: true, get: function () { return response_helpers_1.calculatePagination; } });
__exportStar(require("./date.helpers"), exports);
//# sourceMappingURL=index.js.map