import { Injectable } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  private minioClient: Minio.Client;

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: 'localhost', // Адрес Minio
      port: 9000, // Порт Minio
      useSSL: false, // SSL не нужен для локального запуска
      accessKey: 'admin', // Логин
      secretKey: 'admin123', // Пароль
    });
  }

  async uploadFile(
    bucketName: string,
    fileName: string,
    fileBuffer: Buffer,
  ): Promise<string> {
    try {
      await this.minioClient.putObject(bucketName, fileName, fileBuffer);
      console.log(`✅ Файл ${fileName} успешно загружен в Minio.`);
      return `http://localhost:9000/${bucketName}/${fileName}`;
    } catch (error) {
      console.error('❌ Ошибка загрузки в Minio:', error);
      throw new Error('Ошибка загрузки файла в Minio');
    }
  }

  async deleteFile(bucketName: string, fileName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(bucketName, fileName);
      console.log(`✅ Файл ${fileName} удалён из Minio`);
    } catch (error) {
      console.error('❌ Ошибка удаления файла из Minio:', error);
      throw new Error('Ошибка удаления файла из Minio');
    }
  }
}
