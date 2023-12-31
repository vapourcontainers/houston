<template>
  <a-skeleton active :loading="!progress" :title="false">
    <a-row :gutter="[16, 16]" :class="$style.progress">
      <a-col :xs="24" :sm="12" :md="8" :xl="4">
        <a-statistic title="帧" :value="progress!.processedFrames" group-separator=""
          :suffix="format ? `/ ${format.frames}` : ''" />
      </a-col>
      <a-col :xs="24" :sm="12" :md="8" :xl="4">
        <a-statistic title="帧率" :value="progress!.fps" :precision="2" suffix="fps" />
      </a-col>
      <a-col :xs="24" :sm="12" :md="8" :xl="4">
        <a-statistic title="大小" :value="size?.value" :precision="2" :suffix="size?.unit" />
      </a-col>
      <a-col :xs="24" :sm="12" :md="8" :xl="4">
        <a-statistic title="时间码" :value="formatDuration(timecode, 3)" />
      </a-col>
      <a-col :xs="24" :sm="12" :md="8" :xl="4">
        <a-statistic title="码率" :value="progress!.currentBitrate / 1024" :precision="0" suffix="Kbps" />
      </a-col>
      <a-col :xs="24" :sm="12" :md="8" :xl="4">
        <a-statistic title="速度" :value="progress!.speed" :precision="4" suffix="×" />
      </a-col>
      <a-col :xs="24" :sm="12" :md="8" :xl="4">
        <a-statistic title="已用时间（预计）" :value="formatDuration(elapsedTime)" />
      </a-col>
      <a-col :xs="24" :sm="12" :md="8" :xl="4">
        <a-statistic title="总时间（预计）" :value="formatDuration(estimatedTime)" />
      </a-col>
      <a-col :xs="24" :sm="12" :md="8" :xl="4">
        <a-statistic title="已用费用（预计）" :value="usedBalance" :precision="2" prefix="￥" />
      </a-col>
      <a-col :xs="24" :sm="12" :md="8" :xl="4">
        <a-statistic title="总费用（预计）" :value="estimatedBalance" :precision="2" prefix="￥" />
      </a-col>
    </a-row>
  </a-skeleton>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import dayjs from 'dayjs';

import { useTaskStore } from '@/stores/task';
import { usePriceStore } from '@/stores/price';

import type {
  ITaskAliyunRunner,
  ITaskItem,
} from '@vapourcontainers-houston/types';

import useSize from '@/composables/useSize';
import useRunnerStats from '@/composables/useRunnerStats';

const props = defineProps<{
  task: ITaskItem<ITaskAliyunRunner>;
}>();

const taskStore = useTaskStore();
const priceStore = usePriceStore();

const format = computed(() => props.task.state?.format);
const progress = computed(() => props.task.state?.progress);
const runner = computed(() => props.task.runner);

const size = useSize(() => props.task.state?.progress?.outputBytes);
const stats = useRunnerStats(runner);

const timecode = computed(() => {
  if (!progress.value) {
    return undefined;
  }

  return dayjs.duration(progress.value.processedDurationMs);
});

const price = computed(() => {
  if (!runner.value) {
    return undefined;
  }

  return priceStore.runners[runner.value.properties.instanceType]?.price;
});

const elapsedTime = computed(() => {
  if (!stats.startTime) {
    return undefined;
  }

  return dayjs.duration(stats.currentTime.diff(stats.startTime));
});

const estimatedTime = computed(() => {
  if (!progress.value || !format.value) {
    return undefined;
  }

  const remainingFrames = format.value.frames - progress.value.processedFrames;
  const estimatedSeconds = remainingFrames / progress.value.fps;

  return elapsedTime.value?.add(estimatedSeconds, 'seconds');
});

const usedBalance = computed(() => {
  const duration = elapsedTime.value?.as('hours');
  return (price.value || 0) * (duration || 0);
});

const estimatedBalance = computed(() => {
  const duration = estimatedTime.value?.as('hours');
  return (price.value || 0) * (duration || 0);
});

function formatDuration(duration: plugin.Duration | undefined, precision = 0) {
  if (!duration) return undefined;

  const hours = (Math.floor(duration.as('hours'))).toString().padStart(2, '0');
  const minutes = (Math.floor(duration.as('minutes')) % 60).toString().padStart(2, '0');
  const seconds = (duration.as('seconds') % 60).toFixed(precision).padStart(precision ? precision + 3 : 2, '0');

  return `${hours}:${minutes}:${seconds}`;
}
</script>

<style lang="scss" module>
.progress {
  :global(.ant-statistic-content) {
    font-family: monospace;
  }

  :global(.ant-statistic-content-suffix) {
    font-size: 75%;
  }
}
</style>
