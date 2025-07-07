import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { TutorialService } from './tutorial.service';
import { UpdateTutorialProgressDto } from './dto/tutorial-status.dto';
import { AuthGuard } from './auth.guard';

@Controller('api/users/tutorial-status')
@UseGuards(AuthGuard)
export class TutorialController {
  constructor(private readonly tutorialService: TutorialService) {}

  @Get(':tutorialId')
  async getTutorialStatus(@Request() req: any, @Param('tutorialId') tutorialId: string) {
    return this.tutorialService.getTutorialStatus(req.user.id, tutorialId);
  }

  @Post(':tutorialId/complete')
  async completeTutorial(@Request() req: any, @Param('tutorialId') tutorialId: string) {
    return this.tutorialService.completeTutorial(req.user.id, tutorialId);
  }

  @Post(':tutorialId/skip')
  async skipTutorial(@Request() req: any, @Param('tutorialId') tutorialId: string) {
    return this.tutorialService.skipTutorial(req.user.id, tutorialId);
  }

  @Patch(':tutorialId/progress')
  async updateProgress(
    @Request() req: any,
    @Param('tutorialId') tutorialId: string,
    @Body() dto: UpdateTutorialProgressDto,
  ) {
    return this.tutorialService.updateProgress(req.user.id, tutorialId, dto);
  }
}