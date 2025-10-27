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
exports.AsaasService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let AsaasService = class AsaasService {
    constructor(httpService) {
        this.httpService = httpService;
        this.baseUrl = 'https://sandbox.asaas.com/api/v3';
        this.apiKey = process.env.ASAAS_API_KEY || 'dummy_key';
    }
    async criarCliente(data) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/customers`, data, {
            headers: {
                'access_token': this.apiKey,
                'Content-Type': 'application/json',
            },
        }));
        return response.data;
    }
    async criarCobranca(data) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/payments`, data, {
            headers: {
                'access_token': this.apiKey,
                'Content-Type': 'application/json',
            },
        }));
        return response.data;
    }
    async buscarCobranca(paymentId) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/payments/${paymentId}`, {
            headers: {
                'access_token': this.apiKey,
            },
        }));
        return response.data;
    }
    async cancelarCobranca(paymentId) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.delete(`${this.baseUrl}/payments/${paymentId}`, {
            headers: {
                'access_token': this.apiKey,
            },
        }));
        return response.data;
    }
};
exports.AsaasService = AsaasService;
exports.AsaasService = AsaasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], AsaasService);
//# sourceMappingURL=asaas.service.js.map