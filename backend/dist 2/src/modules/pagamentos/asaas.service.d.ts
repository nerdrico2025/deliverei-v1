import { HttpService } from '@nestjs/axios';
export declare class AsaasService {
    private httpService;
    private readonly baseUrl;
    private readonly apiKey;
    constructor(httpService: HttpService);
    criarCliente(data: {
        name: string;
        email: string;
        cpfCnpj: string;
        phone: string;
    }): Promise<any>;
    criarCobranca(data: {
        customer: string;
        billingType: string;
        value: number;
        dueDate: string;
        description: string;
    }): Promise<any>;
    buscarCobranca(paymentId: string): Promise<any>;
    cancelarCobranca(paymentId: string): Promise<any>;
}
