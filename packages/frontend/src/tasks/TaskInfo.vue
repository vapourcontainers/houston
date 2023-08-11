<template>
  <a-skeleton active :loading="!info" :title="false">
    <a-descriptions title="任务" :column="{ xs: 1, sm: 1, md: 2, lg: 4 }" :style="{ marginBottom: '-16px' }">
      <a-descriptions-item label="宽">{{ info?.width }}</a-descriptions-item>
      <a-descriptions-item label="高">{{ info?.height }}</a-descriptions-item>
      <a-descriptions-item label="帧数">{{ info?.frames }}</a-descriptions-item>
      <a-descriptions-item label="FPS">{{ info?.fps }}</a-descriptions-item>
      <a-descriptions-item label="格式">{{ info?.formatName }}</a-descriptions-item>
      <a-descriptions-item label="色彩">{{ info?.colorFamily }}</a-descriptions-item>
      <a-descriptions-item label="色深">{{ info?.bits }}</a-descriptions-item>
    </a-descriptions>
  </a-skeleton>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { useTaskStore, type ITask } from '@/stores/task';

const props = defineProps<{
  task: ITask;
}>();

const taskStore = useTaskStore();

onMounted(() => taskStore.fetchTaskInfo(
  props.task.container.containerGroupId!,
  props.task.container.containerGroupName!));

const info = computed(() => props.task.info);
</script>
