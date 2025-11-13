import { EventEmitter } from 'events';
import { WEBSITE_BUILDER_EVENT } from '../constants/phase-events';

export type SSEMessage = {
  event: string;
  data: any;
};

class SSEBus extends EventEmitter {
  emitSSE(event: string, data: any): void {
    this.emit('sse', { event, data } as SSEMessage);
  }

  emitWebsiteBuilderStart(detail: {
    label: string;
    phase: 'tool_start' | 'tool_end';
    toolId: string;
    reason?: string | null;
  }): void {
    this.emitSSE(WEBSITE_BUILDER_EVENT, detail);
  }
}

export const sseBus = new SSEBus();


