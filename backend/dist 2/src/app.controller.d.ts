import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getInfo(): {
        name: string;
        version: string;
        description: string;
        endpoints: {
            auth: string;
            produtos: string;
            public: string;
            health: string;
        };
    };
    healthCheck(): {
        status: string;
        timestamp: string;
    };
}
