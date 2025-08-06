import {AgGridReact} from 'ag-grid-react';
import type {ColDef} from 'ag-grid-community';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination.tsx';
import {themeAlpine} from 'ag-grid-community';
import type {Paging} from '@/apis/http-type.ts';
import {useState} from 'react';

const CTable = <IRow extends Paging>(props: {
  data: IRow[],
  cols: ColDef<IRow>[],
  onPageChange?: (page: number) => void,
  isLoading?: boolean
}) => {
  // Paging logic and handler functions
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // or get from props
  const totalPage = Math.ceil((props.data.length > 0 ? props.data[0].total : 1) / pageSize);
  const startPage = Math.max(2, currentPage - 2);
  const endPage = Math.min(totalPage - 1, currentPage + 2);

  function handlePageChange(page: number) {
    if (page < 1 || page > totalPage) return;
    setCurrentPage(page);
    if (props.onPageChange) {
      props.onPageChange(page);
    }
  }

  return (
    <div style={{height: 500}}>
      <AgGridReact
        rowData={props.data}
        columnDefs={props.cols}
        theme={themeAlpine}
        loading={props.isLoading}
        enableCellTextSelection={true}
        suppressDragLeaveHidesColumns={true}
      />
      {totalPage !== 0 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} className={'cursor-pointer'}/>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink onClick={() => handlePageChange(1)} isActive={currentPage === 1}
                className={'cursor-pointer'}>1</PaginationLink>
            </PaginationItem>
            {startPage > 2 && (
              <PaginationItem>
                <PaginationEllipsis/>
              </PaginationItem>
            )}
            {Array.from({length: endPage - startPage + 1}, (_, idx) => startPage + idx).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink onClick={() => handlePageChange(page)} isActive={currentPage === page}
                  className={'cursor-pointer'}>{page}</PaginationLink>
              </PaginationItem>
            ))}
            {endPage < totalPage - 1 && (
              <PaginationItem>
                <PaginationEllipsis/>
              </PaginationItem>
            )}
            {totalPage > 1 && (
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(totalPage)} isActive={currentPage === totalPage}
                  className={'cursor-pointer'}>{totalPage}</PaginationLink>
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext onClick={() => handlePageChange(currentPage + 1)} className={'cursor-pointer'}/>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default CTable;