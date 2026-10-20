import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { PrismaService } from '../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SessionUser } from './types/session.types';

interface AuthResult {
    user: SessionUser;
    token: string;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async register(dto: RegisterDto): Promise<AuthResult> {
        const passwordHash = await argon2.hash(dto.password, {
            type: argon2.argon2id,
        });

        let user: SessionUser;

        try {
            user = await this.prisma.user.create({
                data: {
                    name: dto.name,
                    email: dto.email,
                    passwordHash,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            });
        } catch (error: unknown) {
            if (
                typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                error.code === 'P2002'
            ) {
                throw new ConflictException('Ya existe una cuenta con este correo electrónico');
            }

            throw error;
        }

        return this.createSession(user);
    }

    async login(dto: LoginDto): Promise<AuthResult> {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            select: {
                id: true,
                name: true,
                email: true,
                passwordHash: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        const isValid = await argon2.verify(user.passwordHash, dto.password);

        if (!isValid) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        return this.createSession({
            id: user.id,
            name: user.name,
            email: user.email,
        });
    }

    async validateSession(token: string): Promise<SessionUser> {
        let payload: { sub: string };

        try {
            payload = await this.jwtService.verifyAsync<{ sub: string }>(token);

            if (!payload?.sub || typeof payload.sub !== 'string') {
                throw new Error('Invalid token payload');
            }
        } catch {
            throw new UnauthorizedException('Sesión inválida o expirada');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        return user;
    }

    private async createSession(user: SessionUser): Promise<AuthResult> {
        const token = await this.jwtService.signAsync({
            sub: user.id,
        });

        return { user, token };
    }
}
