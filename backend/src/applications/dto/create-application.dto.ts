import { IsString, IsInt, IsDateString, IsOptional } from 'class-validator';

export class CreateApplicationDto {
    @IsInt()
    user_id: number;

    @IsString()
    client_name: string;

    @IsString()
    client_phone: string;

    @IsString()
    car_brand: string;

    @IsString()
    car_model: string;

    @IsInt()
    car_year: number;

    @IsString()
    work_description: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsDateString()
    appointment_date?: Date;
}