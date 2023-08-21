import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import ky from 'ky';

import {
  type ITaskItem,
  type ITaskAliyunRunner,
  type ITaskFormat,
  type ITaskProgress,
  ITaskRunnerStatus,
} from '@vapourcontainers-houston/types';

import { usePriceStore } from './price';

export const useTaskStore = defineStore('task', () => {
  const taskIds = ref<string[]>();
  const taskItems = ref<Record<string, ITaskItem<ITaskAliyunRunner>>>();

  const tasks = computed(() => taskIds.value?.map((id) => taskItems.value![id]));
  const runningTasks = computed(() => tasks.value?.filter((task) => task.runner.status == ITaskRunnerStatus.RUNNING));

  const priceStore = usePriceStore();

  const http = ky.extend({
    prefixUrl: import.meta.env.VITE_SERVER_URL,
  });

  async function fetchTasks() {
    const tasks = await http.get('tasks').json<ITaskItem<ITaskAliyunRunner>[]>();

    if (!tasks) {
      taskIds.value = undefined;
      taskItems.value = undefined;
      return;
    }

    taskIds.value = tasks.map((task) => task.id);
    taskItems.value = tasks.reduce((items, task) => {
      items[task.id] = {
        ...items[task.id],
        ...task,
      };
      return items;
    }, taskItems.value || {});

    for (const task of tasks) {
      const type = task.runner.properties.instanceType;
      if (typeof priceStore.runners[type] == 'undefined') {
        priceStore.fetchRunner(type);
      }
    }
  }

  async function fetchTaskFormat(id: string) {
    const format = await http.get(`tasks/${encodeURIComponent(id)}/format`).json<ITaskFormat>();
    taskItems.value = {
      ...taskItems.value,
      [id]: { ...taskItems.value![id], format },
    };
  }

  async function fetchTaskProgress(id: string) {
    const progress = await http.get(`tasks/${encodeURIComponent(id)}/progress`).json<ITaskProgress>();
    taskItems.value = {
      ...taskItems.value,
      [id]: { ...taskItems.value![id], progress },
    };
  }

  return {
    tasks,
    runningTasks,
    fetchTasks,
    fetchTaskFormat,
    fetchTaskProgress,
  };
});
