import { IsString, IsEnum } from 'class-validator';
import { MessageRole } from '../../../../generated/prisma';

export class AddMessageDto {
  @IsString()
  threadId: string;

  @IsEnum(MessageRole)
  role: MessageRole;

  @IsString()
  content: string;
}