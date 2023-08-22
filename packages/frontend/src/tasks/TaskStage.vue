<template>
  <a-steps size="small" :items="items" :current="steps.current" :percent="steps.percent" :status="steps.status"
    :class="$style.steps" />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { StepProps } from 'ant-design-vue';
import type { Status } from 'ant-design-vue/es/vc-steps/interface';

import {
  ITaskRunnerStatus,
  ITaskStage,
  type ITaskAliyunRunner,
  type ITaskItem,
} from '@vapourcontainers-houston/types';

const props = defineProps<{
  task: ITaskItem<ITaskAliyunRunner>;
}>();

const items: StepProps[] = [
  { title: '准备' },
  { title: '下载' },
  { title: '编码' },
  { title: '上传' },
  { title: '完成' },
];

const steps = computed((): {
  current: number;
  percent: number | undefined;
  status: Status;
} => {
  switch (props.task.runner.status) {
    case ITaskRunnerStatus.PREPARING:
      return { current: 0, percent: undefined, status: 'process' };
    case ITaskRunnerStatus.FAILED:
      return { current: 4, percent: undefined, status: 'error' };
    case ITaskRunnerStatus.FINISHED:
      return { current: 4, percent: undefined, status: 'finish' };
    case ITaskRunnerStatus.RUNNING:
      switch (props.task.state?.stage) {
        case ITaskStage.IDLE:
          return { current: 0, percent: undefined, status: 'process' };
        case ITaskStage.DOWNLOAD:
          return { current: 1, percent: downloadProgress.value, status: 'process' };
        case ITaskStage.ENCODE:
          return { current: 2, percent: encodeProgress.value, status: 'process' };
        case ITaskStage.UPLOAD:
          return { current: 3, percent: uploadProgress.value, status: 'process' };
      }
  }

  return { current: 0, percent: undefined, status: 'wait' };
});

const downloadProgress = computed(() => {
  const { project, downloadProgress } = props.task.state ?? {};
  if (!project || !downloadProgress) {
    return undefined;
  }

  const base = downloadProgress.fileIndex / project.footages.length;
  const current = downloadProgress.currentBytes / downloadProgress.totalBytes;

  return (base + current / project.footages.length) * 100;
});

const encodeProgress = computed(() => {
  const { format, progress } = props.task.state ?? {};
  if (!format || !progress) {
    return undefined;
  }

  return progress.processedFrames / format.frames * 100;
});

const uploadProgress = computed(() => {
  const { uploadProgress } = props.task.state ?? {};
  if (!uploadProgress) {
    return undefined;
  }

  return uploadProgress.currentBytes / uploadProgress.totalBytes * 100;
});
</script>

<style lang="scss" module>
.steps {
  padding: 16px 0 32px;
}
</style>
