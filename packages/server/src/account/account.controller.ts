import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';

import type {
  IAccountBalance,
} from '@vapourcontainers-houston/types';

import { AccountService } from './account.service';

@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
  ) {
  }

  @Get('balance')
  async getBalance(): Promise<IAccountBalance> {
    const balance = await this.accountService.getBalance();
    if (balance) {
      return balance;
    } else {
      throw new HttpException({}, HttpStatus.NOT_FOUND);
    }
  }
}
