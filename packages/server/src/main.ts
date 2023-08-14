import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const PORT = process.env['PORT'] || 3000;
const ENV = process.env['NODE_ENV'] || 'development';

const app = await NestFactory.create(AppModule);

if (ENV == 'development') {
  app.enableCors();
}

await app.listen(PORT);

console.log(`Server up with port: ${PORT}, env: ${ENV}`);
