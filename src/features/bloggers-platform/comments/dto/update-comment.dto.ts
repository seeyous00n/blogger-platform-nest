export class UpdateCommentDto {
  content: string;
}

export class UpdateCommentCommandDto {
  commentId: string;
  userId: string;
  content: string;
}
