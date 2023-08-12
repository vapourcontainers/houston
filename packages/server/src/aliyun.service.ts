import fs from 'fs-extra';
import YAML from 'yaml';

import { Injectable } from '@nestjs/common';

import { Config } from '@alicloud/openapi-client';
import BSS from '@alicloud/bssopenapi20171214';
import ECI from '@alicloud/eci20180808';
import OSS from '@alicloud/oss20190517';

const configPath = new URL('../../../config/config.yaml', import.meta.url).pathname;
const config = YAML.parse(await fs.readFile(configPath, 'utf-8')) as IConfig;

function sdk<T>(constructor: T): T {
  return (constructor as any)!.default! as T;
}

@Injectable()
export class AliyunService {
  public readonly config = config;

  private readonly baseConfig = {
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessSecret,
    regionId: config.regionId,
  };

  public readonly bss = new (sdk(BSS))(new Config({
    ...this.baseConfig,
  }));

  public readonly oss = new (sdk(OSS))(new Config({
    ...this.baseConfig,
    endpoint: `oss-${config.regionId}.aliyuncs.com`,
  }));

  public readonly eci = new (sdk(ECI))(new Config({
    ...this.baseConfig,
    endpoint: `eci.${config.regionId}.aliyuncs.com`,
  }));
}

interface IConfig {
  accessKeyId: string;
  accessSecret: string;
  regionId: string;
  resourceGroupId: string;
  ecs: {
    securityGroupId: string;
  };
  vpc: {
    vSwitchId: string;
  };
  oss: {
    bucket: string;
  };
};
