import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ProductController } from './product.controller';
import { ProductService } from './services/product.service';
import { StockService } from './services/stock.service';
import { UpdateStockDto } from './dto/update-stock.dto';
import { NotFoundException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { Product } from './schemas/product.schema';
import { getModelToken } from '@nestjs/mongoose';

// Mock product data
const mockProduct = {
  _id: '12345',
  id: '12345',
  name: 'Test Product',
  description: 'Test Description',
  price: 99.99,
  category: 'Test Category',
  imageUrl: 'test-image.jpg'
};

// Mock stock response
const mockStockResponse = {
  productId: '12345',
  quantity: 10,
  locationId: 'VN-HCM',
  available: true
};

describe('ProductController', () => {
  let controller: ProductController;
  let productService: ProductService;
  let stockService: StockService;

  beforeEach(async () => {
    // Create mock services
    const mockProductService = {
      findOne: jest.fn().mockResolvedValue(mockProduct),
      findAllWithStock: jest.fn().mockResolvedValue([{ ...mockProduct, stock: mockStockResponse }]),
      findOneWithStock: jest.fn().mockResolvedValue({ ...mockProduct, stock: mockStockResponse })
    };

    const mockStockService = {
      getStockByProductId: jest.fn().mockResolvedValue(mockStockResponse),
      updateStock: jest.fn().mockResolvedValue(mockStockResponse)
    };

    const mockHttpService = {
      axiosRef: {
        get: jest.fn().mockResolvedValue({ data: mockStockResponse }),
        put: jest.fn().mockResolvedValue({ data: mockStockResponse })
      }
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'RETAIL_STOCK_UNITED_API_URL') {
          return 'http://retail-stock-united/api/v1';
        }
        if (key === 'RETAIL_STOCK_UNITED_API_KEY') {
          return 'test-api-key';
        }
        return null;
      })
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService
        },
        {
          provide: StockService,
          useValue: mockStockService
        },
        {
          provide: HttpService,
          useValue: mockHttpService
        },
        {
          provide: ConfigService,
          useValue: mockConfigService
        },
        {
          provide: getModelToken(Product.name),
          useValue: {}
        }
      ]
    }).compile();

    controller = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);
    stockService = module.get<StockService>(StockService);
  });

  describe('updateStock', () => {
    it('should update stock successfully', async () => {
      // Arrange
      const productId = '12345';
      const updateStockDto: UpdateStockDto = { quantity: 5 };
      
      // Act
      const result = await controller.updateStock(productId, updateStockDto);
      
      // Assert
      expect(productService.findOne).toHaveBeenCalledWith(productId);
      expect(stockService.updateStock).toHaveBeenCalledWith(productId, updateStockDto.quantity);
      expect(result).toEqual(mockStockResponse);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      // Arrange
      const productId = 'nonexistent';
      const updateStockDto: UpdateStockDto = { quantity: 5 };
      jest.spyOn(productService, 'findOne').mockRejectedValueOnce(new NotFoundException());
      
      // Act & Assert
      await expect(controller.updateStock(productId, updateStockDto))
        .rejects
        .toThrow(NotFoundException);
      expect(stockService.updateStock).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when API key is invalid', async () => {
      // Arrange
      const productId = '12345';
      const updateStockDto: UpdateStockDto = { quantity: 5 };
      jest.spyOn(stockService, 'updateStock').mockRejectedValueOnce(new UnauthorizedException());
      
      // Act & Assert
      await expect(controller.updateStock(productId, updateStockDto))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });
});
