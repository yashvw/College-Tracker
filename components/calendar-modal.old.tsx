"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

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

  if (!isOpen) return null

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Add Task</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Calendar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-800 rounded-lg transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold">{monthName}</h3>
            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-800 rounded-lg transition">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-gray-500 text-sm font-medium py-2">
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
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square rounded-lg font-medium transition ${
                    isSelected
                      ? "bg-green-500 text-black"
                      : isToday
                        ? "bg-gray-800 border-2 border-green-500 text-white"
                        : "bg-gray-800 text-white hover:bg-gray-700"
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>

        {/* Task Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Task Title</label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Enter task title"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Task Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="taskType"
                  value="exam"
                  checked={taskType === "exam"}
                  onChange={(e) => setTaskType(e.target.value as "exam" | "assignment")}
                  className="w-4 h-4 accent-green-500"
                />
                <span className="text-white">Exam</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="taskType"
                  value="assignment"
                  checked={taskType === "assignment"}
                  onChange={(e) => setTaskType(e.target.value as "exam" | "assignment")}
                  className="w-4 h-4 accent-green-500"
                />
                <span className="text-white">Assignment</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Remind me X days before (optional)</label>
            <input
              type="number"
              value={remindDaysBefore}
              onChange={(e) => setRemindDaysBefore(Math.max(0, Number.parseInt(e.target.value) || 0))}
              placeholder="0"
              min="0"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition"
            />
          </div>

          {selectedDate && (
            <div className="text-sm text-gray-400">
              Selected Date: <span className="text-green-500 font-semibold">{selectedDate}</span>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 transition rounded-lg font-medium text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTask}
              disabled={!taskTitle.trim() || !selectedDate}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                taskTitle.trim() && selectedDate
                  ? "bg-green-500 hover:bg-green-600 text-black cursor-pointer"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
            >
              Add Task
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
