import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000';

    app.use(cookieParser());

    app.enableCors({
        origin: frontendOrigin,
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    });

    app.use((req: Request, res: Response, next: NextFunction) => {
        const unsafeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

        if (
            unsafeMethods.includes(req.method) &&
            req.headers.origin &&
            req.headers.origin !== frontendOrigin
        ) {
            res.status(403).json({
                statusCode: 403,
                message: 'Origen de solicitud no autorizado',
            });
            return;
        }

        next();
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.enableShutdownHooks();

    await app.listen(Number(process.env.PORT ?? 3001), '0.0.0.0');
}

bootstrap().catch((error: unknown) => {
    console.error('Failed to start NestJS:', error);
    process.exitCode = 1;
});