import type {BasicApi} from '@/apis/http-type.ts';

export const getQueue: BasicApi = {
  url: '/v1/queue',
  method: 'GET',
  contentType: 'application/json',
};
export interface GetQueueRes {
  name: string,
  count: number,
  activeCount: number,
  waitingCount: number,
  completedCount: number,
  failedCount: number,
  delayedCount: number,
  isPaused: boolean,
}