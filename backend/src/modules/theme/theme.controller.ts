import { Controller, Get, Put, Body, UseGuards, Request, Header, Logger } from '@nestjs/common';
import { ThemeService, StorefrontThemeSettings, ThemeUpdateResult } from './theme.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

// Enum TipoUsuario como constantes para compatibilidade com SQLite
const TipoUsuario = {
  CLIENTE: 'CLIENTE',
  ADMIN_EMPRESA: 'ADMIN_EMPRESA',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

@Controller('v1/theme')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(TipoUsuario.ADMIN_EMPRESA, TipoUsuario.SUPER_ADMIN)
export class ThemeController {
  private readonly logger = new Logger('ThemeController');
  constructor(private readonly themeService: ThemeService) {}

  @Get()
  async getTheme(@Request() req) {
    this.logger.log(`GET theme for empresaId=${req.user?.empresaId}`);
    const settings = await this.themeService.getForEmpresa(req.user.empresaId);
    return { settings };
  }

  @Put()
  async updateTheme(@Request() req, @Body() body: StorefrontThemeSettings): Promise<ThemeUpdateResult> {
    // Basic shape validation (colors required). Deeper validation is handled on frontend.
    if (!body?.primaryColor || !body?.secondaryColor) {
      return { sucesso: false, mensagem: 'Cores obrigatórias ausentes' };
    }
    this.logger.log(
      `PUT theme empresaId=${req.user?.empresaId} primary=${body.primaryColor} secondary=${body.secondaryColor} accent=${body.accentColor || '-'} bg=${body.backgroundImage ? 'yes' : 'no'}`
    );
    const res = await this.themeService.updateForEmpresa(req.user.empresaId, {
      backgroundImage: body.backgroundImage,
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      accentColor: body.accentColor,
      updatedAt: Date.now(),
    });
    if (res?.sucesso) {
      this.logger.log(`Theme updated successfully for empresaId=${req.user?.empresaId}`);
    } else {
      this.logger.warn(`Theme update failed for empresaId=${req.user?.empresaId}: ${res?.mensagem || 'unknown error'}`);
    }
    return res;
  }
}