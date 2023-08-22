import type { DescribeContainerGroupsResponseBodyContainerGroups } from '@alicloud/eci20180808';

import {
  ITaskRunnerStatus,
  type ITaskAliyunRunner,
} from '@vapourcontainers-houston/types';

import toISOTime from '../util/toISOTime';

export type IAliyunContainer = DescribeContainerGroupsResponseBodyContainerGroups;

export function timeOfEvent(container: IAliyunContainer, reason: string): string | undefined {
  return container.events?.find((event) => event.reason == reason)?.firstTimestamp;
}

export function mapAliyunRunner(container: IAliyunContainer): ITaskAliyunRunner {
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

export function makeTaskId(provider: string, container: IAliyunContainer) {
  return `${provider}:${container.containerGroupId}:${container.containerGroupName}`;
}
