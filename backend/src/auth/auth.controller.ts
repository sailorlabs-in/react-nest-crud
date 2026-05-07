/**
 * auth.controller.ts — Authentication endpoints (Register & Login).
 *
 * KEY CONCEPTS:
 * - These are PUBLIC routes — no JwtAuthGuard needed here because
 *   users need to register/login BEFORE they have a token.
 *
 * - @HttpCode(200): Login uses POST but returns 200 (not 201) because
 *   we're not creating a new resource — we're authenticating.
 *
 * REST API ENDPOINTS:
 * ┌────────┬─────────────────────┬───────────────────────────────────┐
 * │ Method │ Route               │ Description                       │
 * ├────────┼─────────────────────┼───────────────────────────────────┤
 * │ POST   │ /api/auth/register  │ Register a new user               │
 * │ POST   │ /api/auth/login     │ Login and receive JWT token        │
 * │ GET    │ /api/auth/profile   │ Get current user profile (auth'd)  │
 * └────────┴─────────────────────┴───────────────────────────────────┘
 */

import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { GetUser } from './decorators/get-user.decorator.js';
import { User } from '../user/entities/user.entity.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/register
   * Register a new user account.
   *
   * Public route — no authentication required.
   * Returns a JWT token so the user is automatically logged in after registration.
   */
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * POST /api/auth/login
   * Login with email and password.
   *
   * Public route — no authentication required.
   * @HttpCode(200): Override default 201 for POST since login doesn't create a resource.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * GET /api/auth/profile
   * Get the currently authenticated user's profile.
   *
   * Protected route — requires a valid JWT token.
   * @UseGuards(JwtAuthGuard) ensures only authenticated users can access this.
   * @GetUser() extracts the user from the request (set by JwtStrategy.validate()).
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@GetUser() user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
