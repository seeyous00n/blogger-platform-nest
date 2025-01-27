import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../infrastructure/auth.repository';
import { AuthService } from '../auth.service';

export class LogoutCommand {
  constructor(public token: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand, void> {
  constructor(
    private authRepository: AuthRepository,
    private authService: AuthService,
  ) {}

  async execute(command: LogoutCommand) {
    const { iat, deviceId } = this.authService.getTokenData(command.token);
    const session = await this.authService.findSessionByIatAndDeviceIdOrError(
      iat,
      deviceId,
    );
    await this.authRepository.delete(session._id.toString());
  }
}
