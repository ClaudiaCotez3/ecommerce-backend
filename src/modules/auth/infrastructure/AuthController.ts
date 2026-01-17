import {  Post, Body, HttpStatus, Res, Get } from '@nestjs/common';
import type { Response } from 'express';
import { RegisterUser } from '../application/RegisterUser';
import type { RegisterUserRequest } from '../application/RegisterUser';
import { LoginUser } from '../application/LoginUser';
import type { LoginUserRequest } from '../application/LoginUser';

export class AuthController {
  constructor(
    private readonly registerUser: RegisterUser,
    private readonly loginUser: LoginUser
  ) {}

  @Post('register')
  async register(
    @Body() registerUserRequest: RegisterUserRequest,
    @Res() res: Response
  ) {
    try {
      // Validar que todos los campos requeridos estén presentes
      if (!registerUserRequest.email || !registerUserRequest.password || 
          !registerUserRequest.firstName || !registerUserRequest.lastName) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'All fields are required: email, password, firstName, lastName'
        });
      }

      const result = await this.registerUser.execute(registerUserRequest);

      const statusCode = result.success ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
      
      return res.status(statusCode).json(result);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  @Post('login')
  async login(
    @Body() loginUserRequest: LoginUserRequest,
    @Res() res: Response
  ) {
    try {
      // Validar que todos los campos requeridos estén presentes
      if (!loginUserRequest.email || !loginUserRequest.password) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const result = await this.loginUser.execute(loginUserRequest);

      const statusCode = result.success ? HttpStatus.OK : HttpStatus.UNAUTHORIZED;
      
      return res.status(statusCode).json(result);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'OK',
      message: 'Auth service is running',
      timestamp: new Date().toISOString()
    };
  }
}
