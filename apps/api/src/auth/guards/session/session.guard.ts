import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from '../../auth.service';
import { SessionRequest } from '../../types/session.types';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<SessionRequest>();

    const token: unknown = request.cookies?.tractoandes_session;

    if (typeof token !== 'string' || !token) {
      throw new UnauthorizedException(
        'Debes iniciar sesión para continuar',
      );
    }

    request.user = await this.authService.validateSession(token);

    return true;
  }
}