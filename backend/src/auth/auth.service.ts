import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService, // ✅ Добавляем ConfigService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };

    const secret = this.configService.get<string>('JWT_SECRET');

    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: '1h',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: '7d',
    });

    console.log('✅ Access Token:', accessToken);
    console.log('✅ Refresh Token:', refreshToken);

    return {
      access_token: accessToken, // ✅ Возвращаем как строку
      refresh_token: refreshToken,
      user_id: user.id, // ✅ Добавляем ID юзера
      role: user.role, // ✅ Добавляем роль в ответ
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const decoded = this.jwtService.verify(refreshToken, { secret });

      const payload = {
        email: decoded.email,
        sub: decoded.sub,
        role: decoded.role,
      };
      const newAccessToken = this.jwtService.sign(payload, {
        secret,
        expiresIn: '15m',
      });

      console.log('🔄 Новый Access Token:', newAccessToken);

      return {
        access_token: newAccessToken, // ✅ ТОЛЬКО `access_token`
        role: decoded.role, // ✅ Добавляем роль
        user_id: decoded.sub, // ✅ Добавляем user_id
        iat: Math.floor(Date.now() / 1000), // Время выдачи токена
        exp: Math.floor(Date.now() / 1000) + 900, // Время истечения (15 минут)
      };
    } catch (error) {
      throw new UnauthorizedException('Недействительный refresh-токен');
    }
  }
}
