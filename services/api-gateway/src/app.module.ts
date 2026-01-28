import { Module } from '@nestjs/common';
import { ProxyModule } from './proxy/proxy.module';
import { AuthModule } from './auth/auth.module';
import { RoutesModule } from './routes/routes.module';

@Module({
  imports: [AuthModule,RoutesModule,ProxyModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
