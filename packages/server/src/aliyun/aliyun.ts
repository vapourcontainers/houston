import { Config } from '@alicloud/openapi-client';
import BSS from '@alicloud/bssopenapi20171214';
import ECI from '@alicloud/eci20180808';
import OSS from '@alicloud/oss20190517';

import type { IConfig } from 'src/config';

function sdk<T>(constructor: T): T {
  return (constructor as any)!.default! as T;
}

export function createInstance(config: IConfig): IAliyun {
  const baseConfig = {
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessSecret,
    regionId: config.regionId,
  };

  const bss = new (sdk(BSS))(new Config({
    ...baseConfig,
  }));

  const oss = new (sdk(OSS))(new Config({
    ...baseConfig,
    endpoint: `oss-${config.regionId}.aliyuncs.com`,
  }));

  const eci = new (sdk(ECI))(new Config({
    ...baseConfig,
    endpoint: `eci.${config.regionId}.aliyuncs.com`,
  }));

  return {
    bss,
    eci,
    oss,
  };
}

export interface IAliyun {
  bss: BSS;
  eci: ECI;
  oss: OSS;
}
