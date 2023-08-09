import { ref } from 'vue';
import { defineStore } from 'pinia';
import http from 'ky';

import type { DescribeContainerGroupsResponseBodyContainerGroups } from '@alicloud/eci20180808';

export const useTaskStore = defineStore('task', () => {
  const containers = ref<DescribeContainerGroupsResponseBodyContainerGroups[]>();

  async function fetchContainers() {
    containers.value = await http.get(`${import.meta.env.VITE_SERVER_URL}/tasks`).json();
  }

  async function fetchTaskInfo(groupId: string, name: string): Promise<ITaskInfo> {
    return await http.get(`${import.meta.env.VITE_SERVER_URL}/tasks/${groupId}/${name}/info`).json();
  }

  async function fetchTaskProgress(groupId: string, name: string): Promise<ITaskProgress> {
    return await http.get(`${import.meta.env.VITE_SERVER_URL}/tasks/${groupId}/${name}/progress`).json();
  }

  return {
    containers,
    fetchContainers,
    fetchTaskInfo,
    fetchTaskProgress,
  };
});

export interface ITaskInfo {
  width: number;
  height: number;
  frames: number;
  fps: string;
  formatName: string;
  colorFamily: string;
  bits: number;
}

export interface ITaskProgress {
  frame: number;
  fps: number;
  bitrate: number;
  totalSize: number;
  outTimeMs: number;
  outTime: string;
  speed: number;
}
