import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { LogSchema } from '../logs/schemas/log.schema';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import { BusinessService } from '../business/business.service';
import { LogsService } from '../logs/logs.service'; 
import { LogsModule } from '../logs/logs.module'; 
import * as dotenv from 'dotenv';

dotenv.config();

describe('AuthService', () => {
  let service: AuthService;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'secretKey',
          signOptions: { expiresIn: '1h' },
        }),
        MongooseModule.forFeature([
          { name: 'User', schema: UserSchema },
          { name: 'Logs', schema: LogSchema } 
        ]),
        MongooseModule.forRootAsync({
          useFactory: async () => ({
            uri: mongoServer.getUri(),
          }),
        }),
        LogsModule 
      ],
      providers: [AuthService, BusinessService, LogsService], 
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a user successfully', async () => {
    const newUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword',
    };
    const user = await service.register(newUser);
    expect(user).toBeDefined();
    expect(user.email).toEqual(newUser.email);
  });

  it('should validate a user successfully', async () => {
    const existingUser = await service.register({ 
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword',
    });
    const validatedUser = await service.validateUser(existingUser.email, 'testpassword');
    expect(validatedUser).toBeDefined();
    expect(validatedUser.email).toEqual(existingUser.email);
  });
});