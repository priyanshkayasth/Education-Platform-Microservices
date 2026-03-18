import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServicesConfig } from './services.config';
import { EnvConfig } from './env.config';

@Module({
  imports: [ConfigModule],
  providers: [ServicesConfig,EnvConfig],
  exports: [ServicesConfig,EnvConfig], // 
})
export class AppConfigModule {}
