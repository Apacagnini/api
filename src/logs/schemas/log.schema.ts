import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

@Schema({
    capped: { size: parseInt(process.env.LOGS_COLLECTION_MAX_SIZE, 10) || 10485760 } // default 10 MB in bytes
})
export class Log extends Document {
    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    event: string;

    @Prop({ required: true })
    timestamp: Date;
}

export const LogSchema = SchemaFactory.createForClass(Log);
