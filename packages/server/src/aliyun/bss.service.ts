import { Inject, Injectable } from '@nestjs/common';

import { Config } from '@alicloud/openapi-client';
import BSS from '@alicloud/bssopenapi20171214';

import { constructorOf } from './sdk';
import { CONFIG, type IConfig } from './config.service';

@Injectable()
export class BSSService extends constructorOf(BSS) {
  constructor(@Inject(CONFIG) config: IConfig) {
    super(new Config({
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessSecret,
      regionId: config.regionId,
    }));
  }
}
