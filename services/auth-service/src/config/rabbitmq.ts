// src/config/rabbitmq.ts
import amqp from 'amqplib';

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://appuser:apppassword@localhost:5672');
  channel = await connection.createChannel();
  console.log('Auth Service connected to RabbitMQ');
};


export const publishEvent = async (queue: string, data: any) => {
  if (!channel) {
    await connectRabbitMQ();
  }
  await channel.assertQueue(queue, { durable: true });
  
  const message = {
    pattern: data.type, // 
    data: data,
  };
  
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
};