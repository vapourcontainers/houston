import dayjs from 'dayjs';

import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';

import { ListObjectsV2Request } from '@alicloud/oss20190517';

import { AliyunService } from './aliyun.service';
import { getBucketStat } from './aliyun/oss';

import type {
  IStorageInfo,
  IStorageItem,
} from '@vapourcontainers-houston/types';

@Controller('storage')
export class StorageController {
  constructor(private readonly aliyun: AliyunService) {
  }

  @Get()
  async getInfo(): Promise<IStorageInfo> {
    const stat = await getBucketStat(this.aliyun.oss, this.aliyun.config.oss.bucket);
    if (!stat.body) throw new HttpException({}, HttpStatus.NOT_FOUND);

    return {
      capacityUsed: stat.body.storage ?? 0,
      capacityTotal: undefined,
      objects: stat.body.objectCount ?? 0,
    };
  }

  @Get('items')
  async listItems(): Promise<IStorageItem[]> {
    const objects = await this.aliyun.oss.listObjectsV2(this.aliyun.config.oss.bucket,
      new ListObjectsV2Request());
    if (!objects.body?.contents) throw new HttpException({}, HttpStatus.NOT_FOUND);

    return objects.body.contents.map((object): IStorageItem => ({
      name: object.key!,
      size: object.size!,
      modifiedAt: dayjs(object.lastModified!).toISOString(),
    }));
  }
}
