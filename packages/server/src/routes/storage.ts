import { Router } from 'express';
import { Config } from '@alicloud/openapi-client';
import OSS, { ListObjectsV2Request } from '@alicloud/oss20190517';

import type { IConfig } from '../config'

import { getBucketStat } from '../aliyun/oss';

export default function storage(config: IConfig): Router {
  const router = Router();

  const Client = (OSS as any)!.default! as typeof OSS;

  const client = new Client(new Config({
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessSecret,
    endpoint: `oss-${config.regionId}.aliyuncs.com`,
  }));

  router.get('/', async (_req, res) => {
    const stat = await getBucketStat(client, config.oss.bucket);
    res.json(stat.body);
  });

  router.get('/files', async (_req, res) => {
    const objects = await client.listObjectsV2(config.oss.bucket, new ListObjectsV2Request());
    res.json(objects.body.contents);
  });

  return router;
}
