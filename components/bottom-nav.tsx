"use client"

import { GraduationCap, Calendar, CheckSquare, Target } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export default function BottomNav({ currentPage, onPageChange }: BottomNavProps) {
  const navItems = [
    { id: "attendance", icon: GraduationCap, label: "Attendance" },
    { id: "todos", icon: CheckSquare, label: "Todos" },
    { id: "habits", icon: Target, label: "Habits" },
    { id: "exams", icon: Calendar, label: "Exams" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border px-2 sm:px-4 py-2 sm:py-3 safe-area-inset-bottom z-50">
      <div className="flex items-center justify-between max-w-full mx-auto gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-3 sm:px-4 rounded-lg transition-all flex-1",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6", isActive && "scale-110")} />
              <span className="text-[10px] sm:text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
