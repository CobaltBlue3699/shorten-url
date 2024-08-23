import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema()
export class ShortUrl extends Document {
  @Prop({ required: true })
  @ApiProperty({ description: 'The original URL', example: 'https://www.example.com' })
  originalUrl!: string;

  @Prop({ required: true, unique: true })
  @ApiProperty({ description: 'The short URL key', example: 'v5nXypS' })
  key!: string;

  @Prop({ required: true, index: true })
  @ApiProperty({ description: 'The user ID', example: 'user-123' })
  userId!: string;

  @Prop()
  @ApiProperty({ description: 'The title of the original URL', example: 'this is a web title!' })
  title!: string;

  @Prop()
  @ApiPropertyOptional({ description: 'The description of the original URL', example: 'this website is for...' })
  description!: string;

  @Prop()
  @ApiPropertyOptional({
    description: 'The image associated with the original URL',
    example: 'https://www.example.com/img/example.png',
  })
  image!: string;

  @Prop()
  @ApiPropertyOptional({
    description: 'The icon associated with the original URL',
    example: 'https://www.example.com/img/icon/example.png',
  })
  icon!: string;
}

export const ShortUrlSchema = SchemaFactory.createForClass(ShortUrl);
