import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'aryan_dev' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username: letters, numbers, underscores only' })
  username: string;

  @ApiProperty({ example: 'Aryan Sharma' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ example: 'aryan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongP@ss123' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128)
  password: string;

  @ApiProperty({ required: false, example: 'IIT Delhi' })
  @IsOptional()
  @IsString()
  college?: string;

  @ApiProperty({ required: false, example: 3 })
  @IsOptional()
  year?: number;
}

export class LoginDto {
  @ApiProperty({ example: 'aryan@example.com' })
  @IsString()
  emailOrUsername: string;

  @ApiProperty({ example: 'StrongP@ss123' })
  @IsString()
  password: string;
}

export class PasswordResetRequestDto {
  @ApiProperty({ example: 'aryan@example.com' })
  @IsEmail()
  email: string;
}

export class PasswordResetDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128)
  newPassword: string;
}
