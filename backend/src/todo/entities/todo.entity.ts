/**
 * todo.entity.ts — The database entity (table definition).
 *
 * KEY CONCEPTS:
 * - @ManyToOne(): Defines the "many" side of a relationship.
 *   Many todos belong to ONE user. TypeORM will create a `user_id`
 *   foreign key column in the "todos" table.
 *
 * - @JoinColumn(): Specifies the foreign key column name in the DB.
 *   Without it, TypeORM auto-generates "userId" — we use "user_id" for
 *   consistent snake_case naming.
 *
 * - { onDelete: 'CASCADE' }: If a user is deleted, all their todos
 *   are automatically deleted too.
 *
 * UPDATED TABLE STRUCTURE:
 * ┌────┬─────────┬───────────┬─────────────┬────────────┬────────────┬────────────┐
 * │ id │ user_id │   title   │ description │ is_complete│ created_at │ updated_at │
 * ├────┼─────────┼───────────┼─────────────┼────────────┼────────────┼────────────┤
 * │  1 │    1    │ Buy milk  │ From store  │   false    │ 2026-05-07 │ 2026-05-07 │
 * │  2 │    1    │ Code app  │ NestJS CRUD │   true     │ 2026-05-07 │ 2026-05-07 │
 * │  3 │    2    │ Read book │ TypeORM     │   false    │ 2026-05-07 │ 2026-05-07 │
 * └────┴─────────┴───────────┴─────────────┴────────────┴────────────┴────────────┘
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity.js';

@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_complete', type: 'boolean', default: false })
  isComplete: boolean;

  /**
   * Many Todos → One User
   *
   * This creates a foreign key column "user_id" in the todos table.
   * { eager: false } means the user data is NOT automatically loaded
   * when you query todos — you must explicitly join if needed.
   *
   * onDelete: 'CASCADE' → if the user is deleted, their todos are too.
   */
  @ManyToOne(() => User, (user) => user.todos, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /** Store the user ID directly for easy querying */
  @Column({ name: 'user_id' })
  userId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
