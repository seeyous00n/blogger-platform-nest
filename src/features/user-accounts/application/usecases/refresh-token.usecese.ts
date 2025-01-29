import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../infrastructure/auth.repository';
import { AuthService } from '../auth.service';
import { TokensDto } from '../../dto/tokens.dto';

export class RefreshTokenCommand {
  constructor(public token: string) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand, TokensDto>
{
  constructor(
    private authRepository: AuthRepository,
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

    await this.authRepository.save(session);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
