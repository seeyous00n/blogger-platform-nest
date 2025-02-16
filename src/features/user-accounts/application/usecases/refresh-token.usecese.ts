import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../auth.service';
import { TokensDto } from '../../dto/tokens.dto';
import { AuthSqlRepository } from '../../infrastructure/auth-sql.repository';

export class RefreshTokenCommand {
  constructor(public token: string) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand, TokensDto>
{
  constructor(
    private authSqlRepository: AuthSqlRepository,
    private authService: AuthService,
  ) {}

  async execute(command: RefreshTokenCommand) {
    const { userId, deviceId, iat } = this.authService.getTokenData(
      command.token,
    );
    const session = await this.authService.findSessionByIatAndDeviceIdOrError(
      iat,
      deviceId,
    );

    const tokens = this.authService.getTokens({ userId, deviceId });

    const data = {
      tokenIat: tokens.iat,
      tokenExp: tokens.exp,
    };
    session.update(data);

    await this.authSqlRepository.save(session);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
