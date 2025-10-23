
import {
  Controller,
  Post,
  Body,
  Headers,
  RawBodyRequest,
  Req,
  Get,
  UseGuards,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { WebhooksService } from './webhooks.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.webhooksService.processarWebhookStripe(
      req.rawBody.toString(),
      signature,
    );
  }

  @Post('asaas')
  async handleAsaasWebhook(
    @Headers('asaas-access-token') token: string,
    @Body() body: any,
  ) {
    return this.webhooksService.processarWebhookAsaas(body, token);
  }

  @Get('logs')
  @UseGuards(JwtAuthGuard)
  async listarLogs(
    @Query('origem') origem?: string,
    @Query('processado') processado?: string,
  ) {
    return this.webhooksService.listarLogs(origem, processado === 'true');
  }
}
