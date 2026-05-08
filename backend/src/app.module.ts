/**
 * app.module.ts — The ROOT module of the NestJS application.
 *
 * KEY CONCEPTS:
 * - @Module() decorator: Defines a module — the basic building block of NestJS.
 *   Every NestJS app has at least one module (the root module).
 *
 * - imports: Other modules this module depends on.
 *   - TypeOrmModule.forRoot(): Configures the database connection at the app level.
 *     This is called ONCE in the root module. Feature modules use forFeature().
 *   - TodoModule: Our feature module for todo-related functionality.
 *
 * - controllers: Route handlers that belong to THIS module.
 * - providers: Services (business logic) that belong to THIS module.
 *
 * ARCHITECTURE:
 * AppModule (root)
 *   ├── TypeOrmModule (database connection)
 *   └── TodoModule (feature module)
 *         ├── TodoController (handles HTTP requests)
 *         ├── TodoService (business logic)
 *         └── Todo Entity (database table mapping)
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TodoModule } from './todo/todo.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [
    // Loads variables from backend/.env and makes ConfigService available app-wide.
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Configure TypeORM with PostgreSQL connection
    // forRoot() = configure ONCE at the root level
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get<string>('DB_PORT', '5432')),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),

        // Auto-load all entity files (no need to list them manually)
        autoLoadEntities: true,

        // synchronize: true → TypeORM will auto-create/update database tables
        // based on your entity definitions.
        // ⚠️ WARNING: ONLY use this in development!
        // In production, use migrations instead.
        synchronize: configService.get<string>('DB_SYNC', 'false') === 'true',

        // Log SQL queries to console (helpful for learning)
        logging: configService.get<string>('DB_LOGGING', 'false') === 'true',
      }),
    }),

    // Import our feature modules
    AuthModule,
    TodoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
