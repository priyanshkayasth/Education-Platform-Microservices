import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    // app.setGlobalPrefix("api"); // 
  const configService = app.get(ConfigService);

  console.log('MongoDB URL:', configService.get('MONGODB_URL')); // 


  app.useGlobalPipes(new ValidationPipe({whitelist:true}))
    const port = configService.getOrThrow<number>('PORT');
    await app.listen(port);
}
bootstrap();
