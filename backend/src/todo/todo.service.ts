/**
 * todo.service.ts — The SERVICE layer (business logic) — now USER-SCOPED.
 *
 * KEY CHANGES FROM BEFORE:
 * - Every method now receives the `userId` parameter.
 * - Todos are filtered by the authenticated user — users can ONLY
 *   see, update, and delete THEIR OWN todos.
 *
 * SECURITY:
 * - findAll() only returns todos WHERE user_id = authenticated user's ID
 * - findOne() checks that the todo belongs to the requesting user
 * - update() and remove() also verify ownership before acting
 *
 * This prevents "Insecure Direct Object Reference (IDOR)" attacks,
 * where a user could guess another user's todo ID and access it.
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
  ) {}

  /**
   * CREATE a new todo for the authenticated user.
   *
   * We attach the userId to the todo so it's associated with the user.
   */
  async create(createTodoDto: CreateTodoDto, userId: number): Promise<Todo> {
    const todo = this.todoRepository.create({
      ...createTodoDto,
      userId, // Associate this todo with the authenticated user
    });
    return this.todoRepository.save(todo);
  }

  /**
   * READ all todos for the authenticated user.
   *
   * The WHERE clause ensures users only see their own todos.
   * SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC
   */
  async findAll(userId: number): Promise<Todo[]> {
    return this.todoRepository.find({
      where: { userId }, // Only return todos belonging to this user
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * READ a single todo — verifies it belongs to the requesting user.
   *
   * Two-step security check:
   * 1. Does the todo exist? → 404 if not
   * 2. Does it belong to this user? → 403 Forbidden if not
   */
  async findOne(id: number, userId: number): Promise<Todo> {
    const todo = await this.todoRepository.findOneBy({ id });

    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    // Security: ensure the todo belongs to the requesting user
    if (todo.userId !== userId) {
      throw new ForbiddenException('You can only access your own todos');
    }

    return todo;
  }

  /**
   * UPDATE a todo — only if it belongs to the authenticated user.
   */
  async update(
    id: number,
    updateTodoDto: UpdateTodoDto,
    userId: number,
  ): Promise<Todo> {
    const todo = await this.findOne(id, userId); // Checks existence + ownership
    Object.assign(todo, updateTodoDto);
    return this.todoRepository.save(todo);
  }

  /**
   * DELETE a todo — only if it belongs to the authenticated user.
   */
  async remove(id: number, userId: number): Promise<void> {
    const todo = await this.findOne(id, userId); // Checks existence + ownership
    await this.todoRepository.remove(todo);
  }
}
