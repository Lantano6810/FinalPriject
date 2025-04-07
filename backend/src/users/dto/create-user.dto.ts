import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '../user.entity';

export class CreateUserDto {
    @IsEmail({}, { message: 'Некорректный email, введите корректный адрес' })
    email: string;

    @IsString({ message: 'Пароль должен быть строкой' })
    @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
    password: string;

    @IsString({ message: 'Имя должно быть строкой' })
    name: string;

    @IsEnum(UserRole, { message: 'Роль может быть только "Автосервис" или "Автовладелец"' })
    role?: UserRole = UserRole.CAROWNER;
}