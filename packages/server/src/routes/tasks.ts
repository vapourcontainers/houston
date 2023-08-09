import { Router } from 'express';
import { Config } from '@alicloud/openapi-client';
import ECI, { DescribeContainerGroupsRequest, DescribeContainerLogRequest } from '@alicloud/eci20180808';

import type { IConfig } from '../config'

export default function tasks(config: IConfig): Router {
  const router = Router();

  const Client = (ECI as any)!.default! as typeof ECI;

  const client = new Client(new Config({
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessSecret,
    endpoint: `eci.${config.regionId}.aliyuncs.com`,
  }));

  router.get('/', async (_req, res) => {
    const containers = await client.describeContainerGroups(new DescribeContainerGroupsRequest({
      regionId: config.regionId,
    }));

    res.json(containers.body.containerGroups);
  });

  router.get('/:groupId/:name/info', async (req, res) => {
    const log = await client.describeContainerLog(new DescribeContainerLogRequest({
      regionId: config.regionId,
      containerGroupId: req.params.groupId,
      containerName: req.params.name,
    }));

    const lines = (log.body.content?.split('\n') ?? []);
    const offset = lines.findIndex((line) => line.includes('vspipe --info'));
    const info = lines.slice(offset + 1, offset + 12).join('\n');

    const width = parseInt(info.match(/^Width: (\d+)/m)?.[1] || '');
    const height = parseInt(info.match(/^Height: (\d+)/m)?.[1] || '');
    const frames = parseInt(info.match(/^Frames: (\d+)/m)?.[1] || '');
    const fps = info.match(/^FPS: (\d+\/\d+)/m)?.[1];
    const formatName = info.match(/^Format Name: (\S+)/m)?.[1];
    const colorFamily = info.match(/^Color Family: (\S+)/m)?.[1];
    const bits = parseInt(info.match(/^Bits: (\d+)/m)?.[1] || '');

    res.json({
      width,
      height,
      frames,
      fps,
      formatName,
      colorFamily,
      bits,
    });
  });

  return router;
}
