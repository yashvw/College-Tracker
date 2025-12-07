"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface CalendarModalProps {
  isOpen: boolean
  onClose: () => void
  onAddTask: (task: { title: string; dueDate: string; type: "exam" | "assignment"; remindDaysBefore: number }) => void
}

export default function CalendarModal({ isOpen, onClose, onAddTask }: CalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().split("T")[0])
  const [taskTitle, setTaskTitle] = useState("")
  const [taskType, setTaskType] = useState<"exam" | "assignment">("exam")
  const [remindDaysBefore, setRemindDaysBefore] = useState(0)

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
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, "0")
    const dayStr = String(day).padStart(2, "0")
    const dateStr = `${year}-${month}-${dayStr}`
    setSelectedDate(dateStr)
  }

  const handleAddTask = () => {
    if (taskTitle.trim() && selectedDate) {
      onAddTask({
        title: taskTitle,
        dueDate: selectedDate,
        type: taskType,
        remindDaysBefore,
      })
      setTaskTitle("")
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, "0")
      const day = String(today.getDate()).padStart(2, "0")
      setSelectedDate(`${year}-${month}-${day}`)
      setTaskType("exam")
      setRemindDaysBefore(0)
    }
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>
            Schedule an exam or assignment with a due date
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Calendar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h3 className="text-lg font-semibold">{monthName}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-muted-foreground text-sm font-medium py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {days.map((day) => {
                const year = currentDate.getFullYear()
                const month = String(currentDate.getMonth() + 1).padStart(2, "0")
                const dayStr = String(day).padStart(2, "0")
                const dateStr = `${year}-${month}-${dayStr}`
                const isSelected = selectedDate === dateStr
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
                const isToday = dateStr === todayStr

                return (
                  <Button
                    key={day}
                    variant={isSelected ? "default" : isToday ? "outline" : "ghost"}
                    onClick={() => handleDateClick(day)}
                    className={`aspect-square p-0 ${
                      isToday && !isSelected ? "border-primary border-2" : ""
                    }`}
                  >
                    {day}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Task Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>

            <div className="space-y-2">
              <Label>Task Type</Label>
              <RadioGroup value={taskType} onValueChange={(value) => setTaskType(value as "exam" | "assignment")}>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="exam" id="exam" />
                    <Label htmlFor="exam" className="font-normal cursor-pointer">Exam</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="assignment" id="assignment" />
                    <Label htmlFor="assignment" className="font-normal cursor-pointer">Assignment</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remind-days">Remind me X days before (optional)</Label>
              <Input
                id="remind-days"
                type="number"
                value={remindDaysBefore}
                onChange={(e) => setRemindDaysBefore(Math.max(0, Number.parseInt(e.target.value) || 0))}
                placeholder="0"
                min="0"
              />
            </div>

            {selectedDate && (
              <Card className="p-3 bg-muted">
                <p className="text-sm text-muted-foreground">
                  Selected Date: <span className="text-primary font-semibold">{selectedDate}</span>
                </p>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleAddTask}
              disabled={!taskTitle.trim() || !selectedDate}
              className="flex-1"
            >
              Add Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
