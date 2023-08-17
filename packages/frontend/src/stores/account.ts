import { ref } from 'vue';
import { defineStore } from 'pinia';
import ky from 'ky';

import type {
  IAccountBalance,
} from '@vapourcontainers-houston/typing';

export const useAccountStore = defineStore('account', () => {
  const balance = ref<IAccountBalance>();

  const http = ky.extend({
    prefixUrl: import.meta.env.VITE_SERVER_URL,
  });

  async function fetchBalance() {
    balance.value = await http.get('account/balance').json();
  }

  return {
    balance,
    fetchBalance,
  };
});
