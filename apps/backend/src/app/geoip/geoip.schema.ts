import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class GeoIpTemp extends Document {
  @Prop({ required: true })
  ipStartNum: number;

  @Prop({ required: true })
  ipEndNum: number;

  @Prop({ required: true })
  countryCode: string;
}
export const GeoIpTempSchema = SchemaFactory.createForClass(GeoIpTemp);
GeoIpTempSchema.index({ ipStartNum: 1 });
GeoIpTempSchema.index({ ipEndNum: 1 });

@Schema()
export class GeoIp extends Document {
  @Prop({ required: true })
  ipStartNum: number;

  @Prop({ required: true })
  ipEndNum: number;

  @Prop({ required: true })
  countryCode: string;
}

export const GeoIpSchema = SchemaFactory.createForClass(GeoIp);
GeoIpSchema.index({ ipStartNum: 1 });
GeoIpSchema.index({ ipEndNum: 1 });
