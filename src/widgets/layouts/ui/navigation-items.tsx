import {
  Bell,
  Calendar,
  Heart,
  MapPin,
  MessageSquare,
  Plus,
  Settings,
} from "lucide-react"

export interface NavigationItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href?: string
  onClick?: () => void
}

export const navigationItems: NavigationItem[] = [
  {
    icon: MessageSquare,
    label: "Chats",
    href: "/app/chat",
  },
  {
    icon: Calendar,
    label: "My Trips",
    href: "/app/trips",
  },
  {
    icon: MapPin,
    label: "Explore",
    href: "/app/explore",
  },
  {
    icon: Heart,
    label: "Saved",
    href: "/app/saved",
  },
  {
    icon: Bell,
    label: "Notifications",
    href: "/app/notifications",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/app/settings",
  },
]

export const quickActions: NavigationItem[] = [
  {
    icon: Plus,
    label: "New Trip",
    onClick: () => {
      // Handle new trip creation
    },
  },
]
