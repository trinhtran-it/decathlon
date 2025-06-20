import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateStockDto {
  @ApiProperty({
    description: 'Quantity to change (positive to add, negative to subtract)',
    example: -5,
  })
  @IsNotEmpty()
  @IsInt()
  quantity: number;
}
