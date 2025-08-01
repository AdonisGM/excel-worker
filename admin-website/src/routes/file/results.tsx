import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/file/results')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/file/results"!</div>
}
