import { IsString, IsInt, IsOptional, IsArray, IsDateString } from 'class-validator';

export class UpdateServiceDto {
    @IsOptional()
    @IsString()
    service_name?: string;

    @IsOptional()
    @IsString()
    about?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    address?: string; // Добавленное поле адреса

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    works?: string[];

    @IsOptional()
    @IsString()
    working_days?: string;

    @IsOptional()
    @IsString()
    time_start?: string;

    @IsOptional()
    @IsString()
    time_end?: string;

    @IsOptional()
    @IsInt()
    daily_limit?: number;

    @IsOptional()
    @IsDateString()
    created_at?: Date;
}