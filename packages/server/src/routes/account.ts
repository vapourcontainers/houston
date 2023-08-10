import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { Config } from '@alicloud/openapi-client';
import BSS from '@alicloud/bssopenapi20171214';

import aliyun from '../aliyun/aliyun';

import type { IConfig } from '../config'

export default function account(config: IConfig): Router {
  const router = Router();

  const client = new (aliyun(BSS))(new Config({
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessSecret,
    regionId: config.regionId,
  }));

  router.get('/balance', asyncHandler(async (_req, res) => {
    const objects = await client.queryAccountBalance();
    res.json(objects.body.data);
  }));

  return router;
}
