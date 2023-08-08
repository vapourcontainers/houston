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
    <a-col :span="24">
      <a-card>
        <a-table :dataSource="bucket.objects" :columns="columns" :loading="!bucket.objects" />
      </a-card>
    </a-col>
  </a-row>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import type { TableColumnType } from 'ant-design-vue';
import type { ObjectSummary } from '@alicloud/oss20190517';
import dayjs from 'dayjs';

import { useBucketStore } from '@/stores/bucket';
import useSize from '@/composables/useSize';
import { getSize } from '@/utils/readable';

const bucket = useBucketStore();
onMounted(() => bucket.fetchStat());
onMounted(() => bucket.fetchObjects());

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

const columns: TableColumnType<ObjectSummary>[] = [
  {
    title: '名称',
    dataIndex: 'key',
  },
  {
    title: '大小',
    dataIndex: 'size',
    width: '10em',
    align: 'right',
    customRender({ record }) {
      if (typeof record.size == 'undefined') {
        return undefined;
      }

      const size = getSize(record.size);
      return `${size.value.toFixed(2)} ${size.unit}`;
    },
  },
  {
    title: '最后修改时间',
    dataIndex: 'lastModified',
    width: '20em',
    customRender({ record }) {
      if (typeof record.lastModified == 'undefined') {
        return undefined;
      }

      return dayjs(record.lastModified).format('YYYY-MM-DD HH:mm:ss');
    },
  },
];
</script>
