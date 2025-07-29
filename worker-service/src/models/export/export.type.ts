// Type config for export
export interface ConfigWorkbook {
  isHasGeneralData: boolean;
  isMergeCell: boolean;
  isMultipleSheet: boolean;
  sheet: ConfigSheet[];
}

export interface ConfigSheet {
  no: number;
  ranges: ConfigRange[];
}

export interface ConfigRange {
  no: number;
  beginCell: string;
  endCell: string;
  columns: string[];
  children: ConfigRange[];
  table: ConfigRangeTable;
}

export interface ConfigRangeTable {
  column: string | undefined;
  data: string | undefined;
}

// Type data
export interface DataTableLevel {
  level: number;
  dataTables: DataTable[];
}

export interface DataTable {
  key: string;
  setData: Set<string>;
  data: DataRow[];
}

export interface DataRow {
  dataLevelTable: DataTableLevel;
  data: DataValue;
  key: string | undefined;
}

export interface DataValue {
  [key: string]: string | number | null | undefined;
}

// Merge cell type
export interface CMergeCell {
  top: number;
  left: number;
  bottom: number;
  right: number;
  sheetName: undefined;
}
