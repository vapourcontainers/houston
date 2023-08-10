import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { stringify } from 'querystring';
import { GetPayAsYouGoPriceRequest } from '@alicloud/bssopenapi20171214';
import { ListObjectsV2Request } from '@alicloud/oss20190517';

import type { IConfig } from '../config'
import type { IAliyun } from '../aliyun/aliyun';
import { getBucketStat } from '../aliyun/oss';

export default function storage(config: IConfig, { bss, oss }: IAliyun): Router {
  const router = Router();

  router.get('/', asyncHandler(async (_req, res) => {
    const stat = await getBucketStat(oss, config.oss.bucket);
    res.json(stat.body);
  }));

  router.get('/files', asyncHandler(async (_req, res) => {
    const objects = await oss.listObjectsV2(config.oss.bucket, new ListObjectsV2Request());
    res.json(objects.body.contents);
  }));

  router.get('/cost', asyncHandler(async (req, res) => {
    const objects = await bss.getPayAsYouGoPrice(new GetPayAsYouGoPriceRequest({
      productCode: 'oss',
      subscriptionType: 'PayAsYouGo',
      region: config.regionId,
      moduleList: [
        {
          moduleCode: 'Storage',
          priceType: 'Hour',
          config: stringify(<Record<string, string>>{
            'Storage': req.query['storage_gb'] || '0',
            'StorageType': 'standard',
            'Region': config.regionId,
          }, ',', ':'),
        },
      ],
    }));

    res.json(objects.body.data?.moduleDetails?.moduleDetail?.[0]);
  }));

  return router;
}
