export type MethodType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
export type ContentType = 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data';
export interface BasicApi {
  url: string;
  method: MethodType;
  contentType?: ContentType;
}
export interface Paging {
  page: {
    page: number,
    limit: number,
    no: number
  }
  total: number
}