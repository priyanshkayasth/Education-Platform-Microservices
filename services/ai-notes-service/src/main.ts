import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://appuser:apppassword@localhost:5672'], 
      queue: 'course_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.listen();
  console.log('AI Notes Microservice is listening to RabbitMQ...');
}
bootstrap();