<template>
  <a-row :gutter="[16, 16]">
    <a-col :span="24">
      <a-card>
        <a-skeleton active :loading="!storage" :title="false">
          <a-row :gutter="[16, 16]">
            <a-col :span="8">
              <a-statistic title="已用空间" :value="storage?.value" :precision="2" :suffix="storage?.unit" />
            </a-col>
            <a-col :span="8">
              <a-statistic title="总对象数" :value="bucketStat?.objectCount" />
            </a-col>
            <a-col :span="8">
              <a-statistic title="费用估计" :value="cost" :precision="2" prefix="￥" suffix="/ 天" />
            </a-col>
          </a-row>
        </a-skeleton>
      </a-card>
    </a-col>
  </a-row>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import http from 'ky';

import type { BucketStat } from '@/aliyun/oss';
import { getSize } from '@/utils/readable';

const bucketStat = ref<BucketStat>();

const storage = computed(() => typeof bucketStat.value?.storage == 'undefined' ? undefined : getSize(bucketStat.value.storage));

const cost = computed(() => {
  if (typeof bucketStat.value?.storage == 'undefined') {
    return undefined;
  }

  const gb = bucketStat.value.storage / 1024 / 1024 / 1024;
  const costPerMonth = 0.12 * gb;
  const costPerDay = costPerMonth / 30;

  return costPerDay;
});

onMounted(async () => {
  bucketStat.value = await http.get(`${import.meta.env.VITE_SERVER_URL}/storage`).json();
});
</script>
