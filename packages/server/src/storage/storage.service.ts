import { Inject, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

import { ListObjectsV2Request } from '@alicloud/oss20190517';

import { CONFIG, type IConfig } from 'src/aliyun/config.service';
import { OSSService } from '../aliyun/oss.service';

import type {
  IStorageInfo,
  IStorageItem,
} from '@vapourcontainers-houston/types';

@Injectable()
export class StorageService {
  constructor(
    @Inject(CONFIG) private readonly config: IConfig,
    @Inject(OSSService) private readonly oss: OSSService,
  ) { }

  async getInfo(): Promise<IStorageInfo | undefined> {
    const stat = await this.oss.getBucketStat(this.config.oss.bucket);
    if (!stat.body) return;

    return {
      capacityUsed: stat.body.storage ?? 0,
      capacityTotal: undefined,
      objects: stat.body.objectCount ?? 0,
    };
  }

  async listItems(): Promise<IStorageItem[] | undefined> {
    const objects = await this.oss.listObjectsV2(this.config.oss.bucket, new ListObjectsV2Request());
    if (!objects.body?.contents) return;

    return objects.body.contents.map((object): IStorageItem => ({
      name: object.key!,
      size: object.size!,
      modifiedAt: dayjs(object.lastModified!).toISOString(),
    }));
  }
}
