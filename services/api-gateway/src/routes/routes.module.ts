import { Module } from '@nestjs/common';
import { CourseRoutes } from './course.routes';
import { AuthModule } from '../auth/auth.module';
import { ProxyModule } from '../proxy/proxy.module';
import { EnrollmentRoutes } from './enrollment.routes';
import { AuthRoutes } from './auth.routes';
import { NotificationClientModule } from 'src/notification-client.module';
import { HttpModule } from '@nestjs/axios';


@Module({
  imports: [
    HttpModule,
    AuthModule,  
    ProxyModule,
    NotificationClientModule
  ],
  controllers: [AuthRoutes,CourseRoutes,EnrollmentRoutes],
})
export class RoutesModule {}
