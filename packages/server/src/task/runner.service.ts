import EventEmitter, { once } from 'node:events';
import { promisify } from 'node:util';

import { Inject, Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';

import { ExecContainerCommandRequest } from '@alicloud/eci20180808';

import { CONFIG, type IConfig } from '../aliyun/config.service';
import { ECIService } from '../aliyun/eci.service';

export const WEBSOCKET_PENDING = 'PENDING';
export type WEBSOCKET_PENDING = typeof WEBSOCKET_PENDING;

@Injectable()
export class RunnerManager extends EventEmitter {
  private readonly sockets: Record<string, WebSocket | WEBSOCKET_PENDING> = {};

  constructor(
    @Inject(CONFIG) private readonly config: IConfig,
    @Inject(ECIService) private readonly eci: ECIService,
  ) {
    super();
  }

  async retrieve(id: string): Promise<WebSocket | WEBSOCKET_PENDING | undefined> {
    const match = id.match(/^aliyun:([^:]+):([^:]+)$/);
    if (!match) return undefined;

    if (typeof this.sockets[id] != 'undefined') {
      return this.sockets[id];
    }

    this.sockets[id] = WEBSOCKET_PENDING;

    let webSocketUri: string | undefined;
    try {
      const output = await this.eci.execContainerCommand(new ExecContainerCommandRequest({
        regionId: this.config.regionId,
        containerGroupId: match[1],
        containerName: match[2],
        command: '/monitor.sh',
        stdin: true,
        TTY: true,
      }));

      if (!output.body.webSocketUri) {
        delete this.sockets[id];
        return undefined;
      }

      webSocketUri = output.body.webSocketUri;
    } catch (e) {
      delete this.sockets[id];
      return undefined;
    }

    const ws = new WebSocket(webSocketUri);

    ws.once('close', () => {
      delete this.sockets[id];
      this.emit('close', id);
    });

    ws.once('error', (_err) => {
      delete this.sockets[id];
      this.emit('close', id);
    });

    ws.on('message', (data) => {
      const message = data.slice(1).toString().trim();
      if (!message) return;

      const event = parseEvent(message);
      if (!event) return;

      this.emit('event', id, event.name, event.data);
    });

    await once(ws, 'open');

    this.sockets[id] = ws;
    return ws;
  }

  async close(id: string): Promise<void> {
    const socket = this.sockets[id];
    if (socket instanceof WebSocket) {
      const send = promisify(socket.send.bind(socket));
      await send(Buffer.from([0x00, 0x03])); // send ETX (Ctrl-C)
    }
  }
}

interface IEvent<T = unknown> {
  name: string;
  data: T | undefined;
}

function parseEvent(message: string): IEvent | undefined {
  try {
    const { name, data } = JSON.parse(message);
    return { name, data };
  } catch (e) {
    return undefined;
  }
}
