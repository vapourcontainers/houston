import { Controller, Get, HttpException, HttpStatus, Inject, Query } from '@nestjs/common';

import type {
  IPrice,
} from '@vapourcontainers-houston/types';

import { PriceService } from './price.service';

@Controller('prices')
export class PriceController {
  constructor(
    @Inject(PriceService) private readonly priceService: PriceService,
  ) { }

  @Get('runner')
  async getRunnerPrice(@Query('type') type: string): Promise<IPrice> {
    const price = await this.priceService.getRunnerPrice(type);
    if (price) {
      return price;
    } else {
      throw new HttpException({}, HttpStatus.NOT_FOUND);
    }
  }

  @Get('storage')
  async getStoragePrice(@Query('used') storage?: string): Promise<IPrice> {
    const price = await this.priceService.getStoragePrice(parseInt(storage ?? '0'));
    if (price) {
      return price;
    } else {
      throw new HttpException({}, HttpStatus.NOT_FOUND);
    }
  }
}
