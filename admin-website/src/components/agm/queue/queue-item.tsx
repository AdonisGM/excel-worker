import {Card, CardContent} from "@/components/ui/card.tsx";
import type {GetQueueRes} from "@/apis/dictionary/get-queue.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {Link} from "@tanstack/react-router";
import ExcelIcon from "@/assets/excel-svgrepo-com.svg";
import WordIcon from "@/assets/word-svgrepo-com.svg";

const QueueItem = (props: { item: GetQueueRes[number] }) => {
  return (
    <Link
      to={`/queue/manage/$queueName`}
      params={{queueName: props.item.name}}
    >
      {(state) => (
        <Card className={`p-2 cursor-pointer ${state.isActive && 'bg-gray-800 text-white'}`}>
          <CardContent className={'text-sm text-gray-700 px-2'}>
            <div className={'flex items-center justify-between'}>
              <div className={'flex items-center gap-2'}>
                <div>
                  {
                    props.item.name.includes('word') ? (
                      <img src={WordIcon} alt="WordIcon" height={16} width={16}/>
                    ) : (
                      <img src={ExcelIcon} alt="WordIcon" height={16} width={16}/>
                    )
                  }
                </div>
                <p className={`font-semibold ${state.isActive && 'text-white'}`}>{props.item.name}</p>
              </div>
              <div className={'flex items-center gap-2'}>
                <Badge
                  variant="secondary"
                  className={props.item.isPaused ? 'bg-red-700 text-white' : 'bg-green-700 text-white'}
                >Enqueue</Badge>
                <Badge
                  variant="secondary"
                  className={props.item.isPaused ? 'bg-red-700 text-white' : 'bg-green-700 text-white'}
                >Dequeue</Badge>
              </div>
            </div>
            <div className={'grid grid-cols-3 mt-5 gap-1 text-xs'}>
              <p className={`${state.isActive && 'text-white'}`}><span
                className={`h-2 w-2 inline-block mr-1 rounded-full bg-lime-500`}/>All: {props.item.count}</p>
              <p className={`${state.isActive && 'text-white'}`}><span
                className={'h-2 w-2 inline-block mr-1 rounded-full bg-green-500'}/>Completed: {props.item.completedCount}
              </p>
              <p className={`${state.isActive && 'text-white'}`}><span
                className={'h-2 w-2 inline-block mr-1 rounded-full bg-red-500'}/>Failed: {props.item.failedCount}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </Link>
  );
}

export default QueueItem;