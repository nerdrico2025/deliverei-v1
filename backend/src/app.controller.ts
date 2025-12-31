import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorator';
import { PrismaService } from './database/prisma.service';
import { URL } from 'url';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly prisma: PrismaService) {}

  @Get()
  @Public()
  getInfo() {
    return this.appService.getInfo();
  }

  @Get('health')
  @Public()
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('db-health')
  @Public()
  dbHealth() {
    const url = process.env.DATABASE_URL || '';
    let host = '';
    try {
      host = new URL(url).host;
    } catch {}
    return {
      connected: this.prisma.connected,
      host,
      timestamp: new Date().toISOString(),
    };
  }
}
