<template>
  <a-list :grid="{ gutter: 0 }" :data-source="taskStore.tasks" :class="$style.tasks">
    <template #renderItem="{ item }">
      <a-list-item :key="item.id">
        <a-card>
          <template #title>
            {{ item.container.containerGroupId }}
          </template>

          <template #extra>
            <task-status-tag :status="item.container.status" />
          </template>

          <template v-if="item.container.status == 'Running'">
            <task-progress :task="item" />
            <a-divider />
          </template>

          <a-descriptions title="容器" :column="4" :style="{ marginBottom: '-16px' }">
            <a-descriptions-item label="地域">{{ item.container.regionId }}</a-descriptions-item>
            <a-descriptions-item label="规格">{{ item.container.instanceType }}</a-descriptions-item>
            <a-descriptions-item label="CPU">{{ item.container.cpu }}</a-descriptions-item>
            <a-descriptions-item label="内存">{{ item.container.memory }} GB</a-descriptions-item>
          </a-descriptions>

          <template v-if="item.container.status == 'Running'">
            <a-divider />
            <task-info :task="item" />
          </template>
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

const taskStore = useTaskStore();
onMounted(() => taskStore.fetchTasks());
</script>

<style lang="scss" module>
.tasks {
  :global(.ant-list-item) {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
