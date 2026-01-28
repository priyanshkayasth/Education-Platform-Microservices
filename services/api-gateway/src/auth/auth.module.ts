import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { envconfig } from 'src/config/env.config';
import { JwtAuthGuard } from './jwt.guard';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: envconfig.jwt.secret,
      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],
  providers: [JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard,JwtModule],
})
export class AuthModule {}
