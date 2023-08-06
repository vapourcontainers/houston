<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
      <div :class="$style.logo" />
      <a-menu v-model:selected-keys="page" theme="dark" mode="inline">
        <a-menu-item key="overview">
          <router-link :to="{ name: 'overview' }">
            <dashboard-outlined />
            <span>概览</span>
          </router-link>
        </a-menu-item>
        <a-menu-item key="storage">
          <router-link :to="{ name: 'storage' }">
            <folder-outlined />
            <span>存储</span>
          </router-link>
        </a-menu-item>
        <a-menu-item key="tasks">
          <router-link :to="{ name: 'tasks' }">
            <cloud-server-outlined />
            <span>任务</span>
          </router-link>
        </a-menu-item>
        <a-menu-item key="cost">
          <router-link :to="{ name: 'cost' }">
            <profile-outlined />
            <span>开销</span>
          </router-link>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0" />
      <a-layout-content style="margin: 0 16px">
        <router-view />
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        © 2023 XiNGRZ
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  DashboardOutlined,
  FolderOutlined,
  CloudServerOutlined,
  ProfileOutlined,
} from '@ant-design/icons-vue';

const collapsed = ref(false);

const router = useRouter();
const page = computed(() => [router.currentRoute.value.name]);
</script>

<style lang="scss" module>
.logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.3);
  margin: 16px;
}
</style>
