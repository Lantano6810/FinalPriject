import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { Application } from './applications.entity';
import { User } from '../users/user.entity'; // ✅ Добавляем User
import { Service } from '../services/services.entity'; // ✅ Добавляем Service
import { JwtModule } from '@nestjs/jwt'; // ✅ Добавляем JwtModule
import { AuthGuard } from '../auth/auth.guard'; // ✅ Добавляем AuthGuard
import { JwtService } from '@nestjs/jwt'; // ✅ Добавляем JwtService

@Module({
    imports: [
        TypeOrmModule.forFeature([Application, User, Service]), // ✅ Регистрируем Application, User, Service
        JwtModule.register({}), // ✅ Регистрация JwtModule
    ],
    controllers: [ApplicationsController],
    providers: [ApplicationsService, AuthGuard, JwtService], // ✅ Добавляем AuthGuard и JwtService в providers
    exports: [ApplicationsService],
})
export class ApplicationsModule {}