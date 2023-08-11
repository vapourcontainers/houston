import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import http from 'ky';

import type { DescribeContainerGroupsResponseBodyContainerGroups } from '@alicloud/eci20180808';
import type { GetPayAsYouGoPriceResponseBodyDataModuleDetailsModuleDetail } from '@alicloud/bssopenapi20171214';

export const useTaskStore = defineStore('task', () => {
  const taskIds = ref<string[]>();
  const taskData = ref<Record<string, ITask>>();
  const priceOfTypes = ref<Record<string, GetPayAsYouGoPriceResponseBodyDataModuleDetailsModuleDetail>>({});

  const tasks = computed(() => {
    return taskIds.value?.map((id) => taskData.value![id]);
  });

  async function fetchTasks() {
    const containers: DescribeContainerGroupsResponseBodyContainerGroups[] =
      await http.get(`${import.meta.env.VITE_SERVER_URL}/tasks`).json();

    if (!containers) {
      taskIds.value = undefined;
      taskData.value = undefined;
      return;
    }

    taskIds.value = containers.map((container: ITaskContainer) => container.containerGroupId!);
    taskData.value = containers.reduce((acc: Record<string, ITask>, container: ITaskContainer) => {
      acc[container.containerGroupId!] = {
        id: container.containerGroupId!,
        container,
        info: null!,
        progress: null!,
      };
      return acc;
    }, {});

    for (const container of containers) {
      const type = container.instanceType!;
      if (typeof priceOfTypes.value[type] == 'undefined') {
        const cost: GetPayAsYouGoPriceResponseBodyDataModuleDetailsModuleDetail =
          await http.get(`${import.meta.env.VITE_SERVER_URL}/tasks/cost`, {
            searchParams: {
              type: type,
            },
          }).json();

        priceOfTypes.value = { ...priceOfTypes.value, [type]: cost };
      }
    }
  }

  async function fetchTaskInfo(id: string, name: string) {
    const info: ITaskInfo = await http.get(`${import.meta.env.VITE_SERVER_URL}/tasks/${id}/${name}/info`).json();
    taskData.value = { ...taskData.value, [id]: { ...taskData.value![id], info } };
  }

  async function fetchTaskProgress(id: string, name: string) {
    const progress: ITaskProgress = await http.get(`${import.meta.env.VITE_SERVER_URL}/tasks/${id}/${name}/progress`).json();
    taskData.value = { ...taskData.value, [id]: { ...taskData.value![id], progress } };
  }

  return {
    tasks,
    priceOfTypes,
    fetchTasks,
    fetchTaskInfo,
    fetchTaskProgress,
  };
});

export interface ITask {
  id: string;
  container: ITaskContainer;
  info?: ITaskInfo;
  progress?: ITaskProgress;
}

export type ITaskContainer = DescribeContainerGroupsResponseBodyContainerGroups;

export interface ITaskInfo {
  width: number;
  height: number;
  frames: number;
  fps: string;
  formatName: string;
  colorFamily: string;
  bits: number;
}

export interface ITaskProgress {
  frame: number;
  fps: number;
  bitrate: number;
  totalSize: number;
  outTimeMs: number;
  outTime: string;
  speed: number;
}
