import { cn } from "@/shared/lib/utils"
import type { LucideIcon } from "lucide-react"

interface SuggestionCardProps {
  title: string
  description?: string
  image?: string
  icon?: LucideIcon
  onClick?: () => void
  className?: string
}

export function SuggestionCard({
  title,
  description,
  image,
  icon: Icon,
  onClick,
  className,
}: SuggestionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-lg",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className,
      )}
    >
      {/* Background Image */}
      {image && (
        <div className="absolute inset-0">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-black/20" />
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          "relative p-4 flex flex-col items-start justify-end min-h-[120px]",
          !image && "bg-muted",
        )}
      >
        {Icon && !image && <Icon className="size-6 text-primary mb-2" />}
        <h3
          className={cn(
            "text-sm font-semibold text-left",
            image ? "text-white" : "text-foreground",
          )}
        >
          {title}
        </h3>
        {description && (
          <p
            className={cn(
              "text-xs mt-1 text-left",
              image ? "text-white/90" : "text-muted-foreground",
            )}
          >
            {description}
          </p>
        )}
      </div>
    </button>
  )
}
