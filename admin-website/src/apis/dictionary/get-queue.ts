import type {BasicApi} from "@/apis/http-type.ts";

const getQueue: BasicApi = {
  url: '/v1/queue',
  method: 'GET',
  contentType: 'application/json',
}
type GetQueueReq = undefined
type GetQueueRes = {
  name: string,
  count: number,
  activeCount: number,
  waitingCount: number,
  completedCount: number,
  failedCount: number,
  delayedCount: number,
  isPaused: boolean,
}[]
export {getQueue, type GetQueueReq, type GetQueueRes}