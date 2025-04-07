import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { MinioController } from './minio.controller';
import { PhotoModule } from '../photos/photo.module'; // ✅ Правильный путь
@Module({
  imports: [PhotoModule], // ✅ Добавляем PhotoModule
  controllers: [MinioController],
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule {}
