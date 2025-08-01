import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/file/templates')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/file/templates"!</div>
}
