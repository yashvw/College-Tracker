"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Eye, EyeOff, CheckCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  dueDate: string
  type: "exam" | "assignment"
}

interface TaskPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  tasks: Task[]
  onResolveTask: (taskId: string) => void
  subjects?: Array<{
    id: string
    name: string
    attended: number
    missed: number
    glowColor: string
    tags: string[]
  }>
  allTags?: string[]
  initialSelectedTags?: string[]
}

export default function TaskPreviewModal({
  isOpen,
  onClose,
  tasks,
  onResolveTask,
  subjects = [],
  allTags = [],
  initialSelectedTags = [],
}: TaskPreviewModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState<string>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
  )
  const [showSummary, setShowSummary] = useState(true)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      const today = new Date()
      setSelectedDate(
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
      )
      setSelectedTags([])
    }
  }, [isOpen])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleDateClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    setSelectedDate(dateStr)
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const tasksForSelectedDate = tasks.filter((task) => task.dueDate === selectedDate)

  const datesWithTasks = new Set(tasks.map((task) => task.dueDate))

  const getLocalDateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  }

  const filteredSubjects =
    selectedTags.length === 0
      ? subjects
      : subjects.filter((subject) => selectedTags.some((tag) => subject.tags?.includes(tag)))

  const subjectsWithPercentages = filteredSubjects.map((subject) => {
    const total = subject.attended + subject.missed
    const percentage = total > 0 ? Math.round((subject.attended / total) * 100) : 0
    return { ...subject, percentage }
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tasks Calendar</DialogTitle>
          <DialogDescription>
            View your exams and assignments on a calendar
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-4">
          {showSummary && (
            <div className="col-span-1">
              <Card className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Attendance Summary</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSummary(false)}
                      className="h-8 w-8"
                      title="Hide summary"
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {allTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={selectedTags.length === 0 ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedTags([])}
                      >
                        All
                      </Badge>
                      {allTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedTags(selectedTags.includes(tag) ? [] : [tag])
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {subjectsWithPercentages.length === 0 ? (
                      <p className="text-muted-foreground text-xs text-center py-4">No subjects</p>
                    ) : (
                      subjectsWithPercentages.map((subject) => (
                        <div key={subject.id} className="text-sm flex items-center gap-2">
                          <span className="font-semibold" style={{ color: subject.glowColor }}>
                            {subject.percentage}%
                          </span>
                          <span className="text-muted-foreground">-</span>
                          <span className="flex-1">{subject.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!showSummary && (
            <div className="col-span-1 flex items-center justify-center">
              <Button
                variant="outline"
                onClick={() => setShowSummary(true)}
                className="flex-col h-auto py-4"
                title="Show summary"
              >
                <Eye className="h-6 w-6 mb-2" />
                <span className="text-xs">View Summary</span>
              </Button>
            </div>
          )}

          {/* Calendar and Tasks Section */}
          <div className={showSummary ? "col-span-1 lg:col-span-3" : "col-span-1 lg:col-span-4"}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <h3 className="text-lg font-semibold">{monthName}</h3>
                  <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center text-muted-foreground text-xs sm:text-sm font-medium py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {emptyDays.map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  {days.map((day) => {
                    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                    const isSelected = selectedDate === dateStr
                    const isToday = dateStr === getLocalDateString(new Date())
                    const hasTask = datesWithTasks.has(dateStr)

                    return (
                      <Button
                        key={day}
                        variant={isSelected ? "default" : isToday ? "outline" : "ghost"}
                        onClick={() => handleDateClick(day)}
                        className={cn(
                          "aspect-square relative text-sm font-medium p-0",
                          isToday && "border-primary border-2",
                          isSelected && "ring-2 ring-primary"
                        )}
                      >
                        {day}
                        {hasTask && (
                          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-destructive rounded-full" />
                        )}
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Tasks Preview Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {tasksForSelectedDate.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground text-sm">No tasks for this day</p>
                        <p className="text-muted-foreground text-xs mt-1">Select a date with a red dot</p>
                      </div>
                    ) : (
                      tasksForSelectedDate.map((task) => (
                        <Card key={task.id} className="border-l-4 border-l-primary">
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{task.title}</p>
                                <Badge variant={task.type === "exam" ? "default" : "secondary"} className="mt-1 text-xs">
                                  {task.type === "exam" ? "Exam" : "Assignment"}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>

                  {tasksForSelectedDate.length > 0 && (
                    <Button
                      onClick={() => {
                        tasksForSelectedDate.forEach((task) => {
                          onResolveTask(task.id)
                        })
                      }}
                      className="w-full"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark All Resolved
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
