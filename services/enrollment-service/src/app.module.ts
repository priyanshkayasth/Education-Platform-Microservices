import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true ,envFilePath: [
        `.env.${process.env.NODE_ENV}`,
        `.env`
      ],}),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGO_URI');

        if (!uri) {
          throw new Error('MONGO_URI is not defined');
        }

        console.log(' Enrollment DB:', uri);  
        console.log('NODE_ENV:', process.env.NODE_ENV);

        return { uri };
      },
    }),

    EnrollmentModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
