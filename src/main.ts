import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { CryptoService } from './crypto/crypto.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const cryptoService = app.get(CryptoService);
    const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API documentation for my NestJS app')
    .setVersion('1.0')
    .addTag('example')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
  console.log('Listening on http://localhost:3000');
}
bootstrap();
