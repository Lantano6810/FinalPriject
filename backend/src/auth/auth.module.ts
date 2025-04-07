import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { ServicesService } from '../services/services.service'; // ✅ Добавляем сервис
import { ServicesModule } from '../services/services.module'; // ✅ Добавляем модуль
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import { Service } from '../services/services.entity';

@Module({
    imports: [
        ConfigModule,
        PassportModule,
        UsersModule,
        ServicesModule, // ✅ Импортируем ServicesModule
        TypeOrmModule.forFeature([User, Service]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'fallback-secret',
                signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1h' },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, UsersService, ServicesService], // ✅ Добавляем ServicesService
    exports: [AuthService],
})
export class AuthModule {}