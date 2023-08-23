import { Inject, Injectable } from '@nestjs/common';

import { DescribeContainerGroupsRequest } from '@alicloud/eci20180808';

import { CONFIG, type IConfig } from '../aliyun/config.service';
import { ECIService } from '../aliyun/eci.service';
import { makeTaskId, mapAliyunRunner } from './aliyun';

import {
  type ITaskItem,
  type ITaskAliyunRunner,
} from '@vapourcontainers-houston/types';

@Injectable()
export class TaskService {
  constructor(
    @Inject(CONFIG) private readonly config: IConfig,
    @Inject(ECIService) private readonly eci: ECIService,
  ) {
  }

  async getTasks(): Promise<ITaskItem<ITaskAliyunRunner>[] | undefined> {
    const containers = await this.eci.describeContainerGroups(new DescribeContainerGroupsRequest({
      regionId: this.config.regionId,
    }));
    if (!containers.body.containerGroups) return;

    return containers.body.containerGroups.map((container): ITaskItem<ITaskAliyunRunner> => {
      const id = makeTaskId('aliyun', container);
      const runner = mapAliyunRunner(container);

      return {
        id: id,
        name: container.containerGroupId!,
        runner: runner,
        state: undefined,
      };
    });
  }
}
