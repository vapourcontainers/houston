import { readFile } from 'node:fs/promises';
import YAML from 'yaml';

import type { FactoryProvider } from '@nestjs/common';

export const CONFIG = 'CONFIG';

export function configProvider(configFile: string): FactoryProvider<IConfig> {
  return {
    provide: CONFIG,
    useFactory: async () => {
      return YAML.parse(await readFile(configFile, 'utf-8'));
    },
  };
}

export interface IConfig {
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
