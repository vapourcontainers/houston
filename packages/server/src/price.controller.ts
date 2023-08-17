import { stringify } from 'querystring';

import { Controller, Get, Query } from '@nestjs/common';

import { GetPayAsYouGoPriceRequest } from '@alicloud/bssopenapi20171214';

import { AliyunService } from './aliyun.service';

import type {
  IPrice,
} from '@vapourcontainers-houston/typing';

@Controller('prices')
export class PriceController {
  constructor(private readonly aliyun: AliyunService) {
  }

  @Get('runner')
  async getRunnerPrice(@Query('type') type: string): Promise<IPrice | undefined> {
    const price = await this.aliyun.bss.getPayAsYouGoPrice(new GetPayAsYouGoPriceRequest({
      productCode: 'ecs',
      subscriptionType: 'PayAsYouGo',
      region: this.aliyun.config.regionId,
      moduleList: [
        {
          moduleCode: 'InstanceType',
          priceType: 'Hour',
          config: stringify(<Record<string, string>>{
            'InstanceType': type,
            'Region': this.aliyun.config.regionId,
          }, ',', ':'),
        },
      ],
    }));

    const cost = price.body.data?.moduleDetails?.moduleDetail?.[0]?.costAfterDiscount;
    if (typeof cost == 'undefined') return;

    return {
      price: cost,
      per: 'hour',
    };
  }

  @Get('storage')
  async getStoragePrice(@Query('used') storage?: string): Promise<IPrice | undefined> {
    const price = await this.aliyun.bss.getPayAsYouGoPrice(new GetPayAsYouGoPriceRequest({
      productCode: 'oss',
      subscriptionType: 'PayAsYouGo',
      region: this.aliyun.config.regionId,
      moduleList: [
        {
          moduleCode: 'Storage',
          priceType: 'Hour',
          config: stringify(<Record<string, string>>{
            'Storage': storage || '0',
            'StorageType': 'standard',
            'Region': this.aliyun.config.regionId,
          }, ',', ':'),
        },
      ],
    }));

    const cost = price.body.data?.moduleDetails?.moduleDetail?.[0]?.costAfterDiscount;
    if (typeof cost == 'undefined') return;

    return {
      price: cost * 24,
      per: 'day',
    };
  }
}
