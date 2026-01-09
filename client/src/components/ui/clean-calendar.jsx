import * as React from "react"
import { Calendar } from "./calendar"
import { cn } from "@/lib/utils"
export function CleanCalendar(props) {
  return (
    <Calendar
      {...props}
      className={cn(
        "p-4 rounded-xl",
        "[&_.rdp-day]:h-10 [&_.rdp-day]:w-10",
        "[&_.rdp-day]:rounded-md",
        "[&_.rdp-day]:text-sm",
        "[&_.rdp-day]:font-medium",
        "[&_.rdp-day]:flex [&_.rdp-day]:items-center [&_.rdp-day]:justify-center",
        "[&_.rdp-day:hover]:bg-accent",
        "[&_.rdp-day_selected]:bg-primary [&_.rdp-day_selected]:text-primary-foreground",
        "[&_.rdp-day_range_start]:rounded-l-md",
        "[&_.rdp-day_range_end]:rounded-r-md",
        "[&_.rdp-day_range_middle]:bg-primary/10",
        "[&_.rdp-caption]:mb-4",
        "[&_.rdp-caption_label]:text-base [&_.rdp-caption_label]:font-semibold",
        "[&_.rdp-nav_button]:h-8 [&_.rdp-nav_button]:w-8",
        "[&_.rdp-head_cell]:text-xs [&_.rdp-head_cell]:text-muted-foreground",
        "[&_.rdp-table]:border-separate [&_.rdp-table]:border-spacing-2"
      )}
    />
  )
}
