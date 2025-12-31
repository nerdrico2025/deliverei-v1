export declare class AppService {
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
}
