export type DataValue = { [key: string]: string | number | null | undefined };

export type QueueData = {
  id: string;
  referId: string;
  fileCode: string;
  data: DataValue[][];
};
