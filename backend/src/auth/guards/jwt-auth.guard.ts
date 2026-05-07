/**
 * jwt-auth.guard.ts — The Auth Guard that protects routes.
 *
 * KEY CONCEPTS:
 * - Guards: In NestJS, guards determine whether a request should be
 *   handled by the route handler or not. They run BEFORE the route handler.
 *
 * - AuthGuard('jwt'): A pre-built guard from @nestjs/passport that:
 *   1. Extracts the JWT token from the Authorization header
 *   2. Verifies it using the JwtStrategy
 *   3. If valid → allows the request through (attaches user to req.user)
 *   4. If invalid/missing → returns 401 Unauthorized
 *
 * USAGE:
 *   @UseGuards(JwtAuthGuard)    ← on a single route
 *   @UseGuards(JwtAuthGuard)    ← on an entire controller
 *
 * EXAMPLE:
 *   // Without guard → anyone can access
 *   @Get()
 *   findAll() { ... }
 *
 *   // With guard → only authenticated users can access
 *   @UseGuards(JwtAuthGuard)
 *   @Get()
 *   findAll() { ... }
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
