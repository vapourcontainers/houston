import dayjs from 'dayjs';

import { Controller, Get } from '@nestjs/common';

import { ListObjectsV2Request } from '@alicloud/oss20190517';

import { AliyunService } from './aliyun.service';
import { getBucketStat } from './aliyun/oss';

import type {
  IStorageInfo,
  IStorageItem,
} from '@vapourcontainers-houston/typing';

@Controller('storage')
export class StorageController {
  constructor(private readonly aliyun: AliyunService) {
  }

  @Get()
  async getInfo(): Promise<IStorageInfo | undefined> {
    const stat = await getBucketStat(this.aliyun.oss, this.aliyun.config.oss.bucket);
    if (!stat.body) return;

    return {
      capacityUsed: stat.body.storage ?? 0,
      capacityTotal: undefined,
      objects: stat.body.objectCount ?? 0,
    };
  }

  @Get('items')
  async listItems(): Promise<IStorageItem[] | undefined> {
    const objects = await this.aliyun.oss.listObjectsV2(this.aliyun.config.oss.bucket,
      new ListObjectsV2Request());
    if (!objects.body?.contents) return;

    return objects.body.contents.map((object): IStorageItem => ({
      name: object.key!,
      size: object.size!,
      modifiedAt: dayjs(object.lastModified!).toISOString(),
    }));
  }
}
