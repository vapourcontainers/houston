<template>
  <a-skeleton active :loading="!format" :title="false">
    <a-descriptions title="任务" :column="{ xs: 1, sm: 1, md: 2, lg: 4 }" :style="{ marginBottom: '-16px' }">
      <a-descriptions-item label="宽">{{ format?.width }}</a-descriptions-item>
      <a-descriptions-item label="高">{{ format?.height }}</a-descriptions-item>
      <a-descriptions-item label="帧数">{{ format?.frames }}</a-descriptions-item>
      <a-descriptions-item label="FPS">{{ format?.fps?.numerator }}/{{ format?.fps?.denominator }}</a-descriptions-item>
      <a-descriptions-item label="格式">{{ format?.formatName }}</a-descriptions-item>
      <a-descriptions-item label="色彩">{{ format?.colorFamily }}</a-descriptions-item>
      <a-descriptions-item label="色深">{{ format?.bitDepth }}</a-descriptions-item>
    </a-descriptions>
  </a-skeleton>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import type {
  ITaskAliyunRunner,
  ITaskItem,
} from '@vapourcontainers-houston/types';

const props = defineProps<{
  task: ITaskItem<ITaskAliyunRunner>;
}>();

const format = computed(() => props.task.state?.format);
</script>
