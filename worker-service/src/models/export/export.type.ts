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

export type ConfigRange = {
  no: number;
  beginCell: string;
  endCell: string;
  columns: string[];
  children: ConfigRange[];
  table: ConfigRangeTable | undefined;
};

export type ConfigRangeTable = {
  column: string;
  data: string;
};

// Type data
export type DataTableLevel = {
  level: number;
  setDataTable: Set<string>;
  dataTables: DataTable[];
};

export type DataTable = {
  key: string;
  setData: Set<string>;
  data: DataRow[];
};

export type DataRow = {
  dataLevelTable: DataTableLevel | undefined;
  data: DataValue;
};

export type DataValue = { [key: string]: string | number | null | undefined };

// Merge cell type
export type CMergeCell = {
  top: number;
  left: number;
  bottom: number;
  right: number;
  sheetName: undefined;
};
