import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common';

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
  type ITaskItem,
  type ITaskProgress,
} from '@vapourcontainers-houston/types';

@Controller('tasks')
export class TaskController {
  constructor(private readonly aliyun: AliyunService) {
  }

  @Get()
  async getTasks(): Promise<ITaskItem<ITaskAliyunRunner>[]> {
    const containers = await this.aliyun.eci.describeContainerGroups(new DescribeContainerGroupsRequest({
      regionId: this.aliyun.config.regionId,
    }));
    if (!containers.body.containerGroups) throw new HttpException({}, HttpStatus.NOT_FOUND);

    return containers.body.containerGroups.map((container): ITaskItem<ITaskAliyunRunner> => ({
      id: makeTaskId('aliyun', container),
      name: container.containerGroupId!,
      runner: mapAliyunRunner(container),
      format: undefined,
      progress: undefined,
    }));
  }

  @Get(':id/format')
  async getTaskFormat(@Param('id') id: string): Promise<ITaskFormat | undefined> {
    const match = id.match(/^aliyun:([^:]+):([^:]+)$/);
    if (!match) throw new HttpException({}, HttpStatus.NOT_FOUND);

    const output = await this.aliyun.eci.execContainerCommand(new ExecContainerCommandRequest({
      regionId: this.aliyun.config.regionId,
      containerGroupId: match[1],
      containerName: match[2],
      command: '/home/info.sh',
      sync: true,
    }));
    if (!output.body.syncResponse) throw new HttpException({}, HttpStatus.NOT_FOUND);

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
    if (!match) throw new HttpException({}, HttpStatus.NOT_FOUND);

    const log = await this.aliyun.eci.describeContainerLog(new DescribeContainerLogRequest({
      regionId: this.aliyun.config.regionId,
      containerGroupId: match[1],
      containerName: match[2],
      tail: 20,
    }));
    if (!log.body.content) throw new HttpException({}, HttpStatus.NOT_FOUND);

    const lines = log.body.content.split('\n').reverse().join('\n');

    return extractFields(lines, {
      processedFrames: { regex: /^frame=\s*(\d+)/m, transform: (m) => parseInt(m[1]!) },
      processedDurationMs: { regex: /^out_time_us=\s*(\d+)/m, transform: (m) => parseInt(m[1]!) / 1000 },
      fps: { regex: /^fps=\s*(\d+)/m, transform: (m) => parseFloat(m[1]!) },
      currentBitrate: { regex: /^bitrate=\s*(\S+)kbits\/s/m, transform: (m) => parseFloat(m[1]!) * 1024 },
      outputBytes: { regex: /^total_size=\s*(\d+)/m, transform: (m) => parseInt(m[1]!) },
      speed: { regex: /^speed=\s*(\S+)x/m, transform: (m) => parseFloat(m[1]!) },
    });
  }
}

type IAliyunContainer = DescribeContainerGroupsResponseBodyContainerGroups;

function timeOfEvent(container: IAliyunContainer, reason: string): string | undefined {
  return container.events?.find((event) => event.reason == reason)?.firstTimestamp;
}

function mapAliyunRunner(container: IAliyunContainer): ITaskAliyunRunner {
  return {
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
  };
}

function makeTaskId(provider: string, container: IAliyunContainer) {
  return `${provider}:${container.containerGroupId}:${container.containerGroupName}`;
}
