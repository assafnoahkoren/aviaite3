import { IsString } from 'class-validator';

export class CreateChatDto {
  @IsString()
  assistantId: string;

  @IsString()
  profileId: string;
} 