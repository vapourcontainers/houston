import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common';
import { WebSocket } from 'ws';
import { once } from 'events';

import {
  DescribeContainerGroupsRequest,
  DescribeContainerGroupsResponseBodyContainerGroups,
  ExecContainerCommandRequest,
} from '@alicloud/eci20180808';

import { AliyunService } from './aliyun.service';
import toISOTime from './util/toISOTime';

import {
  ITaskRunnerStatus,
  ITaskStage,
  type IProject,
  type ITaskAliyunRunner,
  type ITaskFileProgress,
  type ITaskFormat,
  type ITaskItem,
  type ITaskProgress,
} from '@vapourcontainers-houston/types';

interface ITaskState {
  socket: WebSocket | undefined;
  stage: ITaskStage;
  project: IProject | undefined;
  downloadProgress: ITaskFileProgress | undefined;
  uploadProgress: ITaskFileProgress | undefined;
  format: ITaskFormat | undefined;
  progress: ITaskProgress | undefined;
}

@Controller('tasks')
export class TaskController {
  private states: Record<string, ITaskState> = {};

  constructor(private readonly aliyun: AliyunService) {
  }

  @Get()
  async getTasks(): Promise<ITaskItem<ITaskAliyunRunner>[]> {
    const containers = await this.aliyun.eci.describeContainerGroups(new DescribeContainerGroupsRequest({
      regionId: this.aliyun.config.regionId,
    }));
    if (!containers.body.containerGroups) throw new HttpException({}, HttpStatus.NOT_FOUND);

    return containers.body.containerGroups.map((container): ITaskItem<ITaskAliyunRunner> => {
      const id = makeTaskId('aliyun', container);
      const runner = mapAliyunRunner(container);

      if (runner.status == ITaskRunnerStatus.RUNNING) {
        this.getState(id); // no await by design
      } else {
        delete this.states[id];
      }

      return {
        id: id,
        name: container.containerGroupId!,
        runner: runner,
        stage: this.states[id]?.stage ?? ITaskStage.IDLE,
        project: this.states[id]?.project,
        downloadProgress: this.states[id]?.downloadProgress,
        uploadProgress: this.states[id]?.uploadProgress,
        format: this.states[id]?.format,
        progress: this.states[id]?.progress,
      };
    });
  }

  private async getState(id: string): Promise<ITaskState | undefined> {
    const match = id.match(/^aliyun:([^:]+):([^:]+)$/);
    if (!match) return undefined;

    if (typeof this.states[id] != 'undefined') {
      return this.states[id];
    }

    const state: ITaskState = this.states[id] = {
      socket: undefined,
      stage: ITaskStage.IDLE,
      project: undefined,
      downloadProgress: undefined,
      uploadProgress: undefined,
      format: undefined,
      progress: undefined,
    };

    let socketUri: string | undefined;
    try {
      const output = await this.aliyun.eci.execContainerCommand(new ExecContainerCommandRequest({
        regionId: this.aliyun.config.regionId,
        containerGroupId: match[1],
        containerName: match[2],
        command: '/monitor.sh',
      }));

      if (!output.body.webSocketUri) {
        delete this.states[id];
        return undefined;
      }

      socketUri = output.body.webSocketUri;
    } catch (e) {
      delete this.states[id];
      return undefined;
    }

    const ws = new WebSocket(socketUri);

    ws.once('open', () => {
    });

    ws.once('close', () => {
      delete this.states[id];
    });

    ws.once('error', (_err) => {
      delete this.states[id];
    });

    ws.on('message', (data) => {
      const message = data.slice(1).toString().trim();
      if (!message) return;

      const event = parseEvent(message);
      switch (event?.name) {
        case 'stage':
          state.stage = event.data as ITaskStage;
          break;
        case 'project':
          state.project = event.data as IProject;
          break;
        case 'download-progress':
          state.downloadProgress = event.data as ITaskFileProgress;
          break;
        case 'upload-progress':
          state.uploadProgress = event.data as ITaskFileProgress;
          break;
        case 'format':
          state.format = event.data as ITaskFormat;
          break;
        case 'progress':
          state.progress = event.data as ITaskProgress;
          break;
      }
    });

    await once(ws, 'open');

    state.socket = ws;
    return this.states[id];
  }

  @Get(':id/format')
  async getTaskFormat(@Param('id') id: string): Promise<ITaskFormat | undefined> {
    const state = await this.getState(id);
    if (!state) throw new HttpException({}, HttpStatus.NOT_FOUND);
    return state.format;
  }

  @Get(':id/progress')
  async getTaskProgress(@Param('id') id: string): Promise<ITaskProgress | undefined> {
    const state = await this.getState(id);
    if (!state) throw new HttpException({}, HttpStatus.NOT_FOUND);
    return state.progress;
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

interface IEvent<T = unknown> {
  name: string;
  data: T | undefined;
}

function parseEvent(message: string): IEvent | undefined {
  try {
    const { name, data } = JSON.parse(message);
    return { name, data };
  } catch (e) {
    return undefined;
  }
}
