<template>
  <a-config-provider :theme="{ algorithm: theme.darkAlgorithm, token: { borderRadius: 0 } }">
  </a-config-provider>
</template>

<script lang="ts" setup>
import { theme } from 'ant-design-vue';
</script>

<style lang="scss" module>
:global(body) {
  background: #303030;
}
</style>
