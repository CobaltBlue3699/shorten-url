import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class DailyUsageStat extends Document {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true, default: 0 })
  count: number;
}

export const DailyUsageStatSchema = SchemaFactory.createForClass(DailyUsageStat);
DailyUsageStatSchema.index({ key: 1, date: 1 }, { unique: true });

@Schema()
export class CountryUsageStat extends Document {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  countryCode: string;

  @Prop({ required: true, default: 0 })
  count: number;
}

export const CountryUsageSchema = SchemaFactory.createForClass(CountryUsageStat);
CountryUsageSchema.index({ key: 1, countryCode: 1 }, { unique: true });
