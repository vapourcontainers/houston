import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { ListObjectsV2Request } from '@alicloud/oss20190517';

import type { IConfig } from '../config'
import type { IAliyun } from '../aliyun/aliyun';
import { getBucketStat } from '../aliyun/oss';

export default function storage(config: IConfig, { oss }: IAliyun): Router {
  const router = Router();

  router.get('/', asyncHandler(async (_req, res) => {
    const stat = await getBucketStat(oss, config.oss.bucket);
    res.json(stat.body);
  }));

  router.get('/files', asyncHandler(async (_req, res) => {
    const objects = await oss.listObjectsV2(config.oss.bucket, new ListObjectsV2Request());
    res.json(objects.body.contents);
  }));

  return router;
}
