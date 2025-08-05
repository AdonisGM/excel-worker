import {createFileRoute, Outlet} from '@tanstack/react-router'
import Queues from "@/components/agm/queue/queues.tsx";

export const Route = createFileRoute('/queue/manage')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className={'flex flex-row h-full'}>
    <div className={'w-96 bg-gray-100 p-4'}>
      <Queues/>
    </div>
    <div className={'flex-1 overflow-y-auto'}>
      <Outlet/>
    </div>
  </div>
}
