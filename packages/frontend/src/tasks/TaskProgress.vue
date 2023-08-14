<template>
  <a-skeleton active :loading="!progress" :title="false">
    <a-row :gutter="[16, 16]" :class="$style.progress">
      <a-col :xs="24" :sm="12" :md="8" :xl="4">
        <a-statistic title="帧" :value="progress?.frame" group-separator="" :suffix="info ? `/ ${info.frames}` : ''" />
      </a-col>
      <a-col :xs="24" :sm="12" :md="8" :xl="4">
        <a-statistic title="帧率" :value="progress?.fps" :precision="2" suffix="fps" />
      </a-col>
      <a-col :xs="24" :sm="12" :md="8" :xl="4">
        <a-statistic title="大小" :value="size?.value" :precision="2" :suffix="size?.unit" />
      </a-col>
      <a-col :xs="24" :sm="12" :md="8" :xl="4">
        <a-statistic title="时间码" :value="progress?.outTime" />
      </a-col>
      <a-col :xs="24" :sm="12" :md="8" :xl="4">
        <a-statistic title="码率" :value="progress?.bitrate" />
      </a-col>
      <a-col :xs="24" :sm="12" :md="8" :xl="4">
        <a-statistic title="速度" :value="progress?.speed" :precision="4" suffix="×" />
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

    <a-progress status="active" :percent="Math.round(percent * 100)" :size="20" :style="{ marginTop: '16px' }" />
  </a-skeleton>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useTaskStore, type ITask } from '@/stores/task';
import useSize from '@/composables/useSize';
import useInterval from '@/composables/useInterval';
import useContainerStats from '@/composables/useContainerStats';
import dayjs from 'dayjs';

const props = defineProps<{
  task: ITask;
}>();

const taskStore = useTaskStore();

const info = computed(() => props.task.info);
const progress = computed(() => props.task.progress);
const container = computed(() => props.task.container);

const size = useSize(() => props.task.progress?.totalSize);
const stats = useContainerStats(container);

const percent = computed(() => {
  if (!info.value || !progress.value) {
    return 0;
  }

  return progress.value.frame! / info.value.frames!;
});

const price = computed(() => {
  if (typeof container.value?.instanceType == 'undefined') {
    return undefined;
  }

  return taskStore.priceOfTypes?.[container.value.instanceType]?.costAfterDiscount;
});

const elapsedTime = computed(() => {
  if (!stats.startTime) {
    return undefined;
  }

  return dayjs.duration(stats.currentTime.diff(stats.startTime));
});

const estimatedTime = computed(() => {
  if (!progress.value?.frame || !progress.value?.fps || !info.value?.frames) {
    return undefined;
  }

  const remainingFrames = info.value.frames - progress.value.frame;
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

function formatDuration(duration: plugin.Duration | undefined) {
  if (!duration) return undefined;

  const hours = Math.floor(duration.as('hours'));
  const minutes = Math.floor(duration.as('minutes')) % 60;
  const seconds = Math.floor(duration.as('seconds')) % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

useInterval(() => taskStore.fetchTaskProgress(
  props.task.container.containerGroupId!,
  props.task.container.containerGroupName!), 1000);
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
