import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string) {
    this.logger.log('Validating local credentials', { email });
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      this.logger.warn('Invalid credentials supplied', { email });
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log('Local credentials validated', { email, userId: user.id });
    return user;
  }
}
