import { stringify } from 'querystring';

import { Controller, Get, Query } from '@nestjs/common';

import { ListObjectsV2Request } from '@alicloud/oss20190517';
import { GetPayAsYouGoPriceRequest } from '@alicloud/bssopenapi20171214';

import { AliyunService } from './aliyun.service';
import { getBucketStat } from './aliyun/oss';

@Controller('storage')
export class StorageController {
  constructor(private readonly aliyun: AliyunService) {
  }

  @Get()
  async getStats() {
    const stat = await getBucketStat(this.aliyun.oss, this.aliyun.config.oss.bucket);
    return stat.body;
  }

  @Get('files')
  async listFiles() {
    const objects = await this.aliyun.oss.listObjectsV2(this.aliyun.config.oss.bucket, new ListObjectsV2Request());
    return objects.body.contents;
  }

  @Get('cost')
  async getCost(@Query('storage_gb') storage?: string) {
    const objects = await this.aliyun.bss.getPayAsYouGoPrice(new GetPayAsYouGoPriceRequest({
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

    return objects.body.data?.moduleDetails?.moduleDetail?.[0];
  }
}
