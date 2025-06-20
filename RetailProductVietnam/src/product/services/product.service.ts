import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { StockService } from './stock.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

export interface ProductWithStock {
  productId: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  category?: string;
  brand?: string;
  weight?: number;
  attributes?: Record<string, any>;
  stock?: {
    quantity: number;
    locationId: string;
    available: boolean;
  } | null;
}

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly stockService: StockService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const createdProduct = new this.productModel(createProductDto);
    return createdProduct.save();
  }

  async findAllWithStock(userId?: string): Promise<ProductWithStock[]> {
    try {
      const products = await this.productModel.find().exec();
      const productsWithStock = await Promise.all(
        products.map(async (product) => {
          const stockInfo = await this.stockService.getStockByProductId(product.productId, userId);
          return {
            ...product.toObject(),
            stock: stockInfo
          };
        })
      );
      return productsWithStock;
    } catch (error) {
      this.logger.error(`Error fetching products with stock: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOneWithStock(productId: string, userId?: string): Promise<ProductWithStock> {
    try {
      const product = await this.productModel.findOne({ productId }).exec();
      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      const stockInfo = await this.stockService.getStockByProductId(productId, userId);
      return {
        ...product.toObject(),
        stock: stockInfo
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching product with stock: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Keeping the basic methods for internal use
  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async findOne(productId: string): Promise<Product> {
    const product = await this.productModel.findOne({ productId }).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    return product;
  }

  async update(productId: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const existingProduct = await this.productModel
      .findOneAndUpdate({ productId }, updateProductDto, { new: true })
      .exec();
    
    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    
    return existingProduct;
  }

  async remove(productId: string): Promise<void> {
    const result = await this.productModel.deleteOne({ productId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
  }
}