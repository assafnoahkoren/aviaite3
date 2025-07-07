import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateTutorialProgressDto {
  @IsInt()
  @Min(0)
  currentStep: number;
}

export class TutorialStatusResponseDto {
  id: string;
  userId: string;
  tutorialId: string;
  completedAt: Date | null;
  skippedAt: Date | null;
  currentStep: number;
  createdAt: Date;
  updatedAt: Date;
}