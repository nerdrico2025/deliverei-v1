import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('PrismaService');
  private _connected = false;
  get connected(): boolean {
    return this._connected;
  }
  async onModuleInit() {
    // Garanta que o backend/.env seja carregado e prevaleça
    try {
      const envPath = path.join(__dirname, '../../.env');
      if (fs.existsSync(envPath)) {
        const parsed = dotenv.parse(fs.readFileSync(envPath));
        if (parsed.DATABASE_URL) process.env.DATABASE_URL = parsed.DATABASE_URL;
        if (parsed.DIRECT_URL) process.env.DIRECT_URL = parsed.DIRECT_URL;
        if (parsed.SUPABASE_PROJECT_REF) process.env.SUPABASE_PROJECT_REF = parsed.SUPABASE_PROJECT_REF;
      }
    } catch {}

    const dbUrl = process.env.DATABASE_URL || '';
    const expectedProjectRef = process.env.SUPABASE_PROJECT_REF || '';

    const host = (() => {
      try {
        return new URL(dbUrl).host;
      } catch {
        return '';
      }
    })();

    const isSupabaseHost = /supabase\.co|pooler\.supabase\.com/.test(host);
    const hasExpectedRef = expectedProjectRef ? dbUrl.includes(expectedProjectRef) : true;

    if (!(isSupabaseHost && hasExpectedRef)) {
      this.logger.warn(`DATABASE_URL inválido para Supabase${expectedProjectRef ? ` (projeto ${expectedProjectRef})` : ''}. Host atual: ${host || 'desconhecido'}.`);
    }

    try {
      await this.$connect();
      this._connected = true;
      this.logger.log('Prisma conectado');
    } catch (err) {
      this._connected = false;
      this.logger.error('Falha ao conectar ao Prisma', err as any);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
