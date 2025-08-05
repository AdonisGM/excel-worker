import CTable from "@/components/custom-ui/c-table.tsx";
import {useQuery} from "@tanstack/react-query";
import {callApi} from "@/apis/call-api.ts";
import {getJobs, type GetJobsReq, type GetJobsRes} from "@/apis/dictionary/get-jobs.ts";

const TableJobList = (props: { queueName: string }) => {
  const {data} = useQuery({
    queryKey: ['jobList', props.queueName],
    queryFn: async () => {
      return await callApi<GetJobsReq, GetJobsRes>({
        api: getJobs,
        body: undefined,
        params: [props.queueName],
      })
    },
    refetchInterval: 5000,
  })

  return (
    <CTable<GetJobsRes[0]>
      data={data !== undefined ? data : []}
      cols={[
        {field: 'page.no', headerName: 'No', width: 60, type: 'number'},
        {field: 'id', headerName: 'ID'},
        {field: 'referId', headerName: 'Refer ID'},
        {field: 'fileCode', headerName: 'File Code'},
        {field: 'size', headerName: 'Size'},
        {
          field: 'timestamp', headerName: 'Timestamp', cellRenderer: (props) => {
            return new Date(props.value).toLocaleString();
          }
        },
      ]}
    />
  );
}

export default TableJobList;