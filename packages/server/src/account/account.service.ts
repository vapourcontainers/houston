import { Injectable } from '@nestjs/common';

import { BSSService } from '../aliyun/bss.service';

import type {
  IAccountBalance,
} from '@vapourcontainers-houston/types';

@Injectable()
export class AccountService {
  constructor(
    private readonly bss: BSSService,
  ) { }

  async getBalance(): Promise<IAccountBalance | undefined> {
    const balance = await this.bss.queryAccountBalance();
    if (!balance.body) return;

    return {
      available: parseFloat(balance.body.data?.availableAmount ?? '0'),
    };
  }
}
