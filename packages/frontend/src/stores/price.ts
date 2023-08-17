import { ref } from 'vue';
import { defineStore } from 'pinia';
import ky from 'ky';

import type {
  IPrice,
} from '@vapourcontainers-houston/types';

export const usePriceStore = defineStore('price', () => {
  const storage = ref<IPrice>();
  const runners = ref<Record<string, IPrice>>({});

  const http = ky.extend({
    prefixUrl: import.meta.env.VITE_SERVER_URL,
  });

  async function fetchStorage(used: number) {
    storage.value = await http.get('prices/storage', {
      searchParams: {
        used: used,
      },
    }).json();
  }

  async function fetchRunner(type: string) {
    const price = await http.get('prices/runner', {
      searchParams: {
        type: type,
      },
    }).json<IPrice>();

    runners.value = { ...runners.value, [type]: price };
  }

  return {
    storage,
    runners,
    fetchStorage,
    fetchRunner,
  };
});
