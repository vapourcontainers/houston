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
      <a-table :dataSource="items" :columns="columns" :loading="!storageStore.items" expand-row-by-click
        :class="$style.items" />
    </a-col>
  </a-row>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import type { TableColumnType } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useStorageStore } from '@/stores/storage';
import { usePriceStore } from '@/stores/price';

import type { IStorageItem } from '@vapourcontainers-houston/types';

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
      if (typeof record.modifiedAt == 'undefined') {
        return undefined;
      }

      return dayjs(record.modifiedAt).format('YYYY-MM-DD HH:mm:ss');
    },
  },
];

interface INestedStorageItem extends Omit<IStorageItem, 'size' | 'modifiedAt'> {
  key: string;
  size?: number;
  modifiedAt?: string;
  children?: INestedStorageItem[];
}

const items = computed<INestedStorageItem[] | undefined>(() => {
  if (!storageStore.items) {
    return undefined;
  }

  const itemsMap: Record<string, INestedStorageItem> = {};
  const result: INestedStorageItem[] = [];

  for (const item of storageStore.items) {
    const parts = item.name.split('/');

    for (const [i, name] of parts.entries()) {
      const key = parts.slice(0, i + 1).join('/');
      const parentKey = parts.slice(0, i).join('/');
      const isRoot = i == 0;
      const isLeaf = i == parts.length - 1;

      if (!itemsMap[key]) {
        const newItem: INestedStorageItem = isLeaf
          ? ({ ...item, key, name })
          : ({ key, name: `${name}/`, children: [] });

        if (isRoot) {
          result.push(newItem);
        } else {
          itemsMap[parentKey]?.children?.push(newItem);
        }

        itemsMap[key] = newItem;
      }
    }
  }

  return result;
});
</script>

<style lang="scss" module>
.items {
  :global(.ant-table-cell) {
    font-family: monospace;
  }
}
</style>
