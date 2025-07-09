import { Controller, Get, Post, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { UpdateOnboardingDto } from './dto/onboarding.dto';
import { AuthedRequest, AuthGuard } from './auth.guard';

@Controller('api/users/onboarding')
@UseGuards(AuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get()
  async getOnboardingStatus(@Request() req: AuthedRequest) {
    return this.onboardingService.getOnboardingStatus(req.user.id);
  }

  @Patch('progress')
  async updateProgress(
    @Request() req: AuthedRequest,
    @Body() dto: UpdateOnboardingDto,
  ) {
    return this.onboardingService.updateOnboardingProgress(req.user.id, dto);
  }

  @Post('complete')
  async completeOnboarding(@Request() req: AuthedRequest) {
    return this.onboardingService.completeOnboarding(req.user.id);
  }

  @Post('reset')
  async resetOnboarding(@Request() req: AuthedRequest) {
    return this.onboardingService.resetOnboarding(req.user.id);
  }
}