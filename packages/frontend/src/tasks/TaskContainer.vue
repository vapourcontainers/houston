<template>
  <a-descriptions title="容器" :column="4" :style="{ marginBottom: '-16px' }">
    <a-descriptions-item label="地域">{{ container.regionId }}</a-descriptions-item>
    <a-descriptions-item label="规格">{{ container.instanceType }}</a-descriptions-item>
    <a-descriptions-item label="CPU">{{ container.cpu }}</a-descriptions-item>
    <a-descriptions-item label="内存">{{ container.memory }} GB</a-descriptions-item>
  </a-descriptions>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { type ITask } from '@/stores/task';

const props = defineProps<{
  task: ITask;
}>();

const container = computed(() => props.task.container);
</script>
