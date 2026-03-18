// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { Transport } from '@nestjs/microservices';
// import { ConfigService } from '@nestjs/config';

// async function bootstrap() {
//   const appContext = await NestFactory.createApplicationContext(AppModule);
//     const config = appContext.get(ConfigService);

//   const app = await NestFactory.createMicroservice(AppModule, {
//     transport: Transport.RMQ,
//     options: {      
//       urls: [config.getOrThrow<string>('RABBITMQ_URL')],
//       queue: config.getOrThrow<string>('RABBITMQ_QUEUE'),
//       queueOptions: {
//         durable: true,
//       },
//     },
//   });

  
//   await app.listen(); 
//   console.log('Notification microservice is listening to RabbitMQ');
// }
// bootstrap();


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [config.getOrThrow<string>('RABBITMQ_URL')],
      queue: config.getOrThrow<string>('RABBITMQ_QUEUE'),
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();

  // REQUIRED for Render free Web Service
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`HTTP server listening on port ${port}`);
  console.log('Notification microservice is listening to RabbitMQ');
}

bootstrap();
