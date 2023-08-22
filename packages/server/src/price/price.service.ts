import { Inject, Injectable } from '@nestjs/common';
import { stringify } from 'node:querystring';

import { GetPayAsYouGoPriceRequest } from '@alicloud/bssopenapi20171214';

import { CONFIG, type IConfig } from 'src/aliyun/config.service';
import { BSSService } from 'src/aliyun/bss.service';

import type {
  IPrice,
} from '@vapourcontainers-houston/types';

@Injectable()
export class PriceService {
  constructor(
    @Inject(CONFIG) private readonly config: IConfig,
    @Inject(BSSService) private readonly bss: BSSService,
  ) { }

  async getRunnerPrice(type: string): Promise<IPrice | undefined> {
    const price = await this.bss.getPayAsYouGoPrice(new GetPayAsYouGoPriceRequest({
      productCode: 'ecs',
      subscriptionType: 'PayAsYouGo',
      region: this.config.regionId,
      moduleList: [
        {
          moduleCode: 'InstanceType',
          priceType: 'Hour',
          config: stringify(<Record<string, string>>{
            'InstanceType': type,
            'Region': this.config.regionId,
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

  async getStoragePrice(storage = 0): Promise<IPrice | undefined> {
    const price = await this.bss.getPayAsYouGoPrice(new GetPayAsYouGoPriceRequest({
      productCode: 'oss',
      subscriptionType: 'PayAsYouGo',
      region: this.config.regionId,
      moduleList: [
        {
          moduleCode: 'Storage',
          priceType: 'Hour',
          config: stringify(<Record<string, string>>{
            'Storage': `${storage}`,
            'StorageType': 'standard',
            'Region': this.config.regionId,
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
