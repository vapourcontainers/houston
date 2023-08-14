import { stringify } from 'querystring';

import { Controller, Get, Param, Query } from '@nestjs/common';

import { DescribeContainerGroupsRequest, DescribeContainerLogRequest, ExecContainerCommandRequest } from '@alicloud/eci20180808';
import { GetPayAsYouGoPriceRequest } from '@alicloud/bssopenapi20171214';

import { AliyunService } from './aliyun.service';

@Controller('tasks')
export class TaskController {
  constructor(private readonly aliyun: AliyunService) {
  }

  @Get()
  async getContainers() {
    const containers = await this.aliyun.eci.describeContainerGroups(new DescribeContainerGroupsRequest({
      regionId: this.aliyun.config.regionId,
    }));

    return containers.body.containerGroups;
  }

  @Get(':groupId/:name/info')
  async getTaskInfo(@Param('groupId') groupId: string, @Param('name') name: string) {
    const output = await this.aliyun.eci.execContainerCommand(new ExecContainerCommandRequest({
      regionId: this.aliyun.config.regionId,
      containerGroupId: groupId,
      containerName: name,
      command: '/home/info.sh',
      sync: true,
    }));

    const info = output.body.syncResponse || '';

    const width = parseInt(info.match(/^Width: (\d+)/m)?.[1] || '');
    const height = parseInt(info.match(/^Height: (\d+)/m)?.[1] || '');
    const frames = parseInt(info.match(/^Frames: (\d+)/m)?.[1] || '');
    const fps = info.match(/^FPS: (\d+\/\d+)/m)?.[1];
    const formatName = info.match(/^Format Name: (\S+)/m)?.[1];
    const colorFamily = info.match(/^Color Family: (\S+)/m)?.[1];
    const bits = parseInt(info.match(/^Bits: (\d+)/m)?.[1] || '');

    return {
      width,
      height,
      frames,
      fps,
      formatName,
      colorFamily,
      bits,
    };
  }

  @Get(':groupId/:name/progress')
  async getTaskProgress(@Param('groupId') groupId: string, @Param('name') name: string) {
    const log = await this.aliyun.eci.describeContainerLog(new DescribeContainerLogRequest({
      regionId: this.aliyun.config.regionId,
      containerGroupId: groupId,
      containerName: name,
      tail: 20,
    }));

    const progress: Record<string, string | number | undefined> = {};

    const lines = (log.body.content?.split('\n') ?? []);

    for (const line of lines) {
      const frame = line.match(/^frame=\s*(\d+)/);
      if (frame?.[1]) {
        progress['frame'] = parseInt(frame[1]);
        continue;
      }

      const match = line.match(/^(\S+)=(\S+)/);
      if (!match?.[2]) continue;
      switch (match[1]) {
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

    return progress;
  }

  @Get('cost')
  async getCost(@Query('type') type: string) {
    const objects = await this.aliyun.bss.getPayAsYouGoPrice(new GetPayAsYouGoPriceRequest({
      productCode: 'ecs',
      subscriptionType: 'PayAsYouGo',
      region: this.aliyun.config.regionId,
      moduleList: [
        {
          moduleCode: 'InstanceType',
          priceType: 'Hour',
          config: stringify(<Record<string, string>>{
            'InstanceType': type,
            'Region': this.aliyun.config.regionId,
          }, ',', ':'),
        },
      ],
    }));

    return objects.body.data?.moduleDetails?.moduleDetail?.[0];
  }
}
