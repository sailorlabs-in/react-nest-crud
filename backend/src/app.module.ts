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
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TodoModule } from './todo/todo.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [
    // Configure TypeORM with PostgreSQL connection
    // forRoot() = configure ONCE at the root level
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'umang',
      password: 'secret123',
      database: 'crud_demo',

      // Auto-load all entity files (no need to list them manually)
      autoLoadEntities: true,

      // synchronize: true → TypeORM will auto-create/update database tables
      // based on your entity definitions.
      // ⚠️ WARNING: ONLY use this in development!
      // In production, use migrations instead.
      synchronize: true,

      // Log SQL queries to console (helpful for learning)
      logging: true,
    }),

    // Import our feature modules
    AuthModule,
    TodoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
