import type {BasicApi} from "@/apis/http-type.ts";

const getJobs: BasicApi = {
  url: '/v1/queue/{0}/job',
  method: 'GET',
  contentType: 'application/json',
}
type GetJobsReq = undefined
type GetJobsRes = {
  page: {
    page: string
    limit: string
    no: number
  }
  total: number
  id: string
  fileCode: string
  referId: string
  queue: string
  size: number
  timestamp: number
}[]
export {getJobs, type GetJobsReq, type GetJobsRes}