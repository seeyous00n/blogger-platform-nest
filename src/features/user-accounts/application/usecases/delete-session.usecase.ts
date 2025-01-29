import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityService } from '../security.service';
import { DeleteSessionDto } from '../../dto/delete-session.dto';
import { AuthRepository } from '../../infrastructure/auth.repository';

export class DeleteSessionCommand {
  constructor(public dto: DeleteSessionDto) {}
}

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionUseCase
  implements ICommandHandler<DeleteSessionCommand, void>
{
  constructor(
    private securityService: SecurityService,
    private authRepository: AuthRepository,
  ) {}

  async execute(command: DeleteSessionCommand): Promise<void> {
    const session = await this.securityService.checkOwnerDeviceOrError({
      userId: command.dto.userId,
      deviceId: command.dto.deviceId,
    });

    await this.authRepository.delete(session._id.toString());
  }
}
