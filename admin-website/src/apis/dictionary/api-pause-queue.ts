import type {BasicApi} from '@/apis/http-type';

export const apiPauseAdd: BasicApi = {
  url: '/v1/queue/{0}/pause-add',
  method: 'PATCH',
  contentType: 'application/json',
};

export const apiPauseQueue: BasicApi = {
  url: '/v1/queue/{0}/pause',
  method: 'PATCH',
  contentType: 'application/json',
};

export interface PauseAddReq {
  isPaused: boolean;
}

export interface PauseQueueRes {
  status: string;
  message: string;
}

