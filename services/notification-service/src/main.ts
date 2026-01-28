import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      // urls: ['amqp://admin:admin@rabbitmq:5672'],
      urls: ['amqp://admin:admin@localhost:5672'],

      queue: 'notification_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.listen(); 
  console.log('Notification microservice is listening to RabbitMQ');
}
bootstrap();
