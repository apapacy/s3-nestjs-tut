import { Controller, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { FastifyRequest } from 'fastify';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/upload')
  async uploadFile(@Req() req: FastifyRequest): Promise<any> {
    const result = await this.appService.uploadFile(req);
    return result;
  }
}
