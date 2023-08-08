<template>
  <a-row :gutter="[16, 16]">
    <a-col :span="24">
      <a-card>
        <a-row :gutter="[16, 16]">
          <a-col :span="8">
            <a-statistic title="存储" :value="storage?.value" :precision="2" :suffix="storage?.unit" />
          </a-col>
          <a-col :span="8">
            <a-statistic title="任务" :value="2" />
          </a-col>
          <a-col :span="8">
            <a-statistic title="余额" :value="account?.balance?.availableAmount" :precision="2" prefix="￥" />
          </a-col>
        </a-row>
      </a-card>
    </a-col>
  </a-row>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';

import { useBucketStore } from '@/stores/bucket';
import { useAccountStore } from '@/stores/account';

import useSize from '@/composables/useSize';

const bucket = useBucketStore();
onMounted(() => bucket.fetchStat());

const account = useAccountStore();
onMounted(() => account.fetchBalance());

const storage = useSize(() => bucket.stat?.storage);
</script>
