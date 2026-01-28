import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({isGlobal:true}),MongooseModule.forRoot(process.env.Mongo_URI as string),EnrollmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
