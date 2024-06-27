import { Test, TestingModule } from '@nestjs/testing';
import { LogsService } from './logs.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LogSchema } from './schemas/log.schema';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';

describe('LogsService', () => {
  let service: LogsService;
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
        MongooseModule.forFeature([{ name: 'Logs', schema: LogSchema }]),
        MongooseModule.forRootAsync({
          useFactory: async () => ({
            uri: mongoServer.getUri(),
          }),
        }),
      ],
      providers: [LogsService],
    }).compile();

    service = module.get<LogsService>(LogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new log entry', async () => {
    const newLog = await service.createLog('test@example.com', 'testUserId', 'testEvent');
    expect(newLog).toBeDefined();
    expect(newLog.email).toEqual('test@example.com');
    expect(newLog.event).toEqual('testEvent');
  });

  it('should find all log entries', async () => {
    const logs = await service.findAll({});
    expect(logs).toBeDefined();
  });
});