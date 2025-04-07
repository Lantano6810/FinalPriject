import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './services/services.module';
import { ApplicationsModule } from './applications/applications.module';
import { MinioModule } from './minio/minio.module'; // ✅ MinioModule
import { MinioService } from './minio/minio.service'; // ✅ MinioService
import { PhotoModule } from './photos/photo.module'; // ✅ PhotoModule
import { User } from './users/user.entity';
import { Service } from './services/services.entity';
import { Application } from './applications/applications.entity';
import { Photo } from './photos/photo.entity'; // ✅ Photo entity

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('POSTGRES_HOST') || 'localhost',
                port: parseInt(configService.get<string>('POSTGRES_PORT') || '5432', 10),
                username: configService.get<string>('POSTGRES_USER') || 'postgres',
                password: configService.get<string>('POSTGRES_PASSWORD') || 'password',
                database: configService.get<string>('POSTGRES_DB') || 'fixmycar_db',
                entities: [User, Service, Application, Photo], // ✅ Добавляем Photo
                synchronize: true, // ❗️ Только для разработки
            }),
        }),
        UsersModule,
        AuthModule,
        ServicesModule,
        ApplicationsModule,
        MinioModule, // ✅ MinioModule
        PhotoModule, // ✅ PhotoModule
    ],
    providers: [
        MinioService, // ✅ MinioService
    ],
    exports: [MinioService], // ✅ Экспортируем MinioService
})
export class AppModule {}