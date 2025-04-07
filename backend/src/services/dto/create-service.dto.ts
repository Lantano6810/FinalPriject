import { IsString, IsInt, IsOptional, IsArray, IsDateString } from 'class-validator';

export class CreateServiceDto {
    @IsInt()
    user_id: number; // ID пользователя вместо объекта

    @IsString()
    service_name: string;

    @IsOptional()
    @IsString()
    about?: string;

    @IsString()
    city: string;

    @IsOptional() // Адрес не является обязательным
    @IsString()
    address?: string;

    @IsArray()
    @IsString({ each: true })
    works: string[];

    @IsString()
    working_days: string;

    @IsString()
    time_start: string;

    @IsString()
    time_end: string;

    @IsInt()
    daily_limit: number;

    @IsOptional()
    @IsDateString()
    created_at?: Date;
}