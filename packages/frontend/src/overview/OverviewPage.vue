<template>
  <a-row :gutter="[16, 16]">
    <a-col :span="24">
      <a-card>
        <a-row :gutter="[16, 16]">
          <a-col :span="8">
            <a-statistic title="存储" :value="storage?.value" :precision="2" :suffix="storage?.unit" />
          </a-col>
          <a-col :span="8">
            <a-statistic title="任务" :value="taskStore?.tasks?.length" />
          </a-col>
          <a-col :span="8">
            <a-statistic title="余额" :value="accountStore?.balance?.availableAmount" :precision="2" prefix="￥" />
          </a-col>
        </a-row>
      </a-card>
    </a-col>
  </a-row>
</template>

<script lang="ts" setup>
import { watch } from 'vue';
import { useRoute } from 'vue-router';

import { useBucketStore } from '@/stores/bucket';
import { useTaskStore } from '@/stores/task';
import { useAccountStore } from '@/stores/account';

import useSize from '@/composables/useSize';

const route = useRoute();

const bucketStore = useBucketStore();
watch(route.params, () => bucketStore.fetchStat(), { immediate: true });

const taskStore = useTaskStore();
watch(route.params, () => taskStore.fetchTasks(), { immediate: true });

const accountStore = useAccountStore();
watch(route.params, () => accountStore.fetchBalance(), { immediate: true });

const storage = useSize(() => bucketStore.stat?.storage);
</script>
