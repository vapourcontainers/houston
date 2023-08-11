<template>
  <a-tag :color="status.color">{{ status.text }}</a-tag>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
  status: string;
}>();

const status = computed(() => {
  switch (props.status) {
    case 'Pending':
      return { color: 'blue', text: '启动中' };
    case 'Running':
      return { color: 'green', text: '运行中' };
    case 'Succeeded':
      return { color: undefined, text: '完成' };
    case 'Failed':
      return { color: 'red', text: '运行失败' };
    case 'Scheduling':
      return { color: 'blue', text: '创建中' };
    case 'ScheduleFailed':
      return { color: 'red', text: '创建失败' };
    case 'Restarting':
      return { color: 'orange', text: '重启中' };
    case 'Updating':
      return { color: 'blue', text: '更新中' };
    case 'Terminating':
      return { color: 'orange', text: '终止中' };
    case 'Expired':
      return { color: 'red', text: '过期' };
    default:
      return undefined;
  }
});
</script>
