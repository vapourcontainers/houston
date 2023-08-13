<template>
  <a-list :grid="{ gutter: 0 }" :data-source="taskStore.tasks" :class="$style.tasks">
    <template #renderItem="{ item }">
      <a-list-item :key="item.id">
        <a-card>
          <template #title>
            <a :href="linkToECI(item.container)" target="_blank" noreferrer>
              {{ item.container.containerGroupId }}
            </a>
          </template>

          <template #extra>
            <task-status-tag :status="item.container.status" />
          </template>

          <template v-if="item.container.status == 'Running'">
            <task-progress :task="item" />
            <a-divider />
          </template>

          <task-container :task="item" />

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
import { watch } from 'vue';
import { useRoute } from 'vue-router';

import { useTaskStore, type ITaskContainer } from '@/stores/task';

import TaskStatusTag from './TaskStatusTag.vue';
import TaskInfo from './TaskInfo.vue';
import TaskProgress from './TaskProgress.vue';
import TaskContainer from './TaskContainer.vue';

const route = useRoute();

const taskStore = useTaskStore();
watch(route.params, () => taskStore.fetchTasks(), { immediate: true });

function linkToECI(container: ITaskContainer) {
  return `https://eci.console.aliyun.com/#/eci/${container.regionId}/detail/${container.containerGroupId}/containers`;
}
</script>

<style lang="scss" module>
.tasks {
  :global(.ant-list-item) {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
