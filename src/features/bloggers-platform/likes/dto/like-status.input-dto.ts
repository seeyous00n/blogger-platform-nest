import { IsEnum } from 'class-validator';
import { MyStatus } from '../domain/like.sql-entity';

export class LikeStatusInputDto {
  @IsEnum(MyStatus)
  likeStatus: MyStatus;
}
