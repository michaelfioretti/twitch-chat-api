import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.setGlobalPrefix('/api');
  app.useGlobalPipes(new ValidationPipe());

  // Enable CORS with only GET requests allowed
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
