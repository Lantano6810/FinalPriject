import { IsString } from 'class-validator';

export class VerifyPasswordDto {
    @IsString()
    oldPassword: string;
}