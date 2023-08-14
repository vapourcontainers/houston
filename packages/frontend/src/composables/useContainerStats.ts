import { computed, reactive, ref, type Ref } from 'vue';
import dayjs, { type Dayjs } from 'dayjs';
import type { ITaskContainer } from '@/stores/task';
import useInterval from './useInterval';

export default function useContainerStats(container: Ref<ITaskContainer>) {
  function timeOfEvent(reason: string): Dayjs | undefined {
    const event = container.value.events?.find((event) => event.reason == reason);
    if (!event) {
      return undefined;
    }

    return dayjs(event.firstTimestamp);
  }

  const startTime = computed(() => timeOfEvent('Pulling'));

  const endTime = computed(() => {
    if (container.value.succeededTime) {
      return dayjs(container.value.succeededTime);
    } else if (container.value.failedTime) {
      return dayjs(container.value.failedTime);
    } else {
      return undefined;
    }
  });

  const currentTime = ref(dayjs());
  useInterval(() => currentTime.value = dayjs(), 1000);

  return reactive({
    startTime,
    endTime,
    currentTime,
  });
}
