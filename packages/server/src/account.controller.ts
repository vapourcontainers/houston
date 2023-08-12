import { Controller, Get } from '@nestjs/common';

import { AliyunService } from './aliyun.service';

@Controller('account')
export class AccountController {
  constructor(private readonly aliyun: AliyunService) {
  }

  @Get('balance')
  async getBalance() {
    const objects = await this.aliyun.bss.queryAccountBalance();
    return objects.body.data;
  }
}
