import { IsString, IsInt, IsDateString, IsOptional } from 'class-validator';

export class UpdateApplicationDto {
    @IsOptional()
    @IsString()
    client_name?: string;

    @IsOptional()
    @IsString()
    client_phone?: string;

    @IsOptional()
    @IsString()
    car_brand?: string;

    @IsOptional()
    @IsString()
    car_model?: string;

    @IsOptional()
    @IsInt()
    car_year?: number;

    @IsOptional()
    @IsString()
    work_description?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsDateString()
    appointment_date?: Date;
}