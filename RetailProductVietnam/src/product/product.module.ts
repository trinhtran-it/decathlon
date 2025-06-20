import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ProductController } from './product.controller';
import { ProductService } from './services/product.service';
import { StockService } from './services/stock.service';
import { Product, ProductSchema } from './schemas/product.schema';
import { Cart, CartSchema } from './schemas/cart.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Cart.name, schema: CartSchema }
    ]),
    HttpModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, StockService],
})
export class ProductModule {}