/**
 * todo.controller.ts — PROTECTED Todo endpoints (requires authentication).
 *
 * KEY CHANGES FROM BEFORE:
 * - @UseGuards(JwtAuthGuard) on the ENTIRE controller — ALL routes are protected.
 *   Any request without a valid JWT token gets a 401 Unauthorized response.
 *
 * - @GetUser() decorator extracts the authenticated user from the request.
 *   We pass user.id to the service so it can filter by user ownership.
 *
 * - @ApiBearerAuth(): Tells Swagger that these endpoints need a Bearer token.
 *
 * AUTHENTICATION FLOW:
 *   1. Client sends: GET /api/todos, Authorization: Bearer <token>
 *   2. JwtAuthGuard → JwtStrategy validates the token
 *   3. If valid → user is attached to request
 *   4. @GetUser() extracts the user
 *   5. Controller passes user.id to the service
 *   6. Service filters data by user ownership
 *
 * REST API ENDPOINTS (all require JWT token):
 * ┌────────┬────────────────┬──────────────────────────────────────────┐
 * │ Method │ Route          │ Description                              │
 * ├────────┼────────────────┼──────────────────────────────────────────┤
 * │ POST   │ /api/todos     │ Create a new todo (for current user)     │
 * │ GET    │ /api/todos     │ Get all todos (for current user only)    │
 * │ GET    │ /api/todos/:id │ Get a single todo (if owned by user)     │
 * │ PATCH  │ /api/todos/:id │ Update a todo (if owned by user)         │
 * │ DELETE │ /api/todos/:id │ Delete a todo (if owned by user)         │
 * └────────┴────────────────┴──────────────────────────────────────────┘
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TodoService } from './todo.service.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { Todo } from './entities/todo.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import { User } from '../user/entities/user.entity.js';

@ApiTags('todos')
@ApiBearerAuth() // Swagger: show lock icon, all routes need Bearer token
@UseGuards(JwtAuthGuard) // Protect ALL routes in this controller
@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  /**
   * POST /api/todos
   * Create a new todo for the authenticated user.
   */
  @Post()
  @ApiOperation({ summary: 'Create a new todo' })
  @ApiResponse({ status: 201, description: 'Todo created successfully', type: Todo })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() createTodoDto: CreateTodoDto,
    @GetUser() user: User, // ← extracted from the JWT token
  ): Promise<Todo> {
    return this.todoService.create(createTodoDto, user.id);
  }

  /**
   * GET /api/todos
   * Get all todos belonging to the authenticated user.
   */
  @Get()
  @ApiOperation({ summary: 'Get all todos for the current user' })
  @ApiResponse({ status: 200, description: 'List of user todos', type: [Todo] })
  findAll(@GetUser() user: User): Promise<Todo[]> {
    return this.todoService.findAll(user.id);
  }

  /**
   * GET /api/todos/:id
   * Get a specific todo (only if it belongs to the authenticated user).
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a todo by ID' })
  @ApiParam({ name: 'id', description: 'Todo ID' })
  @ApiResponse({ status: 200, description: 'The todo item', type: Todo })
  @ApiResponse({ status: 403, description: 'Forbidden — not your todo' })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<Todo> {
    return this.todoService.findOne(id, user.id);
  }

  /**
   * PATCH /api/todos/:id
   * Update a todo (only if it belongs to the authenticated user).
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a todo' })
  @ApiParam({ name: 'id', description: 'Todo ID' })
  @ApiResponse({ status: 200, description: 'Todo updated', type: Todo })
  @ApiResponse({ status: 403, description: 'Forbidden — not your todo' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
    @GetUser() user: User,
  ): Promise<Todo> {
    return this.todoService.update(id, updateTodoDto, user.id);
  }

  /**
   * DELETE /api/todos/:id
   * Delete a todo (only if it belongs to the authenticated user).
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a todo' })
  @ApiParam({ name: 'id', description: 'Todo ID' })
  @ApiResponse({ status: 204, description: 'Todo deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden — not your todo' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<void> {
    return this.todoService.remove(id, user.id);
  }
}
