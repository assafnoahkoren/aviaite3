import { IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  threadId: string;

  @IsString()
  content: string;
} 