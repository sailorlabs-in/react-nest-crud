/**
 * create-todo.dto.ts — Data Transfer Object for creating a new Todo.
 *
 * KEY CONCEPTS:
 * - DTO (Data Transfer Object): A class that defines the SHAPE of data
 *   coming into your API. It separates the "what the client sends" from
 *   the "what the database stores" (the entity).
 *
 * - class-validator decorators: These decorators (@IsString, @IsNotEmpty, etc.)
 *   define validation rules. When combined with the global ValidationPipe
 *   (set up in main.ts), NestJS will automatically validate incoming requests
 *   and return 400 Bad Request if validation fails.
 *
 * - @ApiProperty(): Swagger decorator — generates API documentation
 *   so other developers can see what fields are expected.
 *
 * WHY USE DTOs?
 * 1. Input validation — reject bad data before it reaches the database
 * 2. Type safety — TypeScript knows exactly what shape the data is
 * 3. Documentation — Swagger auto-generates API docs from DTOs
 * 4. Security — whitelist prevents unknown fields from being injected
 *
 * EXAMPLE REQUEST:
 * POST /api/todos
 * {
 *   "title": "Buy groceries",         // required, must be a string
 *   "description": "Milk, eggs, bread" // optional
 * }
 */

import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTodoDto {
  @ApiProperty({
    description: 'The title of the todo item',
    example: 'Buy groceries',
    maxLength: 255,
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title cannot be empty' })
  @MaxLength(255, { message: 'Title cannot be longer than 255 characters' })
  title: string;

  @ApiPropertyOptional({
    description: 'An optional description for the todo item',
    example: 'Milk, eggs, and bread from the store',
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;
}
