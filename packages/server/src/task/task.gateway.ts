import { Inject } from '@nestjs/common';
import {
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { WebSocket } from 'ws';

import { RunnerManager, WEBSOCKET_PENDING } from './runner.service';
import { TaskService } from './task.service';

import {
  ITaskStage,
  type IProject,
  type ITaskState,
  type ITaskFileProgress,
  type ITaskFormat,
  type ITaskProgress,
  ITaskRunnerStatus,
} from '@vapourcontainers-houston/types';

@WebSocketGateway({
  transports: ['websocket'],
  namespace: '/api/tasks',
})
export class TaskGateway implements
  OnGatewayConnection<Socket>,
  OnGatewayDisconnect<Socket>{
  @WebSocketServer()
  private server!: Server;

  private readonly clients: Record<string, Socket> = {};
  private readonly runners: Record<string, WebSocket | WEBSOCKET_PENDING> = {};
  private readonly states: Record<string, ITaskState> = {};

  private tasksPoller: ReturnType<typeof setInterval> | undefined;

  constructor(
    @Inject(RunnerManager) private readonly rm: RunnerManager,
    @Inject(TaskService) private readonly taskService: TaskService,
  ) {
    rm.on('event', this.handleEvent.bind(this));
    rm.on('close', (id: string) => delete this.runners[id]);
  }

  handleConnection(client: Socket) {
    this.clients[client.id] = client;

    if (!this.tasksPoller) {
      this.tasksPoller = setInterval(this.handlePoll.bind(this), 10 * 1000);
      this.handlePoll();
    }
  }

  handleDisconnect(client: Socket) {
    delete this.clients[client.id];

    if (this.clientsCount() == 0) {
      clearInterval(this.tasksPoller);
      this.tasksPoller = undefined;

      for (const id of Object.keys(this.runners)) {
        this.rm.close(id);
      }
    }
  }

  private clientsCount() {
    return Object.keys(this.clients).length;
  }

  private async handlePoll() {
    try {
      const tasks = await this.taskService.getTasks();
      this.server.emit('tasks', tasks);

      for (const task of tasks ?? []) {
        if (task.runner.status == ITaskRunnerStatus.RUNNING) {
          const runner = await this.rm.retrieve(task.id);
          if (runner) {
            this.runners[task.id] = runner;
          }
        } else {
          this.rm.close(task.id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  private handleEvent(id: string, name: string, data: unknown | undefined) {
    if (this.clientsCount() == 0) {
      return;
    }

    const state = this.states[id] ?? {
      stage: ITaskStage.IDLE,
      project: undefined,
      downloadProgress: undefined,
      uploadProgress: undefined,
      format: undefined,
      progress: undefined,
    };

    switch (name) {
      case 'stage':
        state.stage = data as ITaskStage;
        break;
      case 'project':
        state.project = data as IProject;
        break;
      case 'download-progress':
        state.downloadProgress = data as ITaskFileProgress;
        break;
      case 'upload-progress':
        state.uploadProgress = data as ITaskFileProgress;
        break;
      case 'format':
        state.format = data as ITaskFormat;
        break;
      case 'progress':
        state.progress = data as ITaskProgress;
        break;
    }

    this.states[id] = state;
    this.server.emit('state', id, state);
  }
}
