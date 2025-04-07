import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from '../services/services.entity'; // ✅ Импортируем Service

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    @InjectRepository(Service) // ✅ Репозиторий сервисов
    private readonly servicesRepository: Repository<Service>,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // ✅ Получаем service_id по user_id, если он связан с сервисом
    const service = await this.servicesRepository.findOne({
      where: { user: { id: user.id } },
    });

    const serviceId = service ? service.service_id : null; // ✅ Если сервис найден, берем service_id

    const token = await this.authService.login(user);

    return {
      token,
      role: user.role,
      user_id: user.id, // ✅ добавляем id пользователя
      service_id: serviceId, // ✅ добавляем service_id
    };
  }

  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Отсутствует refresh-токен');
    }

    return this.authService.refreshToken(refreshToken);
  }
}
