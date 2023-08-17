import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AccountController } from './account.controller';
import { PriceController } from './price.controller';
import { StorageController } from './storage.controller';
import { TaskController } from './task.controller';

import { AliyunService } from './aliyun.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: new URL('../../frontend/dist', import.meta.url).pathname,
    }),
  ],
  controllers: [
    AccountController,
    PriceController,
    StorageController,
    TaskController,
  ],
  providers: [
    AliyunService,
  ],
})
export class AppModule {
}
