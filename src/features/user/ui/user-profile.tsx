import { cn } from "@/shared/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { Link, useNavigate } from "@tanstack/react-router"

interface UserProfileProps {
  user?: {
    name: string
    email: string
    avatar?: string
  }
  isCollapsed?: boolean
}

export function UserProfile({ user, isCollapsed }: UserProfileProps) {
  const navigate = useNavigate()

  const defaultUser = user || {
    name: "Hayitbek",
    email: "hayitbek@example.com",
  }

  const initials = defaultUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const handleLogout = () => {
    // Handle logout logic
    navigate({ to: "/auth/login" })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-3 rounded-xl hover:bg-sidebar-accent transition-colors",
          isCollapsed ? "p-0" : "px-2 py-2 w-full",
        )}
      >
        <Avatar className="size-10 shadow-sm">
          <AvatarImage src={defaultUser.avatar} alt={defaultUser.name} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <div className="flex flex-col items-start flex-1 min-w-0">
            <span className="text-sm font-medium truncate">
              {defaultUser.name}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {defaultUser.email}
            </span>
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link to="/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link to="/settings">Settings</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
