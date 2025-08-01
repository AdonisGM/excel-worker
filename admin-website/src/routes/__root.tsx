import { createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import MainLayout from "@/components/main-layout.tsx";

export const Route = createRootRoute({
  component: () => (
    <div>
      <MainLayout/>
      <TanStackRouterDevtools />
    </div>
  ),
})