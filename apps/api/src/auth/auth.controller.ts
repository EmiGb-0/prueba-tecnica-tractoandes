import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import type { Response } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SessionGuard } from './guards/session/session.guard';
import * as sessionTypes from './types/session.types';

const COOKIE_NAME = 'tractoandes_session';
const SESSION_DURATION = 2 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(dto);

    this.setSessionCookie(response, result.token);

    return {
      message: 'Cuenta creada correctamente',
      user: result.user,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(dto);

    this.setSessionCookie(response, result.token);

    return {
      message: 'Sesión iniciada correctamente',
      user: result.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax',
      path: '/',
    });

    return { message: 'Sesión cerrada correctamente' };
  }

  @Get('me')
  @UseGuards(SessionGuard)
  getProfile(@Req() request: sessionTypes.SessionRequest) {
    if (!request.user) {
      throw new UnauthorizedException();
    }

    return request.user;
  }

  private setSessionCookie(
    response: Response,
    token: string,
  ): void {
    response.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_DURATION,
    });
  }
}