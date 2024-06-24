import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { BusinessModule } from './business/business.module';
import { LogsModule } from './logs/logs.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI),
    AuthModule,
    BusinessModule,
    LogsModule,
  ]
})
export class AppModule {
  constructor() {
    Logger.log(`Connecting to MongoDB with URI: ${process.env.MONGO_URI}`);
  }
}