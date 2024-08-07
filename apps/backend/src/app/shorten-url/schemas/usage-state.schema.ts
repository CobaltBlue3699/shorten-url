import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class UsageStat extends Document {
  @Prop({ required: true })
  shortUrl: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true, default: 0 })
  count: number;
}

export const UsageStatSchema = SchemaFactory.createForClass(UsageStat);
UsageStatSchema.index({ shortUrl: 1, date: 1 }, { unique: true });
