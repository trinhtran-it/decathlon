import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Unique identifier for the product', example: 'PROD-1234' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Product name', example: 'Training T-Shirt' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Product price in VND', example: 250000 })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ description: 'Product description', example: 'Breathable training t-shirt made for high-intensity workouts' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'URL to product image', example: 'https://example.com/images/t-shirt.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Product category', example: 'Clothing' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Product brand', example: 'Decathlon' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: 'Product weight in grams', example: 150 })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ 
    description: 'Additional product attributes',
    example: { color: 'Blue', size: 'L', material: '100% polyester' }
  })
  @IsOptional()
  attributes?: Record<string, any>;
}