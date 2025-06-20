import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CartDocument = Cart & Document;

@Schema({ timestamps: true })
export class Cart {
  @ApiProperty({ description: 'User ID', example: 'user123' })
  @Prop({ required: true, index: true })
  userId: string;

  @ApiProperty({ description: 'Product ID', example: '121721252883996' })
  @Prop({ required: true })
  productId: string;

  @ApiProperty({ description: 'Quantity of the product in the cart', example: 2 })
  @Prop({ required: true, default: 1 })
  quantity: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
// Create a compound index for userId and productId to ensure uniqueness
CartSchema.index({ userId: 1, productId: 1 }, { unique: true });
