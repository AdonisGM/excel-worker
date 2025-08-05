import { createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import MainLayout from "@/components/main-layout.tsx";

export const Route = createRootRoute({
  component: () => (
    <div>
      <MainLayout/>
      <TanStackRouterDevtools position={'top-right'} />
      <ReactQueryDevtools initialIsOpen={false} />
    </div>
  ),
})