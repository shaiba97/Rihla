import { NestFactory } from '@nestjs/core';
import { CustomerModule } from './customer.module';
import { RedisIoAdapter } from '@app/websocket';
import * as path from 'path';
import * as express from 'express';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(CustomerModule);
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

  // Create upload directory structure
  const uploadDir = path.join(__dirname, '../../../upload');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`✅ Created upload directory: ${uploadDir}`);
  }

  const uploadsDir = path.join(__dirname, '../../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`✅ Created uploads directory: ${uploadsDir}`);
  }

  app.use('/upload', express.static(path.join(__dirname, '../../../upload')));
  app.use('/uploads', express.static(path.join(__dirname, '../../../uploads')));

  await app.listen(process.env.port ?? 3002);
  console.log('Customer service started on port', process.env.port ?? 3002);
}
bootstrap();
