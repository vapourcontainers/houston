<template>
  <a-row :gutter="[16, 16]">
    <a-col :span="24">
      <a-card>
        <a-row :gutter="[16, 16]">
          <a-col :span="6">
            <a-statistic title="存储" :value="storage?.value" :precision="2" :suffix="storage?.unit" />
          </a-col>
          <a-col :span="6">
            <a-statistic title="任务" :value="2" />
          </a-col>
          <a-col :span="6">
            <a-statistic title="费用" :value="13.2" :precision="2" prefix="￥" />
          </a-col>
          <a-col :span="6">
            <a-statistic title="余额" :value="13.2" :precision="2" prefix="￥" />
          </a-col>
        </a-row>
      </a-card>
    </a-col>
  </a-row>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useBucketStore } from '@/stores/bucket';
import useSize from '@/composables/useSize';

const bucket = useBucketStore();
onMounted(() => bucket.fetchStat());

const storage = useSize(() => bucket.stat?.storage);
</script>
