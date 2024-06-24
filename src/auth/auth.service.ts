import { Injectable, ConflictException, BadRequestException, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel, InjectConnection } from '@nestjs/mongoose'; 
import { Model, Connection } from 'mongoose'; 
import * as bcrypt from 'bcrypt';
import { User } from './interfaces/user/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { BusinessService } from '../business/business.service';
import { FindUsersDto } from '../dto/find-users.dto';
import { LogsService } from '../logs/logs.service';
import { GetLogsDto } from '../dto/getLogs.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        private readonly jwtService: JwtService,
        private readonly businessService: BusinessService,
        private logsService: LogsService,
        @InjectConnection() private readonly connection: Connection
    ) { }

    async register(createUserDto: CreateUserDto): Promise<User> {
        if (!createUserDto.email || !createUserDto.password) {
            throw new BadRequestException('Email and password are required');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(createUserDto.email)) {
            throw new BadRequestException('Invalid email format');
        }

        if (createUserDto.password.trim() === "") {
            throw new BadRequestException('Password cannot be empty');
        }

        const existingUser = await this.userModel.findOne({ email: createUserDto.email }).exec();
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const createdUser = new this.userModel({
            email: createUserDto.email,
            password: hashedPassword,
        });

        try {
            const dbSize = await this.getDatabaseSize();
            const maxDbSize = parseInt(process.env.USERS_COLLECTION_MAX_SIZE, 10) || 10485760; // default 10 MB in bytes

            if (dbSize >= maxDbSize) {
                throw new HttpException('Error registering user: Database full.', HttpStatus.SERVICE_UNAVAILABLE);
            }

            const savedUser = await createdUser.save();
            await this.logsService.createLog(savedUser.email, savedUser._id.toString(), 'registration');
            return savedUser;

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                console.error(error);
                throw new HttpException('Error registering user.', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    private async getDatabaseSize(): Promise<number> {
        const stats = await this.connection.db.stats();
        return stats.dataSize;
    }

    async validateUser(email: string, password: string): Promise<any> {
        if (!email || !password) {
            throw new BadRequestException('Email and password are required');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new BadRequestException('Invalid email format');
        }

        const user = await this.userModel.findOne({ email }).exec();
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const { password: _, ...result } = user.toObject();
        return result;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user._id };
        await this.logsService.createLog(user.email, user._id, 'login');
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async findAll(query: FindUsersDto) {
        return this.businessService.findAll(query);
    }

    async getLogs(query: GetLogsDto) {
        return this.logsService.findAll(query);
    }
}
