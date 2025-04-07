import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Service } from '../services/services.entity'; // ✅ Импортируем сущность сервиса

@Entity()
export class Application {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.applications, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Service, (service) => service.applications, { onDelete: 'CASCADE' }) // ✅ Добавляем связь с сервисом
    service: Service;

    @CreateDateColumn({ type: 'date' })
    created_date: Date;

    @CreateDateColumn({ type: 'time' })
    created_time: string;

    @Column()
    client_name: string;

    @Column()
    client_phone: string;

    @Column()
    car_brand: string;

    @Column()
    car_model: string;

    @Column()
    car_year: number;

    @Column('text')
    work_description: string;

    @Column({ default: 'pending' })
    status: string; // Например: 'pending', 'approved', 'completed', 'canceled'

    @Column({ type: 'date', nullable: true })
    appointment_date: Date;
}