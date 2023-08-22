import { Inject, Injectable } from '@nestjs/common';

import { DescribeContainerGroupsRequest } from '@alicloud/eci20180808';

import { CONFIG, type IConfig } from '../aliyun/config.service';
import { ECIService } from '../aliyun/eci.service';
import { RunnerManager } from './runner.service';
import { makeTaskId, mapAliyunRunner } from './aliyun';

import {
  ITaskStage,
  type IProject,
  type ITaskFileProgress,
  type ITaskFormat,
  type ITaskProgress,
  type ITaskItem,
  type ITaskAliyunRunner,
  ITaskRunnerStatus,
  type ITaskState,
} from '@vapourcontainers-houston/types';

@Injectable()
export class TaskService {
  private states: Record<string, ITaskState> = {};

  constructor(
    @Inject(CONFIG) private readonly config: IConfig,
    @Inject(ECIService) private readonly eci: ECIService,
    @Inject(RunnerManager) private readonly rm: RunnerManager,
  ) {
    rm.on('event', this.handleEvent.bind(this));
    rm.on('close', (id: string) => {
      delete this.states[id];
    });
  }

  private handleEvent(id: string, name: string, data: unknown | undefined) {
    const state = this.states[id] ?? {
      stage: ITaskStage.IDLE,
      project: undefined,
      downloadProgress: undefined,
      uploadProgress: undefined,
      format: undefined,
      progress: undefined,
    };

    switch (name) {
      case 'stage':
        state.stage = data as ITaskStage;
        break;
      case 'project':
        state.project = data as IProject;
        break;
      case 'download-progress':
        state.downloadProgress = data as ITaskFileProgress;
        break;
      case 'upload-progress':
        state.uploadProgress = data as ITaskFileProgress;
        break;
      case 'format':
        state.format = data as ITaskFormat;
        break;
      case 'progress':
        state.progress = data as ITaskProgress;
        break;
    }

    this.states[id] = state;
  }

  async getTasks(): Promise<ITaskItem<ITaskAliyunRunner>[] | undefined> {
    const containers = await this.eci.describeContainerGroups(new DescribeContainerGroupsRequest({
      regionId: this.config.regionId,
    }));
    if (!containers.body.containerGroups) return;

    return containers.body.containerGroups.map((container): ITaskItem<ITaskAliyunRunner> => {
      const id = makeTaskId('aliyun', container);
      const runner = mapAliyunRunner(container);

      if (runner.status == ITaskRunnerStatus.RUNNING) {
        this.rm.retrieve(id); // no await by design
      } else {
        delete this.states[id];
      }

      return {
        id: id,
        name: container.containerGroupId!,
        runner: runner,
        state: this.states[id],
      };
    });
  }

  async getTaskState(id: string): Promise<ITaskState | undefined> {
    return this.states[id];
  }
}
