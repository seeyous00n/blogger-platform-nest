import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../infrastructure/auth.repository';
import { AuthService } from '../auth.service';

export class DeleteSessionsCommand {
  constructor(public token: string) {}
}

@CommandHandler(DeleteSessionsCommand)
export class DeleteSessionsUseCase
  implements ICommandHandler<DeleteSessionsCommand, void>
{
  constructor(
    private authRepository: AuthRepository,
    private authService: AuthService,
  ) {}

  async execute(command: DeleteSessionsCommand): Promise<void> {
    const { userId, deviceId } = this.authService.getTokenData(command.token);

    await this.authRepository.deleteAllExceptCurrent({ userId, deviceId });
  }
}
