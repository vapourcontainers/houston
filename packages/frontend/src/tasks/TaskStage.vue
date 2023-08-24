<template>
  <a-steps :items="items" :current="steps.current" :percent="steps.percent" :status="steps.status" />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { StepProps } from 'ant-design-vue';
import type { Status } from 'ant-design-vue/es/vc-steps/interface';

import {
  ITaskStage,
  type ITaskAliyunRunner,
  type ITaskItem,
} from '@vapourcontainers-houston/types';

const props = defineProps<{
  task: ITaskItem<ITaskAliyunRunner>;
}>();

const items: StepProps[] = [
  { title: '下载' },
  { title: '编码' },
  { title: '上传' },
];

const steps = computed((): {
  current: number;
  percent: number | undefined;
  status: Status;
} => {
  switch (props.task.state?.stage) {
    case ITaskStage.DOWNLOAD:
      return { current: 0, percent: downloadProgress.value, status: 'process' };
    case ITaskStage.ENCODE:
      return { current: 1, percent: encodeProgress.value, status: 'process' };
    case ITaskStage.UPLOAD:
      return { current: 2, percent: uploadProgress.value, status: 'process' };
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
