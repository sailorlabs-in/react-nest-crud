/**
 * jwt.strategy.ts — Passport JWT Strategy.
 *
 * KEY CONCEPTS:
 * - Passport: A popular Node.js authentication middleware. NestJS wraps it
 *   with @nestjs/passport for a more NestJS-friendly API.
 *
 * - Strategy: A passport "strategy" defines HOW to authenticate.
 *   The JWT strategy extracts the JWT token from the request header,
 *   verifies it using the secret key, and returns the user data.
 *
 * - How it works:
 *   1. Client sends request with header: Authorization: Bearer <token>
 *   2. ExtractJwt.fromAuthHeaderAsBearerToken() extracts the token
 *   3. Passport verifies the token signature using the secretOrKey
 *   4. If valid, the validate() method is called with the decoded payload
 *   5. Whatever validate() returns is attached to request.user
 *
 * FLOW:
 *   Request Header: "Authorization: Bearer eyJhbGciOi..."
 *     → Extract token
 *     → Verify signature with secret
 *     → Decode payload: { sub: 1, email: "john@example.com" }
 *     → validate() returns: { id: 1, email: "john@example.com" }
 *     → Available as req.user in controllers
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity.js';

/**
 * The JWT payload shape — what's stored inside the token.
 * `sub` is a JWT standard claim meaning "subject" (the user ID).
 */
export interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      // Where to find the token in the request
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Don't accept expired tokens
      ignoreExpiration: false,

      // The secret key used to verify the token signature
      // ⚠️ In production, use environment variables!
      secretOrKey: 'super-secret-jwt-key-change-in-production',
    });
  }

  /**
   * Called AFTER the token is verified.
   * The `payload` is the decoded JWT data (what we put in when signing).
   *
   * Whatever this method returns is attached to `request.user`.
   * If the user doesn't exist in DB, throw UnauthorizedException.
   */
  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: payload.sub });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    // This becomes req.user in your controllers
    return user;
  }
}
