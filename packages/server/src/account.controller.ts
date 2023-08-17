import { Controller, Get } from '@nestjs/common';

import { AliyunService } from './aliyun.service';

import type {
  IAccountBalance,
} from '@vapourcontainers-houston/types';

@Controller('account')
export class AccountController {
  constructor(private readonly aliyun: AliyunService) {
  }

  @Get('balance')
  async getBalance(): Promise<IAccountBalance | undefined> {
    const balance = await this.aliyun.bss.queryAccountBalance();
    if (!balance.body) return;

    return {
      available: parseFloat(balance.body.data?.availableAmount ?? '0'),
    };
  }
}
