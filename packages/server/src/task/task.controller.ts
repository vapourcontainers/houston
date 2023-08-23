import { Controller, Get, HttpException, HttpStatus, Inject } from '@nestjs/common';

import type {
  ITaskAliyunRunner,
  ITaskItem,
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
}
