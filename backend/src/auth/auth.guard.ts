import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Токен отсутствует');
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = this.jwtService.verify(token); // Декодируем токен
            console.log('✅ Расшифрованный токен:', decoded); // 👀 Логируем токен
            request.user = decoded; // Добавляем пользователя в request
            return true;
        } catch (error) {
            console.error('❌ Ошибка в токене:', error.message);
            throw new ForbiddenException('Недействительный токен');
        }
    }
}