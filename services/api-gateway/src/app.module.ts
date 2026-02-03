import { Module } from '@nestjs/common';
import { ProxyModule } from './proxy/proxy.module';
import { AuthModule } from './auth/auth.module';
import { RoutesModule } from './routes/routes.module';
import { ConfigModule } from '@nestjs/config';
import { AppConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule.forRoot({isGlobal:true}),AuthModule,
    AppConfigModule,RoutesModule,ProxyModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
