<template>
  <a-list :grid="{ gutter: 0 }" :data-source="task.containers" :class="$style.tasks">
    <template #renderItem="{ item }">
      <a-list-item>
        <a-card>
          <template #title>
            {{ item.containerGroupId }}
          </template>

          <template #extra>
            <task-status-tag :status="item.status" />
          </template>

          <task-progress :group-id="item.containerGroupId" :name="item.containerGroupName" />

          <a-divider />

          <a-descriptions title="容器" :column="4" :style="{ marginBottom: '-16px' }">
            <a-descriptions-item label="地域">{{ item.regionId }}</a-descriptions-item>
            <a-descriptions-item label="规格">{{ item.instanceType }}</a-descriptions-item>
            <a-descriptions-item label="CPU">{{ item.cpu }}</a-descriptions-item>
            <a-descriptions-item label="内存">{{ item.memory }} GB</a-descriptions-item>
          </a-descriptions>

          <a-divider />

          <task-info :group-id="item.containerGroupId" :name="item.containerGroupName" />
        </a-card>
      </a-list-item>
    </template>
  </a-list>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useTaskStore } from '@/stores/task';

import TaskStatusTag from './TaskStatusTag.vue';
import TaskInfo from './TaskInfo.vue';
import TaskProgress from './TaskProgress.vue';

const task = useTaskStore();
onMounted(() => task.fetchContainers());
</script>

<style lang="scss" module>
.tasks {
  :global(.ant-list-item) {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
