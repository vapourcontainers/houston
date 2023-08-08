import { ref } from 'vue';
import { defineStore } from 'pinia';
import http from 'ky';

import type { ObjectSummary } from '@alicloud/oss20190517';
import type { BucketStat } from '@/aliyun/oss';

export const useBucketStore = defineStore('bucket', () => {
  const stat = ref<BucketStat>();
  const objects = ref<ObjectSummary[]>();

  async function fetchStat() {
    stat.value = await http.get(`${import.meta.env.VITE_SERVER_URL}/storage`).json();
  }

  async function fetchObjects() {
    objects.value = await http.get(`${import.meta.env.VITE_SERVER_URL}/storage/files`).json();
  }

  return {
    stat,
    objects,
    fetchStat,
    fetchObjects,
  };
});
