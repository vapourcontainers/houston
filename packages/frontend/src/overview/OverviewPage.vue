<template>
  <a-row :gutter="[16, 16]">
    <a-col :span="24">
      <a-card>
        <a-row :gutter="[16, 16]">
          <a-col :span="8">
            <a-statistic title="存储" :value="storage?.value" :precision="2" :suffix="storage?.unit" />
          </a-col>
          <a-col :span="8">
            <a-statistic title="任务" :value="taskStore.runningTasks?.length" />
          </a-col>
          <a-col :span="8">
            <a-statistic title="余额" :value="accountStore?.balance?.available" :precision="2" prefix="￥" />
          </a-col>
        </a-row>
      </a-card>
    </a-col>
  </a-row>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';

import { useStorageStore } from '@/stores/storage';
import { useTaskStore } from '@/stores/task';
import { useAccountStore } from '@/stores/account';

import useSize from '@/composables/useSize';

const storageStore = useStorageStore();
onMounted(() => storageStore.fetchInfo());

const taskStore = useTaskStore();
onMounted(() => taskStore.fetchTasks());

const accountStore = useAccountStore();
onMounted(() => accountStore.fetchBalance());

const storage = useSize(() => storageStore.info?.capacityUsed);
</script>
