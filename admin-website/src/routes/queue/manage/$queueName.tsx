import {createFileRoute} from '@tanstack/react-router'
import {Button} from "@/components/ui/button.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import TableJobList from "@/components/agm/queue/table-job-list.tsx";

export const Route = createFileRoute('/queue/manage/$queueName')({
  component: RouteComponent,
})

function RouteComponent() {
  const {queueName} = Route.useParams();

  return <div className={'flex flex-col gap-4 p-4'}>
    <div className={'text-center'}>
      <h1 className={'text-gray-800 font-bold'}>Queue name: <span>{queueName}</span></h1>
      <div className={'text-gray-600 text-xs mt-3'}>
        <p>Manage the queue here, you can add or remove items, view the queue status, and perform other management tasks.</p>
        <p>This queue only save last 30 items completed, failed.</p>
        <br/>
        <p className={'text-red-500 font-bold'}>Note: This is a management page, and any changes you make here will affect the queue directly.</p>
      </div>
    </div>
    <Separator orientation={'horizontal'}/>
    <div className={'grid grid-cols-3 gap-4'}>
      <div>
      </div>
      <div className={'flex items-center justify-between'}>
        <Separator orientation={'vertical'}/>
        <div>
          <p className={'text-gray-600 text-xs text-center mb-3 font-bold'}>Queue controller</p>
          <div className={'flex items-center gap-2'}>
            <Button
              size={'xs'}
            >
              In-Queue
            </Button>
            <Button
              size={'xs'}
            >
              De-Queue
            </Button>
          </div>
        </div>
        <Separator orientation={'vertical'}/>
      </div>
      <div>
        <p className={'text-gray-600 text-xs text-center mb-3 font-bold'}>Queue Status</p>
        <div className={'grid grid-cols-2 mt-2 gap-1 text-xs'}>
          <p><span className={'h-2 w-2 inline-block mr-1 rounded-full bg-lime-500'}/>All: {0}</p>
          <p><span className={'h-2 w-2 inline-block mr-1 rounded-full bg-blue-500'}/>Active: {0}</p>
          <p><span className={'h-2 w-2 inline-block mr-1 rounded-full bg-gray-500'}/>Waiting: {0}</p>
          <p><span className={'h-2 w-2 inline-block mr-1 rounded-full bg-green-500'}/>Completed: {0}</p>
          <p><span className={'h-2 w-2 inline-block mr-1 rounded-full bg-red-500'}/>Failed: {0}</p>
          <p><span className={'h-2 w-2 inline-block mr-1 rounded-full bg-yellow-500'}/>Delayed: {0}</p>
        </div>
      </div>
    </div>
    <Separator orientation={'horizontal'}/>
    <TableJobList queueName={queueName}/>
  </div>
}
