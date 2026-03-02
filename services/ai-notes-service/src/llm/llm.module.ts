import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { HuggingFaceProvider } from './providers/huggingface.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [LlmService, HuggingFaceProvider],
  exports: [LlmService],
})
export class LlmModule {}