"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, X, Eye, EyeOff } from "lucide-react"

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-2xl p-8 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Tasks Calendar</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {showSummary && (
            <div className="col-span-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border border-gray-700 flex flex-col relative max-h-96 lg:max-h-none">
              <button
                onClick={() => setShowSummary(false)}
                className="absolute top-2 right-2 p-2 hover:bg-gray-700 rounded-lg transition bg-gray-800"
                title="Hide summary"
              >
                <EyeOff className="w-5 h-5 text-gray-300" />
              </button>
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Attendance Summary</h3>

              {allTags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedTags([])}
                    className={`px-2 py-1 rounded text-xs font-medium transition ${
                      selectedTags.length === 0
                        ? "bg-green-500 text-black"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    All
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTags(selectedTags.includes(tag) ? [] : [tag])
                      }}
                      className={`px-2 py-1 rounded text-xs font-medium transition ${
                        selectedTags.includes(tag)
                          ? "bg-green-500 text-black"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-2">
                {subjectsWithPercentages.length === 0 ? (
                  <p className="text-gray-400 text-xs text-center py-4">No subjects</p>
                ) : (
                  subjectsWithPercentages.map((subject) => (
                    <div key={subject.id} className="text-sm">
                      <p style={{ color: subject.glowColor }} className="font-semibold">
                        [{subject.percentage}%] - {subject.name}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {!showSummary && (
            <div className="col-span-1 flex items-center justify-center">
              <button
                onClick={() => setShowSummary(true)}
                className="flex flex-col items-center gap-2 p-4 hover:bg-gray-800 rounded-lg transition bg-gray-800"
                title="Show summary"
              >
                <Eye className="w-6 h-6 text-green-500" />
                <span className="text-xs font-medium text-gray-300">View Summary</span>
              </button>
            </div>
          )}

          {/* Calendar and Tasks Section */}
          <div className={showSummary ? "col-span-1 lg:col-span-3" : "col-span-1 lg:col-span-4"}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar Section */}
              <div className="lg:col-span-2">
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
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center text-gray-500 text-xs sm:text-sm font-medium py-2">
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
                      <button
                        key={day}
                        onClick={() => handleDateClick(day)}
                        className={`aspect-square rounded-lg font-medium transition relative text-sm ${
                          isSelected
                            ? "bg-gray-700 border-2 border-white text-white"
                            : isToday
                              ? "bg-gray-800 border-2 border-white text-white"
                              : "bg-gray-800 text-white hover:bg-gray-700"
                        }`}
                      >
                        {day}
                        {hasTask && <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Tasks Preview Section */}
              <div className="bg-gray-800 rounded-lg p-4 flex flex-col">
                <h3 className="text-lg font-semibold mb-4">
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </h3>

                <div className="flex-1 overflow-y-auto mb-4">
                  {tasksForSelectedDate.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No tasks to be completed :)</p>
                  ) : (
                    <div className="space-y-3">
                      {tasksForSelectedDate.map((task) => (
                        <div key={task.id} className="bg-gray-700 rounded p-3 text-sm">
                          <p className="text-white font-medium">{task.title}</p>
                          <p className="text-gray-400 text-xs mt-1">{task.type === "exam" ? "Exam" : "Assignment"}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {tasksForSelectedDate.length > 0 && (
                  <button
                    onClick={() => {
                      tasksForSelectedDate.forEach((task) => {
                        onResolveTask(task.id)
                      })
                    }}
                    className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition"
                  >
                    Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
