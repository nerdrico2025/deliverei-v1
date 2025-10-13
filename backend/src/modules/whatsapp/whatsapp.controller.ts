
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('whatsapp')
@UseGuards(JwtAuthGuard)
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('enviar')
  async enviarMensagem(
    @Body() body: { telefone: string; mensagem: string; pedidoId?: string },
    @Request() req,
  ) {
    return this.whatsappService.enviarMensagem(
      req.user.empresaId,
      body.telefone,
      body.mensagem,
      body.pedidoId,
    );
  }

  @Get('mensagens')
  async listarMensagens(@Request() req) {
    return this.whatsappService.listarMensagens(req.user.empresaId);
  }

  @Get('mensagens/pedido/:pedidoId')
  async listarMensagensPorPedido(
    @Param('pedidoId') pedidoId: string,
    @Request() req,
  ) {
    return this.whatsappService.listarMensagensPorPedido(
      pedidoId,
      req.user.empresaId,
    );
  }

  @Post('configurar')
  async configurar(
    @Body() body: { whatsappNumero: string; whatsappToken: string },
    @Request() req,
  ) {
    return this.whatsappService.configurarWhatsApp(
      req.user.empresaId,
      body.whatsappNumero,
      body.whatsappToken,
    );
  }
}
