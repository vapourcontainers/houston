<template>
  <a-skeleton active :loading="!progress" :title="false">
    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :sm="12" :md="8" :xl="4">
        <a-statistic title="帧率" :value="progress?.fps" :precision="2" suffix="fps" />
      </a-col>
      <a-col :xs="24" :sm="12" :md="8" :xl="4">
        <a-statistic title="大小" :value="size?.value" :precision="2" :suffix="size?.unit" />
      </a-col>
      <a-col :xs="24" :sm="12" :md="8" :xl="6">
        <a-statistic title="时间" :value="progress?.outTime" />
      </a-col>
      <a-col :xs="24" :sm="12" :md="8" :xl="6">
        <a-statistic title="码率" :value="progress?.bitrate" />
      </a-col>
      <a-col :xs="24" :sm="12" :md="8" :xl="4">
        <a-statistic title="速度" :value="progress?.speed" :precision="3" suffix="×" />
      </a-col>
    </a-row>
  </a-skeleton>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useTaskStore, type ITaskProgress } from '@/stores/task';
import useSize from '@/composables/useSize';

const props = defineProps<{
  groupId: string;
  name: string;
}>();

const task = useTaskStore();

const progress = ref<ITaskProgress>();
const size = useSize(() => progress.value?.totalSize);

async function updateProgress() {
  progress.value = await task.fetchTaskProgress(props.groupId, props.name);
}

let timer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  updateProgress();
  timer = setInterval(updateProgress, 1000);
});

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>
