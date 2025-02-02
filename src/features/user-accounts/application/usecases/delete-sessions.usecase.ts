import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../auth.service';
import { AuthSqlRepository } from '../../infrastructure/auth-sql.repository';

export class DeleteSessionsCommand {
  constructor(public token: string) {}
}

@CommandHandler(DeleteSessionsCommand)
export class DeleteSessionsUseCase
  implements ICommandHandler<DeleteSessionsCommand, void>
{
  constructor(
    private authService: AuthService,
    private authSqlRepository: AuthSqlRepository,
  ) {}

  async execute(command: DeleteSessionsCommand): Promise<void> {
    const { userId, deviceId } = this.authService.getTokenData(command.token);

    await this.authSqlRepository.deleteAllExceptCurrent({ userId, deviceId });
  }
}
