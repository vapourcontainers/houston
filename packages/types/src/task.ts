import type { IProject } from './project';

export interface ITaskItem<
  Runner extends ITaskRunner<unknown>,
> {
  id: string;
  name: string;
  runner: Runner;
  state: ITaskState | undefined;
}

export interface ITaskState {
  stage: ITaskStage;
  project: IProject | undefined;
  downloadProgress: ITaskFileProgress | undefined;
  uploadProgress: ITaskFileProgress | undefined;
  format: ITaskFormat | undefined;
  progress: ITaskProgress | undefined;
}

export enum ITaskStage {
  IDLE = 'idle',
  DOWNLOAD = 'download',
  ENCODE = 'encode',
  UPLOAD = 'upload',
}

export interface ITaskFileProgress {
  fileIndex: number;
  currentBytes: number;
  totalBytes: number;
}

export interface ITaskFormat {
  width: number;
  height: number;
  frames: number;
  fps: {
    numerator: number;
    denominator: number;
  };
  formatName: string;
  colorFamily: string;
  bitDepth: number;
}

export interface ITaskProgress {
  processedFrames: number;
  processedDurationMs: number;
  fps: number;
  currentBitrate: number;
  outputBytes: number;
  speed: number;
}

export interface ITaskRunner<T> {
  provider: string;
  properties: T;
  createdAt: string;
  startedAt: string | undefined;
  finishedAt: string | undefined;
  status: ITaskRunnerStatus;
}

export enum ITaskRunnerStatus {
  UNKNOWN = 'unknown',
  PREPARING = 'preparing',
  RUNNING = 'running',
  FINISHING = 'finishing',
  FINISHED = 'finished',
  FAILED = 'failed',
}

export interface ITaskAliyunRunner extends ITaskRunner<ITaskAliyunRunnerProps> {
  provider: 'aliyun';
}

export interface ITaskAliyunRunnerProps {
  containerGroupId: string;
  containerGroupName: string;
  regionId: string;
  instanceType: string;
  cpu: number;
  memory: number;
}
