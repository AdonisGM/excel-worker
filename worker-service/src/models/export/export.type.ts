// Type config for export
export type ConfigWorkbook = {
  isHasGeneralData: boolean;
  isMergeCell: boolean;
  isMultipleSheet: boolean;
  sheet: ConfigSheet[];
};

export type ConfigSheet = {
  no: number;
  ranges: ConfigRange[];
};

export type ConfigRangeTable = {
  column: string;
  data: string;
};

export type ConfigRange = {
  no: number;
  beginCell: string;
  endCell: string;
  columns: string[];
  table: ConfigRangeTable | null | undefined;
};

// Type data
export type SingleData = { [key: string]: string | number | null | undefined };

export type DataTableLevel = {
  level: number;
  dataTables: DataTable[];
};

export type DataTable = {
  table: string;
  data: SingleData[];
};
