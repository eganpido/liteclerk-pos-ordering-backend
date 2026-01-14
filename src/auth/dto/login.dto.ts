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
    terminalId: number; // ID sa database

    @IsString()
    @IsNotEmpty()
    terminalNumber: string; // E.g., "TERM-01"
}