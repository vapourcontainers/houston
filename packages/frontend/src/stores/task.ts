import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { defineStore } from 'pinia';
import ky from 'ky';
import { io } from 'socket.io-client';

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
  const [taskItems, mutateTaskItems] = useImmer<Record<string, ITaskItem<ITaskAliyunRunner>>>({});

  const tasks = computed(() => taskIds.value?.map((id) => taskItems.value[id]));
  const runningTasks = computed(() => tasks.value?.filter((task) => task.runner.status == ITaskRunnerStatus.RUNNING));

  const priceStore = usePriceStore();

  const http = ky.extend({
    prefixUrl: `${import.meta.env.VITE_SERVER_URL}/tasks`,
  });

  const socket = io(`${import.meta.env.VITE_SERVER_URL}/tasks`, {
    transports: ['websocket'],
    autoConnect: false,
  });

  function connectIO() {
    onMounted(() => socket.connect());
    onBeforeUnmount(() => socket.disconnect());
  }

  async function fetchTasks() {
    updateTasks(await http.get('').json<ITaskItem<ITaskAliyunRunner>[]>());
  }

  function updateTasks(tasks: ITaskItem<ITaskAliyunRunner>[] | undefined) {
    if (!tasks) {
      taskIds.value = undefined;
      return;
    }

    taskIds.value = tasks.map((task) => task.id);

    mutateTaskItems((items) => {
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

  function updateTaskState(id: string, state: ITaskState) {
    mutateTaskItems((items) => {
      items[id].state = state;
    });
  }

  socket.on('tasks', updateTasks);
  socket.on('state', updateTaskState);

  return {
    tasks,
    runningTasks,
    connectIO,
    fetchTasks,
  };
});
