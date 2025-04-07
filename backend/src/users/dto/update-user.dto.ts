import { IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../user.entity';

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}