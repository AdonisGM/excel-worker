import { DataValue } from '../export/export.type';

export type QueueData = {
  id: string;
  referId: string;
  fileCode: string;
  data: DataValue[][];
};
