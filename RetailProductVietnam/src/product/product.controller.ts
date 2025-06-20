import { 
  Controller, 
  Get, 
  Param,
  HttpException,
  HttpStatus,
  Logger,
  Put,
  Body,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  Headers,
  Req
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiParam,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBody,
  ApiHeader,
  ApiSecurity
} from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductService, ProductWithStock } from './services/product.service';
import { Product } from './schemas/product.schema';
import { Cart, CartDocument } from './schemas/cart.schema';
import { UpdateStockDto } from './dto/update-stock.dto';
import { StockService, StockResponse } from './services/stock.service';

@ApiTags('products')
@Controller('api/v1/products')
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(
    private readonly productService: ProductService,
    private readonly stockService: StockService,
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with stock information' })
  @ApiOkResponse({ 
    description: 'List of all products with stock information',
    type: [Product]
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async findAll(@Headers('userId') userId?: string): Promise<ProductWithStock[]> {
    try {
      // Log the userId if present
      if (userId) {
        this.logger.log(`GET /products request from userId: ${userId}`);
      }
      return await this.productService.findAllWithStock(userId);
    } catch (error) {
      this.logger.error(`Failed to retrieve products with stock: ${error.message}`, error.stack);
      throw new HttpException('Failed to retrieve products', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID with stock information' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiOkResponse({ 
    description: 'Returns the product with the specified ID including stock information',
    type: Product
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async findOne(
    @Param('id') id: string,
    @Headers('userId') userId?: string
  ): Promise<ProductWithStock> {
    try {
      // Log the userId if present
      if (userId) {
        this.logger.log(`GET /products/${id} request from userId: ${userId}`);
      }
      
      return await this.productService.findOneWithStock(id, userId);
    } catch (error) {
      if (error.name === 'NotFoundException') {
        throw new HttpException(`Product with ID ${id} not found`, HttpStatus.NOT_FOUND);
      }
      this.logger.error(`Failed to retrieve product with stock ${id}: ${error.message}`, error.stack);
      throw new HttpException('Failed to retrieve product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/stock')
  @ApiOperation({ summary: 'Update stock quantity for a product and manage user cart' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({ type: UpdateStockDto })
  @ApiOkResponse({ 
    description: 'Stock quantity updated successfully',
    schema: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
        quantity: { type: 'number' },
        locationId: { type: 'string' },
        available: { type: 'boolean' },
        cartUpdated: { type: 'boolean' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Product or stock not found' })
  @ApiBadRequestResponse({ description: 'Invalid request data' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid API key' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async updateStock(
    @Param('id') id: string,
    @Body() updateStockDto: UpdateStockDto,
    @Headers('userId') userId?: string
  ): Promise<StockResponse & { cartUpdated?: boolean }> {
    try {
      this.logger.log(`PUT /products/${id}/stock request from userId: ${userId} with quantity: ${updateStockDto.quantity}`);
      
      // First, verify that the product exists in our database
      await this.productService.findOne(id);

      // Next, find the current cart entry if it exists
      const existingCart = await this.cartModel.findOne({ userId, productId: id });
      
      // Calculate the new quantity if the cart entry exists
      let newQuantity = -updateStockDto.quantity;
      if (existingCart) {
        newQuantity += existingCart.quantity;

        // Check if the new quantity would be negative
        if (newQuantity < 0) {
          throw new HttpException(
            `Cannot update cart: Resulting quantity would be negative (${newQuantity})`, 
            HttpStatus.BAD_REQUEST
          );
        }
      }
      
      // Only proceed if quantity is valid (non-negative)
      await this.cartModel.findOneAndUpdate(
        { userId, productId: id },
        { userId, productId: id, quantity: newQuantity },
        { upsert: true, new: true }
      );
      this.logger.log(`Cart updated for userId: ${userId}, productId: ${id}, new quantity: ${newQuantity}`);
            
      // Then update the stock through the stock service (which calls RetailStockUnited)
      // Pass the userId to the stock service to forward to RetailStockUnited
      const stockResponse = await this.stockService.updateStock(id, updateStockDto.quantity, userId);
      
      if (!stockResponse) {
        throw new NotFoundException(`Stock for product ${id} not found`);
      }
      
      return { ...stockResponse };
    } catch (error) {
      // Handle specific exceptions
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      
      this.logger.error(`Failed to update stock for product ${id}: ${error.message}`, error.stack);
      throw new HttpException('Failed to update stock', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}