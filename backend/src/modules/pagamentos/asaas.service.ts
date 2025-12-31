
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AsaasService {
  private readonly baseUrl = 'https://sandbox.asaas.com/api/v3';
  private readonly apiKey = process.env.ASAAS_API_KEY || 'dummy_key';

  constructor(private httpService: HttpService) {}

  async criarCliente(data: {
    name: string;
    email: string;
    cpfCnpj: string;
    phone: string;
  }, overrideKey?: string) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/customers`, data, {
        headers: {
          'access_token': overrideKey || this.apiKey,
          'Content-Type': 'application/json',
        },
      }),
    );

    return response.data;
  }

  async criarCobranca(data: {
    customer: string;
    billingType: string;
    value: number;
    dueDate: string;
    description: string;
  }, overrideKey?: string) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/payments`, data, {
        headers: {
          'access_token': overrideKey || this.apiKey,
          'Content-Type': 'application/json',
        },
      }),
    );

    return response.data;
  }

  async buscarCobranca(paymentId: string, overrideKey?: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/payments/${paymentId}`, {
        headers: {
          'access_token': overrideKey || this.apiKey,
        },
      }),
    );

    return response.data;
  }

  async cancelarCobranca(paymentId: string, overrideKey?: string) {
    const response = await firstValueFrom(
      this.httpService.delete(`${this.baseUrl}/payments/${paymentId}`, {
        headers: {
          'access_token': overrideKey || this.apiKey,
        },
      }),
    );

    return response.data;
  }

  async testarConexao(overrideKey?: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/customers?limit=1`, {
        headers: {
          'access_token': overrideKey || this.apiKey,
        },
      }),
    );
    return { ok: true, sample: response.data };
  }
}
