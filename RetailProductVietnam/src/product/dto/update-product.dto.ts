import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({ description: 'Unique identifier for the product', example: 'PROD-1234' })
  productId?: string;

  @ApiPropertyOptional({ description: 'Product name', example: 'Training T-Shirt' })
  name?: string;

  @ApiPropertyOptional({ description: 'Product price in VND', example: 250000 })
  price?: number;

  @ApiPropertyOptional({ description: 'Product description', example: 'Breathable training t-shirt made for high-intensity workouts' })
  description?: string;

  @ApiPropertyOptional({ description: 'URL to product image', example: 'https://example.com/images/t-shirt.jpg' })
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Product category', example: 'Clothing' })
  category?: string;

  @ApiPropertyOptional({ description: 'Product brand', example: 'Decathlon' })
  brand?: string;

  @ApiPropertyOptional({ description: 'Product weight in grams', example: 150 })
  weight?: number;

  @ApiPropertyOptional({ 
    description: 'Additional product attributes',
    example: { color: 'Blue', size: 'L', material: '100% polyester' }
  })
  attributes?: Record<string, any>;
}