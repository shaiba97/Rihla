import { NestFactory } from '@nestjs/core';
import { CompanyModule } from './company.module';
import { RedisIoAdapter } from '@app/websocket';
import * as path from 'path';
import * as express from 'express';
import { getWhatsAppSock } from './config/whatsapp';

async function bootstrap() {
  const app = await NestFactory.create(CompanyModule);
  app.useWebSocketAdapter(new RedisIoAdapter(app));

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://localhost:4100',
      'http://localhost:4000',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  await app.listen(3001);
  console.log('Listening on port 3001');

  getWhatsAppSock().catch((err: any) => {
    console.error('WhatsApp init failed:', err.message);
  });
}
bootstrap();
