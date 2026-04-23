import { NestFactory } from '@nestjs/core';
import { CustomerModule } from './customer.module';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(CustomerModule);
  app.use('/uploads', express.static(join(__dirname, '..', '..', '..', 'uploads')));

  await app.listen(process.env.port ?? 3002);
  console.log('Customer service started on port', process.env.port ?? 3002);
}
bootstrap();
