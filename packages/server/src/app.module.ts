import { resolve } from 'node:path';

import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AliyunModule } from './aliyun';

import { AccountController } from './account/account.controller';
import { PriceController } from './price/price.controller';
import { StorageController } from './storage/storage.controller';
import { TaskController } from './task/task.controller';

import { AccountService } from './account/account.service';
import { PriceService } from './price/price.service';
import { StorageService } from './storage/storage.service';
import { RunnerManager } from './task/runner.service';
import { TaskService } from './task/task.service';

const repoRoot = new URL('../../../', import.meta.url).pathname;
const configFile = resolve(repoRoot, 'config/config.yaml');

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: new URL('../../frontend/dist', import.meta.url).pathname,
    }),
    AliyunModule.forRoot(configFile),
  ],
  controllers: [
    AccountController,
    PriceController,
    StorageController,
    TaskController,
  ],
  providers: [
    AccountService,
    PriceService,
    StorageService,
    RunnerManager,
    TaskService,
  ],
})
export class AppModule {
}
