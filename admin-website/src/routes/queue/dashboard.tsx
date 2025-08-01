import { createFileRoute } from '@tanstack/react-router'
import Status from "@/components/agm/dashboard/status.tsx";

export const Route = createFileRoute('/queue/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl">
          <Status/>
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" >
        <div className="flex h-full items-center justify-center">
          <div className="text-muted-foreground">No data available</div>
        </div>
      </div>
    </div>
  </div>
}
