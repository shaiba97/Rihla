import { NestFactory } from '@nestjs/core';
import { AdminModule } from './admin.module';
import * as path from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AdminModule);
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
  app.use('/upload', express.static(path.join(__dirname, '../../../upload')));
  app.use('/uploads', express.static(path.join(__dirname, '../../../uploads')));

  await app.listen(3000);
  console.log('Listening on port 3001');
}
bootstrap();
