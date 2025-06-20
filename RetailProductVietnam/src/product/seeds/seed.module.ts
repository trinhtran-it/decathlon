import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommandModule } from 'nestjs-command';
import { ProductSeed } from './product.seed';
import { Product, ProductSchema } from '../schemas/product.schema';

@Module({
  imports: [
    CommandModule,
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  providers: [ProductSeed],
  exports: [ProductSeed],
})
export class SeedModule {}