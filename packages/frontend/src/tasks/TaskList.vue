<template>
  <a-list :grid="{ gutter: 0 }" :data-source="taskStore.tasks" :loading="!taskStore.tasks" :class="$style.tasks">
    <template #renderItem="{ item }">
      <a-list-item :key="item.id">
        <a-card>
          <template #title>
            <a :href="linkToECI(item.runner)" target="_blank" noreferrer>
              {{ item.name }}
            </a>
          </template>

          <template #extra>
            <task-status-tag :status="item.runner.status" />
          </template>

          <template v-if="item.runner.status == ITaskRunnerStatus.RUNNING">
            <div :class="$style.stage">
              <task-stage :task="item" />
            </div>
          </template>

          <template v-if="item.state?.stage == ITaskStage.ENCODE">
            <task-progress :task="item" />
            <a-divider />
            <task-format :task="item" />
            <a-divider />
          </template>

          <task-runner :task="item" />
        </a-card>
      </a-list-item>
    </template>
  </a-list>
</template>

<script lang="ts" setup>
import { useTaskStore } from '@/stores/task';

import {
  ITaskRunnerStatus,
  type ITaskAliyunRunner,
  ITaskStage,
} from '@vapourcontainers-houston/types';

import TaskStatusTag from './TaskStatusTag.vue';
import TaskStage from './TaskStage.vue';
import TaskFormat from './TaskFormat.vue';
import TaskProgress from './TaskProgress.vue';
import TaskRunner from './TaskRunner.vue';

const taskStore = useTaskStore();
taskStore.fetchTasks();
taskStore.connectIO();

function linkToECI(runner: ITaskAliyunRunner) {
  return `https://eci.console.aliyun.com/#/eci/${runner.properties.regionId}/detail/${runner.properties.containerGroupId}/containers`;
}
</script>

<style lang="scss" module>
.tasks {
  :global(.ant-list-item) {
    padding-left: 0;
    padding-right: 0;
  }
}

.stage {
  margin: 16px auto 32px;
  max-width: 800px;
}
</style>
