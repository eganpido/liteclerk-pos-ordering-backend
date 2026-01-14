import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    // Gidugangan nato og terminalId ug terminalNumber ang parameters
    async login(username: string, pass: string, terminalId: number, terminalNumber: string) {
        const user = await this.usersService.findOneByUsername(username);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials (Username not found)');
        }

        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials (Invalid password)');
        }

        const payload = {
            userId: user.userId,
            username: user.username,
            fullName: user.fullName,
            terminalId: terminalId,
            terminalNumber: terminalNumber
        };

        return {
            access_token: await this.jwtService.signAsync(payload),
            user: {
                userId: user.userId,
                username: user.username,
                fullName: user.fullName,
                terminalId: terminalId,
                terminalNumber: terminalNumber
            }
        };
    }
}