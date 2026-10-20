import { randomBytes } from 'node:crypto';

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionGuard } from './guards/session/session.guard';

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const configuredSecret = config.get<string>('JWT_SECRET');

                if (configuredSecret && configuredSecret.length < 32) {
                    throw new Error('JWT_SECRET must contain at least 32 characters');
                }

                const secret = configuredSecret ?? randomBytes(48).toString('hex');

                return {
                    secret,
                    signOptions: {
                        expiresIn: '2h' as const,
                        algorithm: 'HS256' as const,
                    },
                };
            },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, SessionGuard],
    exports: [AuthService, SessionGuard],
})
export class AuthModule {}
