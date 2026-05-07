/**
 * update-todo.dto.ts — Data Transfer Object for updating an existing Todo.
 *
 * KEY CONCEPTS:
 * - PartialType(): A NestJS utility that takes a DTO class and makes ALL
 *   its properties OPTIONAL. This is perfect for PATCH/PUT endpoints where
 *   the client might only send the fields they want to update.
 *
 *   PartialType(CreateTodoDto) is equivalent to writing:
 *   {
 *     title?: string;       // was required, now optional
 *     description?: string;  // was optional, stays optional
 *   }
 *
 * - We also add isComplete here because you can't create a todo as
 *   complete (it starts as false), but you CAN update it to complete.
 *
 * EXAMPLE REQUEST:
 * PATCH /api/todos/1
 * { "isComplete": true }           // only update completion status
 *
 * PATCH /api/todos/1
 * { "title": "New title" }         // only update title
 *
 * PATCH /api/todos/1
 * { "title": "New", "isComplete": true } // update multiple fields
 */

import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTodoDto } from './create-todo.dto.js';

export class UpdateTodoDto extends PartialType(CreateTodoDto) {
  @ApiPropertyOptional({
    description: 'Whether the todo is completed',
    example: true,
  })
  @IsBoolean({ message: 'isComplete must be a boolean value' })
  @IsOptional()
  isComplete?: boolean;
}
