import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../application/auth.service';
import { UnauthorizedDomainException } from '../../../../core/exceptions/domain-exception';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'loginOrEmail' });
  }

  async validate(asd: string, rrr: string) {
    const user = await this.authService.checkCredentials({
      loginOrEmail: asd,
      password: rrr,
    });

    if (!user) {
      throw UnauthorizedDomainException.create();
    }

    return user;
  }
}
