export const queueConfig = {
  connection: {
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '10436')
  }
};   