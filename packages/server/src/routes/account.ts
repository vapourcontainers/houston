import { Router } from 'express';
import { Config } from '@alicloud/openapi-client';
import BSS from '@alicloud/bssopenapi20171214';

import type { IConfig } from '../config'

export default function account(config: IConfig): Router {
  const router = Router();

  const Client = (BSS as any)!.default! as typeof BSS;

  const client = new Client(new Config({
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessSecret,
    regionId: config.regionId,
  }));

  router.get('/balance', async (_req, res) => {
    const objects = await client.queryAccountBalance();
    res.json(objects.body.data);
  });

  return router;
}
