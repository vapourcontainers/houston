<template>
  <a-list :grid="{ gutter: 16 }" :data-source="task.containers">
    <template #renderItem="{ item }">
      <a-list-item>
        <a-card>
          <template #title>
            {{ item.containerGroupId }}
          </template>

          <template #extra>
            <task-status-tag :status="item.status" />
          </template>

          <a-row :gutter="[16, 16]">
            <a-col v-bind="cardGrid">
              <a-statistic title="帧" value="117309" />
            </a-col>
            <a-col v-bind="cardGrid">
              <a-statistic title="帧率" :value="2.34" :precision="2" suffix="fps" />
            </a-col>
            <a-col v-bind="cardGrid">
              <a-statistic title="时间" value="00:39:22:01" />
            </a-col>
            <a-col v-bind="cardGrid">
              <a-statistic title="大小" :value="103.23" suffix="MB" />
            </a-col>
            <a-col v-bind="cardGrid">
              <a-statistic title="码率" :value="2394.22" :precision="1" suffix="Kbps" />
            </a-col>
            <a-col v-bind="cardGrid">
              <a-statistic title="速度" :value="0.133" :precision="3" suffix="×" />
            </a-col>
          </a-row>

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

const task = useTaskStore();
onMounted(() => task.fetchContainers());

const cardGrid = {
  xs: 24,
  sm: 12,
  md: 8,
  xl: 4,
};
</script>
