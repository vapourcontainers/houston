import { Inject, Injectable } from '@nestjs/common';

import { Config } from '@alicloud/openapi-client';
import ECI from '@alicloud/eci20180808';

import { constructorOf } from './sdk';
import { CONFIG, type IConfig } from './config.service';

@Injectable()
export class ECIService extends constructorOf(ECI) {
  constructor(@Inject(CONFIG) config: IConfig) {
    super(new Config({
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessSecret,
      regionId: config.regionId,
      endpoint: `eci.${config.regionId}.aliyuncs.com`,
    }));
  }
}
