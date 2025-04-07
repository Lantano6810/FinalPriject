import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  Body,
  Delete,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from './minio.service';
import { PhotoService } from '../photos/photo.service';
import { Express } from 'express';

@Controller('minio')
export class MinioController {
  constructor(
    private readonly minioService: MinioService,
    private readonly photoService: PhotoService, // ✅ Подключаем PhotoService
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('bucketName') bucketName: string,
    @Body('service_id') serviceId: number,
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Файл не загружен или поврежден.');
    }
    if (!bucketName || !serviceId) {
      throw new BadRequestException(
        'Не указано название бакета или service_id.',
      );
    }

    const fileUrl = await this.minioService.uploadFile(
      bucketName,
      file.originalname,
      file.buffer,
    );

    // ✅ Сохраняем фото в базу данных
    const savedPhoto = await this.photoService.savePhoto(serviceId, fileUrl);

    return {
      message: 'Файл загружен успешно',
      url: fileUrl,
      id: savedPhoto.id,
    }; // ✅ Возвращаем id фото
  }

  @Get('photos/:serviceId')
  async getPhotos(@Param('serviceId') serviceId: number) {
    return this.photoService.getPhotosByService(serviceId);
  }

  @Delete('delete/:photoId')
  async deletePhoto(@Param('photoId') photoId: number) {
    const photo = await this.photoService.getPhotoById(photoId);
    if (!photo) {
      throw new BadRequestException('Файл не найден.');
    }

    const fileName = photo.url.split('/').pop() || ''; // ✅ Гарантируем, что это строка

    if (!fileName) {
      throw new BadRequestException('Не удалось определить имя файла.');
    }

    await this.minioService.deleteFile('avatars', fileName); // ✅ Удаляем из Minio
    await this.photoService.deletePhoto(photoId); // ✅ Удаляем из базы

    return { message: 'Фото удалено' };
  }
}
