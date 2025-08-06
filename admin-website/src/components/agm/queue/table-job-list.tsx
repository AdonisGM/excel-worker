import CTable from '@/components/custom-ui/c-table.tsx';
import {keepPreviousData, useQuery} from '@tanstack/react-query';
import {callApi} from '@/apis/call-api.ts';
import {apiGetJobs, type GetJobsRes} from '@/apis/dictionary/api-get-jobs.ts';
import {useState} from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

const TableJobList = (props: { queueName: string }) => {
  const [page, setPage] = useState(1);

  const {data, isLoading} = useQuery({
    queryKey: ['jobList', props.queueName, page],
    queryFn: async () => {
      return await callApi<undefined, Array<GetJobsRes>>({
        api: apiGetJobs,
        body: undefined,
        params: [props.queueName],
        query: {
          page: page.toString(),
        }
      });
    },
    placeholderData: keepPreviousData,
    refetchInterval: 5000,
  });
  return (
    <CTable<GetJobsRes>
      isLoading={isLoading}
      onPageChange={(page) => {setPage(page);}}
      data={data !== undefined ? data : []}
      cols={[
        {field: 'page.no', headerName: 'No', width: 60, type: 'number'},
        {field: 'id', headerName: 'ID'},
        {field: 'referId', headerName: 'Refer ID'},
        {field: 'fileCode', headerName: 'File Code'},
        {field: 'size', headerName: 'Size'},
        {
          field: 'timestamp',
          headerName: 'Timestamp',
          cellRenderer: (props: { value: string | number | Date; }) => {
            return dayjs(props.value).format('DD/MM/YYYY HH:mm:ss');
          }
        },
      ]}
    />
  );
};

export default TableJobList;