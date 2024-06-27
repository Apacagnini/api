import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { LogSchema } from './schemas/log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Logs', schema: LogSchema, collection: 'logs' }])
  ],
  providers: [LogsService],
  controllers: [LogsController],
  exports: [LogsService],
})
export class LogsModule {}
