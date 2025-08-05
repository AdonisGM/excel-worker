import {useQuery} from "@tanstack/react-query";
import {callApi} from "@/apis/call-api.ts";
import {useNavigate} from "@tanstack/react-router";
import {getQueue, type GetQueueReq, type GetQueueRes} from "@/apis/dictionary/get-queue.ts";
import QueueItem from "@/components/agm/queue/queue-item.tsx";

const Queues = () => {
  const navigate = useNavigate();

  const {data} = useQuery({
    queryKey: ['queues'],
    queryFn: async () => {
      return await callApi<GetQueueReq, GetQueueRes>({
        api: getQueue,
        body: undefined,
        router: navigate,
      })
    },
    refetchInterval: 5000,
  })

  return (
    <div className="flex flex-col gap-3">
      {data?.map((item: GetQueueRes[number]) => (
        <QueueItem item={item}/>
      ))}
    </div>
  );
};

export default Queues;