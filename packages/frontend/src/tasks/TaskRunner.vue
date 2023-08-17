<template>
  <a-descriptions title="容器" :column="{ xs: 1, sm: 1, md: 2, lg: 4 }" :style="{ marginBottom: '-16px' }">
    <a-descriptions-item label="地域">{{ runner.properties.regionId }}</a-descriptions-item>
    <a-descriptions-item label="规格">{{ runner.properties.instanceType }}</a-descriptions-item>
    <a-descriptions-item label="CPU">{{ runner.properties.cpu }}</a-descriptions-item>
    <a-descriptions-item label="内存">{{ runner.properties.memory }} GB</a-descriptions-item>
    <a-descriptions-item label="开始时间">{{ stats.startTime?.format('YYYY-MM-DD HH:mm:ss') || '----' }}</a-descriptions-item>
    <a-descriptions-item label="停止时间">{{ stats.endTime?.format('YYYY-MM-DD HH:mm:ss') || '----' }}</a-descriptions-item>
    <a-descriptions-item label="费用">￥{{ cost?.toFixed(2) || '----' }}</a-descriptions-item>
  </a-descriptions>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { usePriceStore } from '@/stores/price';

import type {
  ITaskAliyunRunner,
  ITaskItem,
} from '@vapourcontainers-houston/typing';

import useRunnerStats from '@/composables/useRunnerStats';

const props = defineProps<{
  task: ITaskItem<ITaskAliyunRunner>;
}>();

const priceStore = usePriceStore();

const runner = computed(() => props.task.runner);

const stats = useRunnerStats(runner);

const price = computed(() => {
  if (!runner.value) {
    return undefined;
  }

  return priceStore.runners[runner.value.properties.instanceType]?.price;
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
