<template>
  <a-descriptions title="容器" :column="{ xs: 1, sm: 1, md: 2, lg: 4 }" :style="{ marginBottom: '-16px' }">
    <a-descriptions-item label="地域">{{ container.regionId }}</a-descriptions-item>
    <a-descriptions-item label="规格">{{ container.instanceType }}</a-descriptions-item>
    <a-descriptions-item label="CPU">{{ container.cpu }}</a-descriptions-item>
    <a-descriptions-item label="内存">{{ container.memory }} GB</a-descriptions-item>
    <a-descriptions-item label="开始时间">{{ stats.startTime?.format('YYYY-MM-DD HH:mm:ss') }}</a-descriptions-item>
    <a-descriptions-item label="停止时间">{{ stats.endTime?.format('YYYY-MM-DD HH:mm:ss') || '----'
    }}</a-descriptions-item>
    <a-descriptions-item label="费用">￥{{ cost?.toFixed(2) || '----' }}</a-descriptions-item>
  </a-descriptions>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useTaskStore, type ITask } from '@/stores/task';
import useContainerStats from '@/composables/useContainerStats';
import dayjs from 'dayjs';

const props = defineProps<{
  task: ITask;
}>();

const taskStore = useTaskStore();

const container = computed(() => props.task.container);

const stats = useContainerStats(container);

const price = computed(() => {
  if (typeof container.value?.instanceType == 'undefined') {
    return undefined;
  }

  return taskStore.priceOfTypes?.[container.value.instanceType]?.costAfterDiscount;
});

const cost = computed(() => {
  if (!price.value) {
    return undefined
  };

  if (!stats.startTime || !stats.endTime) {
    return undefined;
  }

  const duration = stats.endTime.diff(stats.startTime, 'hour', true);

  return price.value * duration;
});
</script>
