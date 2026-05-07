/**
 * login.dto.ts — DTO for user login.
 *
 * EXAMPLE REQUEST:
 * POST /api/auth/login
 * {
 *   "email": "john@example.com",
 *   "password": "secret123"
 * }
 */

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'secret123' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
