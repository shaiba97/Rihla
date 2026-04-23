import { NestFactory } from '@nestjs/core';
import { CompanyModule } from './company.module';

async function bootstrap() {
  const app = await NestFactory.create(CompanyModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:4100'], // Add your frontend URLs
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });
  await app.listen(3001);
  console.log('Listening on port 3001');
}
bootstrap();
