import * as React from "react"
import {
  GalleryVerticalEnd,
  File,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "Adonis Willer",
    email: "admin@nmtung.dev",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Export services",
      logo: GalleryVerticalEnd,
      plan: "Oh hey, you!",
    },
  ],
  navMain: [
    {
      title: "Queue",
      url: "/queue",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/queue/dashboard",
        },
      ],
    },
    {
      title: "File",
      url: "/file",
      icon: File,
      isActive: true,
      items: [
        {
          title: "Templates",
          url: "/file/templates",
        },
        {
          title: "Results",
          url: "/file/results",
        },
      ],
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
