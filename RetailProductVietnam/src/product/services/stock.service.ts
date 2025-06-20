import { Injectable, Logger, UnauthorizedException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, timeout } from 'rxjs';
import { AxiosError } from 'axios';

export interface StockResponse {
  productId: string;
  quantity: number;
  locationId: string;
  available: boolean;
}

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs = 5000; // 5 seconds timeout
  private readonly maxRetries = 3;   // Maximum number of retry attempts
  private readonly retryDelayMs = 1000; // Delay between retries in milliseconds

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('RETAIL_STOCK_UNITED_API_URL');
    this.apiKey = this.configService.get<string>('RETAIL_STOCK_UNITED_API_KEY');
    
    // Log warning if API key is missing
    if (!this.apiKey) {
      this.logger.warn('RETAIL_STOCK_UNITED_API_KEY is not set. API calls to RetailStockUnited will fail.');
    }
  }

  async getStockByProductId(productId: string, userId?: string): Promise<StockResponse | null> {
    try {
      // Ensure API key is available
      if (!this.apiKey) {
        throw new UnauthorizedException('API key for RetailStockUnited is not configured');
      }

      interface AxiosResponse<T = any> {
        data: T;
        status: number;
        statusText: string;
        headers: Record<string, string>;
        config: Record<string, any>;
      }

      const response = await firstValueFrom(
        this.httpService
          .get<StockResponse>(`${this.apiUrl}/stocks/${productId}`, {
            headers: {
              'X-API-KEY': this.apiKey,
              ...(userId ? { 'userId': userId } : {}),
            },
          })
          .pipe(
            timeout(this.timeoutMs),
            catchError((error: AxiosError) => {
              // Handle specific status codes
              if (error.response) {
                switch (error.response.status) {
                  case 401:
                    this.logger.error(`Authentication failed for RetailStockUnited API: Invalid API key`);
                    throw new UnauthorizedException('Authentication failed for stock service');
                  case 404:
                    this.logger.warn(`Stock not found for product ${productId}`);
                    return null;
                  default:
                    this.logger.error(`Error fetching stock for product ${productId}: ${error.message} (Status: ${error.response.status})`);
                }
              } else {
                this.logger.error(`Error fetching stock for product ${productId}: ${error.message}`);
              }
              throw error;
            }),
          ),
      ) as AxiosResponse<StockResponse>;
      
      return response?.data || null;
    } catch (error) {
      // Handle the case where an UnauthorizedException was already created
      if (error instanceof UnauthorizedException) {
        this.logger.error(`Authentication error: ${error.message}`);
        // We could choose to re-throw this error, but for resilience we'll return null
        // This way the product can still be displayed without stock information
        return null;
      }

      this.logger.error(`Failed to get stock for product ${productId}`, error.stack);
      return null;
    }
  }

  async updateStock(productId: string, quantity: number, userId?: string): Promise<StockResponse | null> {
    let retries = 0;
    
    while (true) {
      try {
        // Ensure API key is available
        if (!this.apiKey) {
          throw new UnauthorizedException('API key for RetailStockUnited is not configured');
        }

        interface AxiosResponse<T = any> {
          data: T;
          status: number;
          statusText: string;
          headers: Record<string, string>;
          config: Record<string, any>;
        }

        const response = await firstValueFrom(
          this.httpService
            .put<StockResponse>(
              `${this.apiUrl}/stocks/${productId}`, 
              { quantity },
              {
                headers: {
                  'X-API-KEY': this.apiKey,
                  'Content-Type': 'application/json',
                  ...(userId ? { 'userId': userId } : {}),
                },
              }
            )
            .pipe(
              timeout(this.timeoutMs),
              catchError((error: AxiosError) => {
                // Don't retry for specific error types
                const noRetryStatuses = [400, 401, 404];
                
                if (error.response && noRetryStatuses.includes(error.response.status)) {
                  // Handle specific status codes that shouldn't be retried
                  switch (error.response.status) {
                    case 401:
                      this.logger.error(`Authentication failed for RetailStockUnited API: Invalid API key`);
                      throw new UnauthorizedException('Authentication failed for stock service');
                    case 404:
                      this.logger.warn(`Stock not found for product ${productId}`);
                      throw new NotFoundException(`Stock for product ${productId} not found`);
                    case 400:
                      this.logger.error(`Bad request when updating stock for product ${productId}: ${error.message}`);
                      throw new InternalServerErrorException(`Invalid stock update request: ${error.message}`);
                  }
                } else if (retries < this.maxRetries) {
                  // For network errors or 500s, we'll retry in the outer loop
                  throw error;
                } else {
                  // We've exhausted retries, throw appropriate error
                  if (error.response) {
                    this.logger.error(`Error updating stock after ${retries} retries for product ${productId}: ${error.message} (Status: ${error.response.status})`);
                    throw new InternalServerErrorException(`Failed to update stock after ${retries} retries: ${error.message}`);
                  } else {
                    this.logger.error(`Error updating stock after ${retries} retries for product ${productId}: ${error.message}`);
                    throw new InternalServerErrorException(`Stock service unavailable after ${retries} retries: ${error.message}`);
                  }
                }
                throw error; // This will be caught by the outer try/catch
              }),
            ),
        ) as AxiosResponse<StockResponse>;
        
        this.logger.log(`Successfully updated stock for product ${productId}: ${quantity} units${retries > 0 ? ` (after ${retries} retries)` : ''}`);
        return response?.data || null;
        
      } catch (error) {
        // Handle specific exceptions that shouldn't be retried
        if (error instanceof UnauthorizedException || 
            error instanceof NotFoundException || 
            error instanceof InternalServerErrorException) {
          throw error;
        }
        
        // For other errors (network, timeouts, server errors), retry
        retries++;
        
        if (retries <= this.maxRetries) {
          const delayMs = this.retryDelayMs * retries; // Increasing delay for each retry
          this.logger.warn(`Retrying stock update for product ${productId} (attempt ${retries}/${this.maxRetries}) after ${delayMs}ms`);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        
        // We've exhausted all retries
        this.logger.error(`Failed to update stock for product ${productId} after ${retries-1} retries`, error.stack);
        throw new InternalServerErrorException(`Failed to update stock: Service unavailable after ${retries-1} retries`);
      }
    }
  }
}