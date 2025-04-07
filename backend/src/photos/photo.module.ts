import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotoService } from './photo.service';
import { Photo } from './photo.entity';
import { Service } from '../services/services.entity'; // ✅ Импортируем Service

@Module({
    imports: [TypeOrmModule.forFeature([Photo, Service])], // ✅ Добавили Service
    providers: [PhotoService],
    exports: [PhotoService],
})
export class PhotoModule {}