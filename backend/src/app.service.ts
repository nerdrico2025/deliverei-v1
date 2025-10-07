import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'DELIVEREI API',
      version: '1.0.0',
      description: 'API multi-tenant para sistema de delivery',
      endpoints: {
        auth: '/api/auth',
        produtos: '/api/produtos',
        public: '/api/public',
        health: '/api/health',
      },
    };
  }
}
