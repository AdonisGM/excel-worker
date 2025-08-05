export type MethodType = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type ContentType = 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data';
export type BasicApi = {
  url: string;
  method: MethodType;
  contentType?: ContentType;
}
