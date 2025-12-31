import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export type StorefrontThemeSettings = {
  backgroundImage?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  updatedAt: number;
};

export type ThemeUpdateResult = {
  sucesso: boolean;
  settings?: StorefrontThemeSettings | null;
  mensagem?: string;
};

@Injectable()
export class ThemeService {
  constructor(private readonly prisma: PrismaService) {}
  private memory = new Map<string, StorefrontThemeSettings>();
  private readonly defaultTheme: StorefrontThemeSettings = {
    primaryColor: '#111827',
    secondaryColor: '#F9FAFB',
    accentColor: '#3B82F6',
    updatedAt: Date.now(),
  };

  async getForEmpresa(empresaId: string): Promise<StorefrontThemeSettings | null> {
    try {
      const empresa = await this.prisma.empresa.findUnique({
        where: { id: empresaId },
      });
      if (!empresa) throw new NotFoundException('Empresa não encontrada');
      const theme = (empresa as any)?.vitrineTheme ?? (empresa as any)?.vitrine_theme;
      return (theme as any) || null;
    } catch {
      return this.memory.get(empresaId) ?? this.defaultTheme;
    }
  }

  async updateForEmpresa(empresaId: string, settings: StorefrontThemeSettings): Promise<ThemeUpdateResult> {
    try {
      const updated = await this.prisma.empresa.update({
        where: { id: empresaId },
        data: ({ vitrineTheme: settings } as any),
      });
      const theme = (updated as any)?.vitrineTheme ?? (updated as any)?.vitrine_theme ?? settings;
      return { sucesso: true, settings: theme };
    } catch {
      this.memory.set(empresaId, settings);
      return { sucesso: true, settings };
    }
  }

  async getForSlug(slug: string): Promise<StorefrontThemeSettings | null> {
    try {
      const empresa = await this.prisma.empresa.findUnique({
        where: { slug },
      });
      if (!empresa) throw new NotFoundException('Loja não encontrada');
      const theme = (empresa as any)?.vitrineTheme ?? (empresa as any)?.vitrine_theme;
      return (theme as any) || null;
    } catch {
      return this.defaultTheme;
    }
  }
}
