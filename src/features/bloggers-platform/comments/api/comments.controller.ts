import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import { UpdatePostInput } from './input-dto/update-comment.input-dto';
import { CommentsService } from '../application/comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get(':id')
  async getOne(@Param('id') id: string) {}

  //TODO mm how to get UserId???
  @Put()
  async update(@Param('id') id: string, @Body() comment: UpdatePostInput) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.commentsService.deleteComment(id);
  }
}
