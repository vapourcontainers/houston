import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { Config } from '@alicloud/openapi-client';
import ECI, { DescribeContainerGroupsRequest, DescribeContainerLogRequest } from '@alicloud/eci20180808';

import aliyun from '../aliyun/aliyun';

import type { IConfig } from '../config'

export default function tasks(config: IConfig): Router {
  const router = Router();

  const client = new (aliyun(ECI))(new Config({
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessSecret,
    endpoint: `eci.${config.regionId}.aliyuncs.com`,
  }));

  router.get('/', asyncHandler(async (_req, res) => {
    const containers = await client.describeContainerGroups(new DescribeContainerGroupsRequest({
      regionId: config.regionId,
    }));

    res.json(containers.body.containerGroups);
  }));

  router.get('/:groupId/:name/info', asyncHandler(async (req, res) => {
    const log = await client.describeContainerLog(new DescribeContainerLogRequest({
      regionId: config.regionId,
      containerGroupId: req.params['groupId'],
      containerName: req.params['name'],
      limitBytes: 10000,
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
  }));

  router.get('/:groupId/:name/progress', asyncHandler(async (req, res) => {
    const log = await client.describeContainerLog(new DescribeContainerLogRequest({
      regionId: config.regionId,
      containerGroupId: req.params['groupId'],
      containerName: req.params['name'],
      tail: 20,
    }));

    const progress: Record<string, string | number | undefined> = {};

    const lines = (log.body.content?.split('\n') ?? []);

    for (const line of lines) {
      const match = line.match(/^(\S+)=(\S+)/);
      if (!match || !match[2]) continue;
      switch (match?.[1]) {
        case 'frame':
          progress['frame'] = parseInt(match[2]);
          break;
        case 'fps':
          progress['fps'] = parseFloat(match[2]);
          break;
        case 'bitrate':
          progress['bitrate'] = match[2];
          break;
        case 'total_size':
          progress['totalSize'] = parseInt(match[2]);
          break;
        case 'out_time_ms':
          progress['outTimeMs'] = parseInt(match[2]);
          break;
        case 'out_time':
          progress['outTime'] = match[2].slice(0, -3);
          break;
        case 'speed':
          progress['speed'] = parseFloat(match[2]);
          break;
      }
    }

    res.json(progress);
  }));

  return router;
}
