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
    </a-row>

    <a-progress status="active" :percent="Math.round(percent * 100)" :size="20" :style="{ marginTop: '16px' }" />
  </a-skeleton>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useTaskStore, type ITask } from '@/stores/task';
import useSize from '@/composables/useSize';
import useInterval from '@/composables/useInterval';

const props = defineProps<{
  task: ITask;
}>();

const taskStore = useTaskStore();

const info = computed(() => props.task.info);
const progress = computed(() => props.task.progress);

const size = useSize(() => props.task.progress?.totalSize);

const percent = computed(() => {
  if (!info.value || !progress.value) {
    return 0;
  }

  return progress.value.frame! / info.value.frames!;
});

async function updateProgress() {
  taskStore.fetchTaskProgress(
    props.task.container.containerGroupId!,
    props.task.container.containerGroupName!);
}

useInterval(updateProgress, 1000);
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
