/**
 * auth.service.ts — Authentication business logic.
 *
 * KEY CONCEPTS:
 * - bcrypt: A library for hashing passwords. NEVER store plain-text passwords!
 *   bcrypt.hash(password, 10) → creates a one-way hash with 10 salt rounds.
 *   bcrypt.compare(plain, hashed) → checks if a plain password matches a hash.
 *
 * - JwtService: Provided by @nestjs/jwt. Signs (creates) and verifies JWT tokens.
 *   jwtService.sign(payload) → creates a signed JWT token string.
 *
 * - ConflictException: Returns 409 Conflict (e.g., email already registered).
 * - UnauthorizedException: Returns 401 Unauthorized (e.g., wrong password).
 *
 * REGISTRATION FLOW:
 *   1. Check if email is already taken → 409 if yes
 *   2. Hash the password with bcrypt
 *   3. Save the user to the database
 *   4. Return a JWT token
 *
 * LOGIN FLOW:
 *   1. Find user by email (with password selected explicitly)
 *   2. Compare provided password with stored hash
 *   3. If match → return a JWT token
 *   4. If no match → 401 Unauthorized
 */

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import type { JwtPayload } from './jwt.strategy.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    // JwtService is provided by JwtModule (registered in AuthModule)
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user.
   *
   * @returns The JWT access token and user info
   */
  async register(
    registerDto: RegisterDto,
  ): Promise<{ accessToken: string; user: Partial<User> }> {
    const { name, email, password } = registerDto;

    // 1. Check if email is already taken
    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    // 2. Hash the password (10 = salt rounds — higher is more secure but slower)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create and save the user
    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });
    await this.userRepository.save(user);

    // 4. Generate a JWT token
    const accessToken = this.generateToken(user);

    // 5. Return token + user info (without password)
    return {
      accessToken,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  /**
   * Login an existing user.
   *
   * @returns The JWT access token and user info
   */
  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; user: Partial<User> }> {
    const { email, password } = loginDto;

    // 1. Find user by email — we MUST explicitly select password
    //    because we set `select: false` on the password column
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password') // explicitly include password for comparison
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2. Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Use the same generic message for both cases (security best practice)
      // This prevents attackers from knowing if an email exists
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Generate a JWT token
    const accessToken = this.generateToken(user);

    return {
      accessToken,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  /**
   * Generate a JWT token for a user.
   *
   * The payload contains the user ID (sub) and email.
   * 'sub' is a standard JWT claim meaning "subject".
   */
  private generateToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.sign(payload);
  }
}
