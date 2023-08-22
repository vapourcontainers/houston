import { Controller, Get, HttpException, HttpStatus, Inject, Param } from '@nestjs/common';

import type {
  ITaskAliyunRunner,
  ITaskItem,
  ITaskState
} from '@vapourcontainers-houston/types';

import { TaskService } from './task.service';

@Controller('tasks')
export class TaskController {
  constructor(
    @Inject(TaskService) private readonly taskService: TaskService,
  ) { }

  @Get()
  async getTasks(): Promise<ITaskItem<ITaskAliyunRunner>[]> {
    const tasks = await this.taskService.getTasks();
    if (tasks) {
      return tasks;
    } else {
      throw new HttpException({}, HttpStatus.NOT_FOUND);
    }
  }

  @Get(':id/state')
  async getTaskState(@Param('id') id: string): Promise<ITaskState> {
    const state = await this.taskService.getTaskState(id);
    if (state) {
      return state;
    } else {
      throw new HttpException({}, HttpStatus.NOT_FOUND);
    }
  }
}
