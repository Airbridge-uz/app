import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/saved/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/saved/"!</div>
}
