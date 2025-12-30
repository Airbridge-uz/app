import { UserProfile } from "@/features/user/ui/user-profile"
import { cn } from "@/shared/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/shared/ui/sidebar"
import { ModeToggle as ThemeToggleWidget } from "@/widgets/theme-toggle"
import { ChatHistorySidebar } from "@/widgets/trip-planner/ui/chat-history-sidebar"
import { Link, useLocation, useNavigate } from "@tanstack/react-router"
import { Briefcase, Heart, MessageSquare, Sparkles } from "lucide-react"
import { type ReactNode, useState } from "react"

const sidebarItems = [
  { icon: MessageSquare, label: "Chats", to: "/chat" },
  { icon: Briefcase, label: "Trips", to: "/trips" },
  { icon: Heart, label: "Saved", to: "/saved" },
]

function AppSidebar() {
  const location = useLocation()
  const [isChatsOpen, setIsChatsOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="relative flex h-full">
      <Sidebar
        collapsible="none"
        className="w-[72px] border-r border-border bg-background z-50"
      >
        <SidebarHeader className="flex items-center justify-center py-6">
          <Link
            to="/"
            className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            <Sparkles className="size-5 text-primary-foreground" />
          </Link>
        </SidebarHeader>

        <SidebarContent className="flex flex-col items-center gap-4 py-4">
          <SidebarMenu className="items-center gap-2">
            {sidebarItems.map((item) => (
              <SidebarMenuItem
                onMouseEnter={
                  item.to === "/chat" ? () => setIsChatsOpen(true) : undefined
                }
                key={item.label}
              >
                <SidebarMenuButton
                  isActive={location.pathname.includes(item.to)}
                  className="size-12 rounded-xl justify-center"
                  onClick={() => {
                    navigate({ to: item.to })
                  }}
                >
                  <div title={item.label}>
                    <item.icon className="size-6" />
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="flex flex-col items-center gap-4 pb-8">
          <ThemeToggleWidget />

          <UserProfile isCollapsed />
        </SidebarFooter>
      </Sidebar>

      {isChatsOpen && (
        <button
          className="fixed inset-0 z-30"
          onClick={() => setIsChatsOpen(false)}
          type="button"
        />
      )}

      <div
        className={cn(
          "fixed left-[72px] top-0 bottom-0 z-40 transition-all duration-300 ease-in-out pointer-events-none",
          isChatsOpen
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "-translate-x-full opacity-0",
        )}
      >
        <div className="h-full w-80 bg-background/80 backdrop-blur-xl border-r border-border shadow-2xl">
          <ChatHistorySidebar />
        </div>
      </div>
    </div>
  )
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-hidden relative">{children}</main>
      </div>
    </SidebarProvider>
  )
}
