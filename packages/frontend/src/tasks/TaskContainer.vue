<template>
  <a-descriptions title="容器" :column="{ xs: 1, sm: 1, md: 2, lg: 4 }" :style="{ marginBottom: '-16px' }">
    <a-descriptions-item label="地域">{{ container.regionId }}</a-descriptions-item>
    <a-descriptions-item label="规格">{{ container.instanceType }}</a-descriptions-item>
    <a-descriptions-item label="CPU">{{ container.cpu }}</a-descriptions-item>
    <a-descriptions-item label="内存">{{ container.memory }} GB</a-descriptions-item>
    <a-descriptions-item label="开始时间">{{ startTime?.format('YYYY-MM-DD HH:mm:ss') }}</a-descriptions-item>
    <a-descriptions-item label="停止时间">{{ endTime?.format('YYYY-MM-DD HH:mm:ss') || '----' }}</a-descriptions-item>
    <a-descriptions-item label="费用">￥{{ cost?.toFixed(2) }}</a-descriptions-item>
  </a-descriptions>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import dayjs, { type Dayjs } from 'dayjs';
import { useTaskStore, type ITask } from '@/stores/task';
import useInterval from '@/composables/useInterval';

const props = defineProps<{
  task: ITask;
}>();

const taskStore = useTaskStore();

const container = computed(() => props.task.container);

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

const cost = computed(() => {
  if (typeof container.value?.instanceType == 'undefined') {
    return undefined;
  }

  const price = taskStore.priceOfTypes?.[container.value.instanceType]?.costAfterDiscount;
  if (typeof price == 'undefined') {
    return undefined;
  }

  const start = startTime.value;
  if (typeof start == 'undefined') {
    return undefined;
  }

  const end = endTime.value || currentTime.value;

  const duration = end.diff(start, 'hour', true);

  return price * duration;
});
</script>
