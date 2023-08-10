import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { Config } from '@alicloud/openapi-client';
import OSS, { ListObjectsV2Request } from '@alicloud/oss20190517';

import type { IConfig } from '../config'

import aliyun from '../aliyun/aliyun';
import { getBucketStat } from '../aliyun/oss';

export default function storage(config: IConfig): Router {
  const router = Router();

  const client = new (aliyun(OSS))(new Config({
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessSecret,
    endpoint: `oss-${config.regionId}.aliyuncs.com`,
  }));

  router.get('/', asyncHandler(async (_req, res) => {
    const stat = await getBucketStat(client, config.oss.bucket);
    res.json(stat.body);
  }));

  router.get('/files', asyncHandler(async (_req, res) => {
    const objects = await client.listObjectsV2(config.oss.bucket, new ListObjectsV2Request());
    res.json(objects.body.contents);
  }));

  return router;
}
