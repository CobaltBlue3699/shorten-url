import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ShortUrl extends Document {
  @Prop({ required: true })
  originalUrl!: string;

  @Prop({ required: true, unique: true })
  shortUrl!: string;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop()
  title!: string;

  @Prop()
  description!: string;

  @Prop()
  image!: string;
}

export const ShortUrlSchema = SchemaFactory.createForClass(ShortUrl);
