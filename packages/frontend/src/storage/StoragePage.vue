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
              <a-statistic title="总对象数" :value="bucket.stat?.objectCount" />
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
import { computed, onMounted } from 'vue';
import { useBucketStore } from '@/stores/bucket';
import useSize from '@/composables/useSize';

const bucket = useBucketStore();
onMounted(() => bucket.fetchStat());

const storage = useSize(() => bucket.stat?.storage);

const cost = computed(() => {
  if (typeof bucket.stat?.storage == 'undefined') {
    return undefined;
  }

  const gb = bucket.stat.storage / 1024 / 1024 / 1024;
  const costPerMonth = 0.12 * gb;
  const costPerDay = costPerMonth / 30;

  return costPerDay;
});
</script>
