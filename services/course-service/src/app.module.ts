import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoursesModule } from './courses/courses.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [PassportModule,ConfigModule.forRoot({isGlobal:true}),MongooseModule.forRoot(process.env.MONGODB_URL as string),CoursesModule],
  controllers: [AppController],
  providers: [AppService,JwtStrategy],
})
export class AppModule {}
