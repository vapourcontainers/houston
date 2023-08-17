<template>
  <a-tag :color="status.color">{{ status.text }}</a-tag>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import {
  ITaskRunnerStatus,
} from '@vapourcontainers-houston/typing';

const props = defineProps<{
  status: ITaskRunnerStatus;
}>();

const status = computed(() => {
  switch (props.status) {
    case ITaskRunnerStatus.PREPARING:
      return { color: 'blue', text: '启动中' };
    case ITaskRunnerStatus.RUNNING:
      return { color: 'green', text: '运行中' };
    case ITaskRunnerStatus.FINISHED:
      return { color: undefined, text: '完成' };
    case ITaskRunnerStatus.FAILED:
      return { color: 'red', text: '失败' };
    case ITaskRunnerStatus.FINISHING:
      return { color: 'orange', text: '终止中' };
    default:
      return undefined;
  }
});
</script>
