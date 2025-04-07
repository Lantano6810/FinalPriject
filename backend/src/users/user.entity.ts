import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany } from 'typeorm';
import { Service } from 'src/services/services.entity';
import { Application } from '../applications/applications.entity';


export enum UserRole {
  SERVICE = 'service',
  CAROWNER = 'car_owner',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ type: 'text', default: UserRole.CAROWNER }) // Используем text вместо enum
  role: UserRole;

  @OneToOne(() => Service, (service) => service.user) // Связь с сервисом
  service: Service;

  @OneToMany(() => Application, (application) => application.user, { cascade: true })
  applications: Application[];
}