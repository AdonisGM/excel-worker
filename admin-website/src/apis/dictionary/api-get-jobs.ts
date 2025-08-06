import type {BasicApi, Paging} from '@/apis/http-type.ts';

export const apiGetJobs: BasicApi = {
  url: '/v1/queue/{0}/job',
  method: 'GET',
  contentType: 'application/json',
};

export interface GetJobsRes extends Paging {
  id: string
  fileCode: string
  referId: string
  queue: string
  size: number
  timestamp: number
}