import type { DynamicModule } from '@nestjs/common';

import { CONFIG, configProvider } from './config.service';
import { BSSService } from './bss.service';
import { ECIService } from './eci.service';
import { OSSService } from './oss.service';

export class AliyunModule {
  static forRoot(configFile: string): DynamicModule {
    return {
      module: AliyunModule,
      providers: [
        configProvider(configFile),
        BSSService,
        ECIService,
        OSSService,
      ],
      exports: [
        CONFIG,
        BSSService,
        ECIService,
        OSSService,
      ],
    };
  }
}
