import { Module } from '@nestjs/common';
import { TokenUsageController } from './token-usage.controller';
import { TokenUsageService } from './token-usage.service';

@Module({
  controllers: [TokenUsageController],
  providers: [TokenUsageService],
  exports: [TokenUsageService], // Export service for use in other modules
})
export class TokenUsageModule {}