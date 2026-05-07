/**
 * auth.module.ts — The Authentication feature module.
 *
 * KEY CONCEPTS:
 * - JwtModule.register(): Configures JWT token signing and verification.
 *   - secret: The key used to sign tokens (must match JwtStrategy's secretOrKey)
 *   - signOptions.expiresIn: Token expiration time ('24h' = 24 hours)
 *
 * - PassportModule: Registers Passport with NestJS.
 *   defaultStrategy: 'jwt' means all @AuthGuard() calls default to JWT.
 *
 * - TypeOrmModule.forFeature([User]): Registers User entity so we can
 *   inject Repository<User> in AuthService and JwtStrategy.
 *
 * - exports: [JwtStrategy, PassportModule]:
 *   We export these so OTHER modules (like TodoModule) can use
 *   the JwtAuthGuard to protect their routes.
 *
 * MODULE DEPENDENCY GRAPH:
 *   AuthModule
 *     ├── imports: PassportModule, JwtModule, TypeOrmModule.forFeature([User])
 *     ├── controllers: [AuthController]
 *     ├── providers: [AuthService, JwtStrategy]
 *     └── exports: [JwtStrategy, PassportModule] ← used by TodoModule
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './jwt.strategy.js';
import { User } from '../user/entities/user.entity.js';

@Module({
  imports: [
    // Register Passport with 'jwt' as the default strategy
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Configure JWT token settings
    JwtModule.register({
      secret: 'super-secret-jwt-key-change-in-production', // ⚠️ Use env vars in production!
      signOptions: {
        expiresIn: '24h', // Tokens expire after 24 hours
      },
    }),

    // Register User entity for database operations
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],

  // Export so other modules can use JwtAuthGuard
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
