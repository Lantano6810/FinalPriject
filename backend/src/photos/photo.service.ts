import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from './photo.entity';
import { Service } from '../services/services.entity';

@Injectable()
export class PhotoService {
    constructor(
        @InjectRepository(Photo)
        private photoRepository: Repository<Photo>,
        @InjectRepository(Service)
        private serviceRepository: Repository<Service>,
    ) {}

    async savePhoto(serviceId: number, url: string): Promise<Photo> {
        const service = await this.serviceRepository.findOneBy({ service_id: serviceId }); // ✅ Используем service_id
        if (!service) {
            throw new Error('Сервис не найден');
        }

        const photo = this.photoRepository.create({ service, url });
        return this.photoRepository.save(photo);
    }

    async getPhotosByService(serviceId: number): Promise<Photo[]> {
        return this.photoRepository.find({
            where: { service: { service_id: serviceId } }, // ✅ Используем service_id
            relations: ['service'],
        });
    }

    async getPhotoById(photoId: number): Promise<Photo | null> {
        return this.photoRepository.findOneBy({ id: photoId });
    }

    async deletePhoto(photoId: number): Promise<void> {
        await this.photoRepository.delete(photoId);
    }
}