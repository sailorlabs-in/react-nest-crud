/**
 * user.entity.ts — The User database entity.
 *
 * KEY CONCEPTS:
 * - @Entity('users'): Creates a "users" table in PostgreSQL.
 *
 * - @Column({ unique: true }): Ensures no two users can have the same email.
 *   PostgreSQL will enforce this at the database level.
 *
 * - @Column({ select: false }): The password will NOT be included in query
 *   results by default. You must explicitly select it when needed (e.g., login).
 *   This is a security best practice — never expose passwords accidentally.
 *
 * - @OneToMany(): Defines a one-to-many relationship.
 *   One user can have MANY todos. The inverse side is on the Todo entity.
 *
 * TABLE STRUCTURE:
 * ┌────┬───────────────┬──────────────────────┬────────────┬────────────┐
 * │ id │     name      │        email         │  password  │ created_at │
 * ├────┼───────────────┼──────────────────────┼────────────┼────────────┤
 * │  1 │ John Doe      │ john@example.com     │ $2b$10$... │ 2026-05-07 │
 * │  2 │ Jane Smith    │ jane@example.com     │ $2b$10$... │ 2026-05-07 │
 * └────┴───────────────┴──────────────────────┴────────────┴────────────┘
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Todo } from '../../todo/entities/todo.entity.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  /**
   * select: false → This column will NOT be returned in normal queries.
   * You must explicitly request it: .addSelect('user.password')
   * This prevents accidentally leaking password hashes in API responses.
   */
  @Column({ type: 'varchar', select: false })
  password: string;

  /**
   * One User → Many Todos
   * The 'todo.user' refers to the 'user' property on the Todo entity.
   */
  @OneToMany(() => Todo, (todo) => todo.user)
  todos: Todo[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
