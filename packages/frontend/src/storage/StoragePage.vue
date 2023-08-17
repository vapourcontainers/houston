<template>
  <a-row :gutter="[16, 16]">
    <a-col :span="24">
      <a-card>
        <a-skeleton active :loading="!storageStore.info" :title="false">
          <a-row :gutter="[16, 16]">
            <a-col :span="8">
              <a-statistic title="已用空间" :value="storage?.value" :precision="2" :suffix="storage?.unit" />
            </a-col>
            <a-col :span="8">
              <a-statistic title="总对象数" :value="storageStore.info?.objects" />
            </a-col>
            <a-col :span="8">
              <a-statistic title="费用估计" :value="priceStore.storage?.price" :precision="3" prefix="￥" suffix="/ 天" />
            </a-col>
          </a-row>
        </a-skeleton>
      </a-card>
    </a-col>
    <a-col :span="24">
      <a-card>
        <a-table :dataSource="storageStore.items" :columns="columns" :loading="!storageStore.items" />
      </a-card>
    </a-col>
  </a-row>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import type { TableColumnType } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useStorageStore } from '@/stores/storage';
import { usePriceStore } from '@/stores/price';

import type { IStorageItem } from '@vapourcontainers-houston/typing';

import useSize from '@/composables/useSize';
import { getSize } from '@/utils/readable';

const storageStore = useStorageStore();
onMounted(() => storageStore.fetchInfo());
onMounted(() => storageStore.fetchItems());

const priceStore = usePriceStore();

const storage = useSize(() => storageStore.info?.capacityUsed);

const columns: TableColumnType<IStorageItem>[] = [
  {
    title: '名称',
    dataIndex: 'name',
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
    dataIndex: 'modifiedAt',
    width: '20em',
    customRender({ record }) {
      return dayjs(record.modifiedAt).format('YYYY-MM-DD HH:mm:ss');
    },
  },
];
</script>
