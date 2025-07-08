import { IsInt, IsOptional, IsObject, Min, IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PreferencesStepDto {
  @IsOptional()
  @IsString()
  aiModel?: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsBoolean()
  notifications?: boolean;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

export class WelcomeStepDto {
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

export class OnboardingStepDataDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => PreferencesStepDto)
  preferences?: PreferencesStepDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => WelcomeStepDto)
  welcome?: WelcomeStepDto;
}

export class OnboardingStatusDto {
  @IsInt()
  @Min(0)
  currentStep: number;

  @IsInt()
  @Min(1)
  totalSteps: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardingStepDataDto)
  stepData?: OnboardingStepDataDto;
}

export class UpdateOnboardingDto {
  @IsInt()
  @Min(0)
  currentStep: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardingStepDataDto)
  stepData?: OnboardingStepDataDto;
}

export class OnboardingResponseDto {
  id: string;
  email: string;
  onboardingStatus: OnboardingStatusDto | null;
  onboardingCompletedAt: Date | null;
}