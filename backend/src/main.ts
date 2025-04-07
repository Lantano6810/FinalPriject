import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe()); // Включаем глобальную валидацию
  app.enableCors(); // Разрешаем CORS

  await app.listen(3001);
}
bootstrap();