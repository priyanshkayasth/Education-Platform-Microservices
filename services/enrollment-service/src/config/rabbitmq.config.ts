export const rabbitConfig = {
  urls: [process.env.RABBITMQ_URL || 'amqp://appuser:apppassword@localhost:5672'],
  queue: 'enrollment_queue',
  queueOptions: {
    durable: true,
  },
};