import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import ky from 'ky';

import {
  type ITaskItem,
  type ITaskAliyunRunner,
  ITaskRunnerStatus,
  type ITaskState,
} from '@vapourcontainers-houston/types';

import { useImmer } from '@/composables/useImmer';

import { usePriceStore } from './price';

export const useTaskStore = defineStore('task', () => {
  const taskIds = ref<string[]>();
  const [taskItems, updateTaskItems] = useImmer<Record<string, ITaskItem<ITaskAliyunRunner>>>({});

  const tasks = computed(() => taskIds.value?.map((id) => taskItems.value[id]));
  const runningTasks = computed(() => tasks.value?.filter((task) => task.runner.status == ITaskRunnerStatus.RUNNING));

  const priceStore = usePriceStore();

  const http = ky.extend({
    prefixUrl: import.meta.env.VITE_SERVER_URL,
  });

  async function fetchTasks() {
    const tasks = await http.get('tasks').json<ITaskItem<ITaskAliyunRunner>[]>();

    if (!tasks) {
      taskIds.value = undefined;
      return;
    }

    taskIds.value = tasks.map((task) => task.id);

    updateTaskItems((items) => {
      for (const task of tasks) {
        items[task.id] = Object.assign(items[task.id] || {}, task);
      }
    });

    const types = new Set<string>();
    for (const task of tasks) {
      types.add(task.runner.properties.instanceType);
    }
    for (const type of types) {
      if (typeof priceStore.runners[type] == 'undefined') {
        priceStore.fetchRunner(type);
      }
    }
  }

  async function fetchTaskState(id: string) {
    const state = await http.get(`tasks/${encodeURIComponent(id)}/state`).json<ITaskState>();
    updateTaskItems((items) => {
      items[id].state = state;
    });
  }

  return {
    tasks,
    runningTasks,
    fetchTasks,
    fetchTaskState,
  };
});
