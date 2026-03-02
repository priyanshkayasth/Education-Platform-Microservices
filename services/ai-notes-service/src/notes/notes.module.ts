import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { LlmModule } from 'src/llm/llm.module';
import { NotesConsumer } from './notes.consumer';

@Module({
  imports:[LlmModule],
  controllers: [NotesController,NotesConsumer],
  providers: [NotesService]
})
export class NotesModule {}
