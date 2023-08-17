import { ref } from 'vue';
import { defineStore } from 'pinia';
import ky from 'ky';

import type {
  IStorageInfo,
  IStorageItem,
} from '@vapourcontainers-houston/types';

import { usePriceStore } from './price';

export const useStorageStore = defineStore('storage', () => {
  const info = ref<IStorageInfo>();
  const items = ref<IStorageItem[]>();

  const priceStore = usePriceStore();

  const http = ky.extend({
    prefixUrl: import.meta.env.VITE_SERVER_URL,
  });

  async function fetchInfo() {
    info.value = await http.get('storage').json();
    priceStore.fetchStorage((info.value?.capacityUsed || 0) / 1024 / 1024 / 1024);
  }

  async function fetchItems() {
    items.value = await http.get('storage/items').json();
  }

  return {
    info,
    items,
    fetchInfo,
    fetchItems,
  };
});
