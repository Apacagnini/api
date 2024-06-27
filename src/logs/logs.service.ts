import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log } from './schemas/log.schema';
import { GetLogsDto } from '../dto/getLogs.dto';

@Injectable()
export class LogsService {
    constructor(@InjectModel('Logs') private LogModel: Model<Log>) { }

    async createLog(email: string, userId: string, event: string): Promise<Log> {
        const log = new this.LogModel({
            email, userId, event, timestamp: new Date()
        });
        return await log.save();
    }

    async findAll(query: GetLogsDto) {
        const { page = 1, limit = 10, email, from, to } = query;
        const dbQuery = {};

        if (email) {
            dbQuery['email'] = { $regex: email, $options: 'i' };
        }
        if (from) {
            dbQuery['timestamp'] = { $gte: new Date(from) };
        }
        if (to) {
            if (!dbQuery['timestamp']) dbQuery['timestamp'] = {};
            dbQuery['timestamp']['$lte'] = new Date(to);
        }

        const data = await this.LogModel.find(dbQuery)
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();
        const count = await this.LogModel.countDocuments(dbQuery).exec();
        return { data, count };
    }
}