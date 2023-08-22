import { Controller, Get, HttpException, HttpStatus, Inject } from '@nestjs/common';

import type {
  IStorageInfo,
  IStorageItem,
} from '@vapourcontainers-houston/types';

import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(
    @Inject(StorageService) private readonly storageService: StorageService,
  ) { }

  @Get()
  async getInfo(): Promise<IStorageInfo> {
    const info = await this.storageService.getInfo();
    if (info) {
      return info;
    } else {
      throw new HttpException({}, HttpStatus.NOT_FOUND);
    }
  }

  @Get('items')
  async listItems(): Promise<IStorageItem[]> {
    const items = await this.storageService.listItems();
    if (items) {
      return items;
    } else {
      throw new HttpException({}, HttpStatus.NOT_FOUND);
    }
  }
}
