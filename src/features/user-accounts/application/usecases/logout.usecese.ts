import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../auth.service';
import { AuthSqlRepository } from '../../infrastructure/auth-sql.repository';

export class LogoutCommand {
  constructor(public token: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand, void> {
  constructor(
    private authSqlRepository: AuthSqlRepository,
    private authService: AuthService,
  ) {}

  async execute(command: LogoutCommand) {
    const { iat, deviceId } = this.authService.getTokenData(command.token);
    const session = await this.authService.findSessionByIatAndDeviceIdOrError(
      iat,
      deviceId,
    );
    await this.authSqlRepository.delete(session.id);
  }
}
