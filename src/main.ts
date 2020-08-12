import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyMultipart from 'fastify-multipart';
import { AppModule } from './app.module';

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter();
  fastifyAdapter.register(fastifyMultipart, {
    limits: {
      fieldNameSize: 1024, // Max field name size in bytes
      fieldSize: 128 * 1024 * 1024 * 1024, // Max field value size in bytes
      fields: 10, // Max number of non-file fields
      fileSize: 128 * 1024 * 1024 * 1024, // For multipart forms, the max file size
      files: 2, // Max number of file fields
      headerPairs: 2000, // Max number of header key=>value pairs
    },
  });
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );
  await app.listen(3000, '127.0.0.1');
}

bootstrap();
