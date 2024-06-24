import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../auth/interfaces/user/user.interface';
import { FindUsersDto } from '../dto/find-users.dto';

@Injectable()
export class BusinessService {
    constructor(@InjectModel('User') private readonly userModel: Model<User>) { }

    async findAll(query: FindUsersDto) {
        const { page = 1, limit = 10, email } = query;
        const searchQuery = email ? { email: new RegExp(email, 'i') } : {};
        const users = await this.userModel
            .find(searchQuery)
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();
        const total = await this.userModel.countDocuments(searchQuery).exec();
        return { users, total, page, limit };
    }
}
