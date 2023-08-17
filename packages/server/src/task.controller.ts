import { Controller, Get, Param } from '@nestjs/common';

import {
  DescribeContainerGroupsRequest,
  DescribeContainerGroupsResponseBodyContainerGroups,
  DescribeContainerLogRequest,
  ExecContainerCommandRequest,
} from '@alicloud/eci20180808';

import { AliyunService } from './aliyun.service';
import extractFields from './util/extractFields';
import toISOTime from './util/toISOTime';

import {
  ITaskRunnerStatus,
  type ITaskAliyunRunner,
  type ITaskFormat,
  type ITaskProgress,
} from '@vapourcontainers-houston/types';

@Controller('tasks')
export class TaskController {
  constructor(private readonly aliyun: AliyunService) {
  }

  @Get()
  async getRunners(): Promise<ITaskAliyunRunner[] | undefined> {
    const containers = await this.aliyun.eci.describeContainerGroups(new DescribeContainerGroupsRequest({
      regionId: this.aliyun.config.regionId,
    }));
    if (!containers.body.containerGroups) return;

    return containers.body.containerGroups.map((container): ITaskAliyunRunner => ({
      provider: 'aliyun',
      properties: {
        containerGroupId: container.containerGroupId!,
        containerGroupName: container.containerGroupName!,
        regionId: container.regionId!,
        instanceType: container.instanceType!,
        cpu: container.cpu!,
        memory: container.memory!,
      },
      createdAt: toISOTime(container.creationTime)!,
      startedAt: toISOTime(timeOfEvent(container, 'Pulling'))!,
      finishedAt: toISOTime(container.failedTime || container.succeededTime),
      status: ((status): ITaskRunnerStatus => {
        switch (status) {
          case 'Pending': return ITaskRunnerStatus.PREPARING;
          case 'Running': return ITaskRunnerStatus.RUNNING;
          case 'Succeeded': return ITaskRunnerStatus.FINISHED;
          case 'Failed': return ITaskRunnerStatus.FAILED;
          case 'Scheduling': return ITaskRunnerStatus.PREPARING;
          case 'ScheduleFailed': return ITaskRunnerStatus.FAILED;
          case 'Restarting': return ITaskRunnerStatus.PREPARING;
          case 'Updating': return ITaskRunnerStatus.PREPARING;
          case 'Terminating': return ITaskRunnerStatus.FINISHING;
          case 'Expired': return ITaskRunnerStatus.FAILED;
          default: return ITaskRunnerStatus.UNKNOWN;
        }
      })(container.status!),
    }));
  }

  @Get(':id/format')
  async getTaskFormat(@Param('id') id: string): Promise<ITaskFormat | undefined> {
    const match = id.match(/^aliyun:([^:]+):([^:]+)$/);
    if (!match) return;

    const output = await this.aliyun.eci.execContainerCommand(new ExecContainerCommandRequest({
      regionId: this.aliyun.config.regionId,
      containerGroupId: match[1],
      containerName: match[2],
      command: '/home/info.sh',
      sync: true,
    }));
    if (!output.body.syncResponse) return;

    return extractFields(output.body.syncResponse, {
      width: { regex: /^Width: (\d+)/m, transform: (m) => parseInt(m[1]!) },
      height: { regex: /^Height: (\d+)/m, transform: (m) => parseInt(m[1]!) },
      frames: { regex: /^Frames: (\d+)/m, transform: (m) => parseInt(m[1]!) },
      fps: {
        regex: /^FPS: (\d+)\/(\d+)/m,
        transform: (m) => ({
          numerator: parseInt(m[1]!),
          denominator: parseInt(m[2]!),
        }),
      },
      formatName: { regex: /^Format Name: (\S+)/m, transform: (m) => m[1]! },
      colorFamily: { regex: /^Color Family: (\S+)/m, transform: (m) => m[1]! },
      bitDepth: { regex: /^Bits: (\d+)/m, transform: (m) => parseInt(m[1]!) },
    });
  }

  @Get(':id/progress')
  async getTaskProgress(@Param('id') id: string): Promise<ITaskProgress | undefined> {
    const match = id.match(/^aliyun:([^:]+):([^:]+)$/);
    if (!match) return;

    const log = await this.aliyun.eci.describeContainerLog(new DescribeContainerLogRequest({
      regionId: this.aliyun.config.regionId,
      containerGroupId: match[1],
      containerName: match[2],
      tail: 20,
    }));
    if (!log.body.content) return;

    const lines = log.body.content.split('\n').reverse().join('\n');

    return extractFields(lines, {
      processedFrames: { regex: /^frame=\s*(\d+)/m, transform: (m) => parseInt(m[1]!) },
      processedDurationMs: { regex: /^out_time_ms=(\d+)/m, transform: (m) => parseInt(m[1]!) },
      fps: { regex: /^fps=(\d+)/m, transform: (m) => parseFloat(m[1]!) },
      currentBitrate: { regex: /^bitrate=(\S+)kbits\/s/m, transform: (m) => parseFloat(m[1]!) * 1024 },
      outputBytes: { regex: /^total_size=(\d+)/m, transform: (m) => parseInt(m[1]!) },
      speed: { regex: /^speed=(\S+)/m, transform: (m) => parseFloat(m[1]!) },
    });
  }
}

function timeOfEvent(container: DescribeContainerGroupsResponseBodyContainerGroups, reason: string): string | undefined {
  return container.events?.find((event) => event.reason == reason)?.firstTimestamp;
}
