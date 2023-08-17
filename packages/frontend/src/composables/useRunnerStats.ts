import { computed, reactive, ref, type Ref } from 'vue';
import dayjs, { type Dayjs } from 'dayjs';

import type {
  ITaskRunner,
} from '@vapourcontainers-houston/typing';

import useInterval from './useInterval';

export default function useRunnerStats(runner: Ref<ITaskRunner<unknown>>) {
  const startTime = computed(() => parseTime(runner.value.startedAt));
  const endTime = computed(() => parseTime(runner.value.finishedAt));

  const currentTime = ref(dayjs());
  useInterval(() => currentTime.value = dayjs(), 1000);

  return reactive({
    startTime,
    endTime,
    currentTime,
  });
}

function parseTime(time: string | undefined): Dayjs | undefined {
  return time ? dayjs(time) : undefined;
}
