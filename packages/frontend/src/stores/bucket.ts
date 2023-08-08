import { ref } from 'vue';
import { defineStore } from 'pinia';
import http from 'ky';

import type { BucketStat } from '@/aliyun/oss';

export const useBucketStore = defineStore('bucket', () => {
  const stat = ref<BucketStat>();

  async function fetchStat() {
    stat.value = await http.get(`${import.meta.env.VITE_SERVER_URL}/storage`).json<BucketStat>();
  }

  return {
    stat,
    fetchStat,
  };
});
