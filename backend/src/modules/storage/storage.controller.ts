import { Controller, Post, Body, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('v1/storage')
export class StorageController {
  constructor(private readonly service: StorageService) {}

  @Post('ensure-bucket')
  @UseGuards(JwtAuthGuard)
  async ensureBucket(@Body() body: { name?: string }) {
    return this.service.ensureBucket(body?.name || 'produtos');
  }

  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: any,
    @Body() body: { bucket?: string },
  ) {
    if (!file?.buffer || !file?.originalname) {
      return { ok: false, mensagem: 'Arquivo ausente' };
    }
    const res = await this.service.uploadImage(file.buffer, file.originalname, body?.bucket);
    return { ok: true, url: res.url };
  }
}
