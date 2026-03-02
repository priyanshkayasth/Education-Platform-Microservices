export const rabbitConfig = {
//   urls: ['amqp://appuser:apppassword@rabbitmq:5672'],
  urls: ['amqp://appuser:apppassword@localhost:5672'],
  queue: 'course_queue',
  queueOptions: {
    durable: true,
  },
};