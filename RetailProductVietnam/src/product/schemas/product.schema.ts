import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @ApiProperty({ description: 'Unique identifier for the product', example: 'PROD-1234' })
  @Prop({ required: true, unique: true })
  productId: string;

  @ApiProperty({ description: 'Product name', example: 'Training T-Shirt' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'Product price in VND', example: 250000 })
  @Prop({ required: true })
  price: number;

  @ApiProperty({ description: 'Product description', example: 'Breathable training t-shirt made for high-intensity workouts' })
  @Prop()
  description: string;

  @ApiProperty({ description: 'URL to product image', example: 'https://example.com/images/t-shirt.jpg' })
  @Prop()
  imageUrl: string;

  @ApiProperty({ description: 'Product category', example: 'Clothing' })
  @Prop()
  category: string;

  @ApiProperty({ description: 'Product brand', example: 'Decathlon' })
  @Prop()
  brand: string;

  @ApiProperty({ description: 'Product weight in grams', example: 150 })
  @Prop()
  weight: number;

  @ApiProperty({ 
    description: 'Additional product attributes',
    example: { color: 'Blue', size: 'L', material: '100% polyester' }
  })
  @Prop({ type: Object })
  attributes: Record<string, any>;
}

export const ProductSchema = SchemaFactory.createForClass(Product);