import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import type { IConfig } from '../config'
import type { IAliyun } from '../aliyun/aliyun';

export default function account(_config: IConfig, { bss }: IAliyun): Router {
  const router = Router();

  router.get('/balance', asyncHandler(async (_req, res) => {
    const objects = await bss.queryAccountBalance();
    res.json(objects.body.data);
  }));

  return router;
}
