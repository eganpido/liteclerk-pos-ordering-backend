// src/auth/dto/login.dto.ts
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsNumber()
    @IsNotEmpty()
    terminalId: number;

    @IsString()
    @IsNotEmpty()
    terminalNumber: string;
}