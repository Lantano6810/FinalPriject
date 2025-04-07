import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './applications.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { User } from '../users/user.entity';
import { Service } from '../services/services.entity';

@Injectable()
export class ApplicationsService {
    constructor(
        @InjectRepository(Application)
        private applicationsRepository: Repository<Application>,

        @InjectRepository(User)
        private usersRepository: Repository<User>,

        @InjectRepository(Service)
        private servicesRepository: Repository<Service>,
    ) {}

    async create(dto: CreateApplicationDto, userId: number, serviceServiceId: number): Promise<Application> {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`Пользователь с ID ${userId} не найден`);
        }

        const service = await this.servicesRepository.findOne({ where: { service_id: serviceServiceId } });
        if (!service) {
            throw new NotFoundException(`Сервис с ID ${serviceServiceId} не найден`);
        }

        const application = this.applicationsRepository.create({
            ...dto,
            user,
            service,
        });

        return await this.applicationsRepository.save(application);
    }

    async findAll(): Promise<Application[]> {
        return await this.applicationsRepository.find({ relations: ['user', 'service'] });
    }

    async findOne(id: number): Promise<Application> {
        const application = await this.applicationsRepository.findOne({
            where: { id },
            relations: ['user', 'service'],
        });
        if (!application) {
            throw new NotFoundException(`Заявка с ID ${id} не найдена`);
        }
        return application;
    }

    async update(id: number, dto: UpdateApplicationDto): Promise<Application> {
        const application = await this.findOne(id);
        Object.assign(application, dto);
        return this.applicationsRepository.save(application);
    }

    async remove(id: number): Promise<{ message: string; id: number }> {
        const result = await this.applicationsRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Заявка с ID ${id} не найдена`);
        }
        return { message: 'Заявка удалена', id };
    }

    // ✅ Получить все заявки по ID сервиса
    async findByServiceId(serviceId: number): Promise<Application[]> {
        return this.applicationsRepository.find({
            where: {
                service: { service_id: serviceId },
            },
            relations: ['user', 'service'],
            order: {
                appointment_date: 'DESC',
                created_time: 'DESC',
            },
        });
    }

    // ✅ Получить все заявки по ID пользователя
    async findByUserId(userId: number): Promise<Application[]> {
        return this.applicationsRepository.find({
            where: {
                user: { id: userId },
            },
            relations: ['user', 'service'],
            order: {
                appointment_date: 'DESC',
                created_time: 'DESC',
            },
        });
    }
}