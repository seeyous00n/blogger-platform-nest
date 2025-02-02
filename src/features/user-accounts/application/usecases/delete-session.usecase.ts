import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityService } from '../security.service';
import { DeleteSessionDto } from '../../dto/delete-session.dto';
import { AuthSqlRepository } from '../../infrastructure/auth-sql.repository';

export class DeleteSessionCommand {
  constructor(public dto: DeleteSessionDto) {}
}

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionUseCase
  implements ICommandHandler<DeleteSessionCommand, void>
{
  constructor(
    private securityService: SecurityService,
    private authSqlRepository: AuthSqlRepository,
  ) {}

  async execute(command: DeleteSessionCommand): Promise<void> {
    const session = await this.securityService.checkOwnerDeviceOrError({
      userId: command.dto.userId,
      deviceId: command.dto.deviceId,
    });

    await this.authSqlRepository.delete(session.id);
  }
}
