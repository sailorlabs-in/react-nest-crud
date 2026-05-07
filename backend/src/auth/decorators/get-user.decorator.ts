/**
 * get-user.decorator.ts — Custom Parameter Decorator.
 *
 * KEY CONCEPTS:
 * - Custom Decorators: NestJS lets you create your own decorators
 *   to extract specific data from the request object.
 *
 * - After the JwtAuthGuard validates the token, the user object
 *   is attached to `request.user`. This decorator provides a clean
 *   way to access it in your controller methods.
 *
 * USAGE:
 *   // Instead of this:
 *   @Get()
 *   findAll(@Req() req: Request) {
 *     const user = req.user; // not type-safe
 *   }
 *
 *   // Use this (cleaner, type-safe):
 *   @Get()
 *   findAll(@GetUser() user: User) {
 *     console.log(user.id, user.email);
 *   }
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { User } from '../../user/entities/user.entity.js';

export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    // Extract the HTTP request from the execution context
    const request = ctx.switchToHttp().getRequest();

    // Return the user object (attached by JwtAuthGuard + JwtStrategy)
    return request.user;
  },
);
