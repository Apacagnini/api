import { Controller, Post, Body, Query, UseGuards, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { FindUsersDto } from '../dto/find-users.dto';
import { GetLogsDto } from '../dto/getLogs.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly AuthService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'The user has been successfully created.' })
    @ApiResponse({ status: 400, description: 'Bad Request. Email and password are required or invalid email format.' })
    @ApiResponse({ status: 409, description: 'Conflict. Email already exists.' })
    @ApiBody({ type: CreateUserDto, description: 'User registration data' })
    async register(@Body() createUserDto: CreateUserDto) {
        const user = await this.AuthService.register(createUserDto);
        return {
            message: 'User registered successfully',
            user,
        };
    }

    @Post('login')
    @ApiOperation({ summary: 'Login a user' })
    @ApiResponse({ status: 200, description: 'The user has been successfully logged in.' })
    @ApiResponse({ status: 400, description: 'Bad Request. Email and password are required or invalid email format.' })
    @ApiResponse({ status: 401, description: 'Unauthorized. Invalid email or password.' })
    @ApiBody({ type: CreateUserDto, description: 'User login data' })
    async login(@Body() req) {
        const user = await this.AuthService.validateUser(req.email, req.password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return this.AuthService.login(user);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('users')
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'The found records' })
    @ApiQuery({ name: 'page', required: false, description: 'The page number', example: 1 })
    @ApiQuery({ name: 'limit', required: false, description: 'The number of items per page', example: 10 })
    @ApiQuery({ name: 'email', required: false, description: 'Email to search for', example: 'user' })
    async findAll(@Query() query: FindUsersDto) {
        return this.AuthService.findAll(query);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('logs')
    @ApiOperation({ summary: 'Get logs' })
    @ApiResponse({ status: 200, description: 'The found records' })
    @ApiQuery({ name: 'page', required: false, description: 'The page number', example: 1 })
    @ApiQuery({ name: 'limit', required: false, description: 'The number of items per page', example: 10 })
    @ApiQuery({ name: 'email', required: false, description: 'Email to search for in logs', example: 'user' })
    @ApiQuery({ name: 'from', required: false, description: 'Start date for logs', example: '2024-06-20T00:00:00' })
    @ApiQuery({ name: 'to', required: false, description: 'End date for logs', example: '2025-01-31T23:59:59' })
    async getLogs(@Query() query: GetLogsDto) {
        return this.AuthService.getLogs(query);
    }
}
