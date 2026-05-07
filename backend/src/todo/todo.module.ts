/**
 * todo.module.ts — Updated to import AuthModule for JWT guard access.
 *
 * KEY CHANGE:
 * - imports: [AuthModule] — This is needed so the TodoController can use
 *   JwtAuthGuard and the JwtStrategy (exported by AuthModule).
 *
 * Without importing AuthModule here, NestJS wouldn't know how to resolve
 * the JwtAuthGuard and would throw an error.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoController } from './todo.controller.js';
import { TodoService } from './todo.service.js';
import { Todo } from './entities/todo.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Todo]),
    AuthModule, // Import to use JwtAuthGuard in TodoController
  ],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
