import { ref } from 'vue';
import { defineStore } from 'pinia';
import http from 'ky';

import type { ObjectSummary } from '@alicloud/oss20190517';
import type { BucketStat } from '@/aliyun/oss';
import type { GetPayAsYouGoPriceResponseBodyDataModuleDetailsModuleDetail } from '@alicloud/bssopenapi20171214';

export const useBucketStore = defineStore('bucket', () => {
  const stat = ref<BucketStat>();
  const objects = ref<ObjectSummary[]>();
  const cost = ref<GetPayAsYouGoPriceResponseBodyDataModuleDetailsModuleDetail>();

  async function fetchStat() {
    stat.value = await http.get(`${import.meta.env.VITE_SERVER_URL}/storage`).json();

    cost.value = await http.get(`${import.meta.env.VITE_SERVER_URL}/storage/cost`, {
      searchParams: {
        storage_gb: (stat.value?.storage || 0) / 1024 / 1024 / 1024,
      },
    }).json();
  }

  async function fetchObjects() {
    objects.value = await http.get(`${import.meta.env.VITE_SERVER_URL}/storage/files`).json();
  }

  return {
    stat,
    objects,
    cost,
    fetchStat,
    fetchObjects,
  };
});
