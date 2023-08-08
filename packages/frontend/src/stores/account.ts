import { ref } from 'vue';
import { defineStore } from 'pinia';
import http from 'ky';

import type { QueryAccountBalanceResponseBodyData } from '@alicloud/bssopenapi20171214';

export const useAccountStore = defineStore('account', () => {
  const balance = ref<QueryAccountBalanceResponseBodyData>();

  async function fetchBalance() {
    balance.value = await http.get(`${import.meta.env.VITE_SERVER_URL}/account/balance`).json();
  }

  return {
    balance,
    fetchBalance,
  };
});
