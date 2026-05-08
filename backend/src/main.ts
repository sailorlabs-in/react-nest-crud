/**
 * main.ts — The entry point of every NestJS application.
 *
 * KEY CONCEPTS:
 * - NestFactory: Factory class that creates a NestJS application instance.
 * - ValidationPipe: A built-in pipe that validates incoming request bodies
 *   against your DTO (Data Transfer Object) classes using class-validator decorators.
 * - CORS: Cross-Origin Resource Sharing — allows the React frontend (port 5001)
 *   to communicate with the NestJS backend (port 3000).
 * - Global Prefix: Adds "/api" before every route, e.g., GET /api/todos
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  // 1. Create the NestJS application from the root module
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 2. Set a global prefix — all routes will be under /api/*
  //    e.g., /api/todos, /api/todos/1
  app.setGlobalPrefix('api');

  // 3. Enable CORS so the React frontend can talk to this backend
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL', 'http://localhost:5001'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 4. Use a global ValidationPipe to auto-validate incoming request data
  //    - whitelist: strips out properties NOT defined in the DTO
  //    - forbidNonWhitelisted: throws an error if unknown properties are sent
  //    - transform: auto-transforms payloads to DTO class instances
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 5. Setup Swagger (API documentation) — accessible at /api/docs
  const config = new DocumentBuilder()
    .setTitle('Todo API')
    .setDescription('A simple CRUD Todo API built with NestJS + TypeORM')
    .setVersion('1.0')
    .addTag('todos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 6. Start listening on the configured port
  const port = Number(configService.get<string>('PORT', '5000'));
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📖 Swagger docs at http://localhost:${port}/api/docs`);
}

void bootstrap();
