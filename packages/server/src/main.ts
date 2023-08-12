import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const PORT = process.env['PORT'] || 3000;
const ENV = process.env['NODE_ENV'] || 'development';

const app = await NestFactory.create(AppModule);

if (ENV == 'production') {
  // app.use(express.static(new URL('../../frontend/dist', import.meta.url).pathname));
} else {
  app.enableCors();
}

await app.listen(PORT);

console.log(`Server up with port: ${PORT}, env: ${ENV}`);
