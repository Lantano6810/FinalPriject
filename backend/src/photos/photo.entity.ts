import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Service } from '../services/services.entity';

@Entity()
export class Photo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    url: string;

    @ManyToOne(() => Service, (service) => service.photos, { onDelete: 'CASCADE' }) // ✅ Добавляем связь с сервисом
    service: Service;
}