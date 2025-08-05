import {AgGridReact} from "ag-grid-react";
import { useState } from "react";
import type { ColDef } from "ag-grid-community";

const CTable = <IRow,>(props: {
  data: IRow[],
  cols: ColDef<IRow>[]
}) => {
  return (
    <div style={{ height: 500 }}>
      <AgGridReact
        rowData={props.data}
        columnDefs={props.cols}
      />
    </div>
  )
}

export default CTable