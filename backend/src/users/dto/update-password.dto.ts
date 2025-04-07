import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
    @IsString()
    oldPassword: string; // Для проверки текущего пароля

    @IsString()
    @MinLength(6, { message: 'Пароль должен быть минимум 6 символов' })
    newPassword: string;
}