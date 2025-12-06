"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNotifications } from "@/hooks/use-notifications"
import AttendanceCard from "@/components/attendance-card"
import BottomNav from "@/components/bottom-nav"
import AddSubjectModal from "@/components/add-subject-modal"
import CalendarModal from "@/components/calendar-modal"
import TaskPreviewModal from "@/components/task-preview-modal"
import TutorialModal from "@/components/tutorial-modal"
import TagManagementModal from "@/components/tag-management-modal"
import EditSubjectModal from "@/components/edit-subject-modal"
import TodoListModal from "@/components/todo-list-modal"
import HabitTrackerModal from "@/components/habit-tracker-modal"

import { InfoIcon, BellIcon, SettingsIcon, CalendarIcon, PlusIcon } from "@/components/icons"
import { X } from "lucide-react"
import NotificationSchedule from '@/components/notification-schedule'
import ClientDate from "@/components/client-date"

interface Subject {
  id: string
  name: string
  attended: number
  missed: number
  requirement: number
  glowColor: string
  tags: string[]
}

interface Task {
  id: string
  title: string
  dueDate: string
  type: "exam" | "assignment"
  remindDaysBefore?: number
}

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

interface Habit {
  id: string
  name: string
  completions: Record<string, boolean>
  createdAt: string
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isTaskPreviewOpen, setIsTaskPreviewOpen] = useState(false)
  const [isDeadlinePreviewOpen, setIsDeadlinePreviewOpen] = useState(false)
  const [isTagManagementOpen, setIsTagManagementOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState("attendance")
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [showTutorial, setShowTutorial] = useState(false)
  const [hasSeenTutorial, setHasSeenTutorial] = useState(true)
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [currentDate, setCurrentDate] = useState<string>("")
  const [todos, setTodos] = useState<Todo[]>([])
  const [binTodos, setBinTodos] = useState<Todo[]>([])
  const [lastBinClearDate, setLastBinClearDate] = useState<string>("")
  const [habits, setHabits] = useState<Habit[]>([])

  const [isScheduleOpen, setIsScheduleOpen] = useState(false)

  const { notificationSupported, notificationPermission, enableNotifications } = useNotifications()

  useEffect(() => {
    const updateDate = () => {
      const now = new Date()
      const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
      const formattedDate = now.toLocaleDateString("en-US", options).toUpperCase()
      setCurrentDate(formattedDate)
    }

    updateDate()
    const interval = setInterval(updateDate, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const savedSubjects = localStorage.getItem("subjects")
    const savedTasks = localStorage.getItem("tasks")
    const savedTags = localStorage.getItem("tags")
    const tutorialSeen = localStorage.getItem("tutorialSeen")
    const savedTodos = localStorage.getItem("todos")
    const savedBinTodos = localStorage.getItem("binTodos")
    const savedBinClearDate = localStorage.getItem("binClearDate")
    const savedHabits = localStorage.getItem("habits")

    if (savedSubjects) {
      const parsedSubjects = JSON.parse(savedSubjects)
      setSubjects(parsedSubjects)
      const tags = Array.from(new Set(parsedSubjects.flatMap((s: Subject) => s.tags || [])))
      setAllTags(tags as string[])
    }

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }

    if (savedTags) {
      setAllTags(JSON.parse(savedTags))
    }

    if (savedTodos) {
      setTodos(JSON.parse(savedTodos))
    }

    if (savedBinTodos) {
      setBinTodos(JSON.parse(savedBinTodos))
    }

    const today2 = new Date().toDateString()
    if (savedBinClearDate && savedBinClearDate !== today2) {
      setBinTodos([])
      localStorage.setItem("binClearDate", today2)
    } else if (!savedBinClearDate) {
      localStorage.setItem("binClearDate", today2)
    }
    setLastBinClearDate(today2)

    if (!tutorialSeen) {
      setShowTutorial(true)
      setHasSeenTutorial(false)
    }

    if (savedHabits) {
      setHabits(JSON.parse(savedHabits))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("subjects", JSON.stringify(subjects))
  }, [subjects])

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem("tags", JSON.stringify(allTags))
  }, [allTags])

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    localStorage.setItem("binTodos", JSON.stringify(binTodos))
  }, [binTodos])

  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits))
  }, [habits])

  useEffect(() => {
    const checkTaskReminders = () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      tasks.forEach((task) => {
        if ((task.remindDaysBefore || 0) > 0) {
          const taskDate = new Date(task.dueDate)
          taskDate.setHours(0, 0, 0, 0)
          const reminderDate = new Date(taskDate)
          reminderDate.setDate(reminderDate.getDate() - (task.remindDaysBefore || 0))

          if (today.getTime() === reminderDate.getTime()) {
            // Send notification logic would go here
            // For now, send a push notification directly
          }
        }
      })
    }

    checkTaskReminders()
  }, [tasks])

  useEffect(() => {
    const checkBackupReminder = () => {
      // Backup reminder logic removed - notifications handled via push notifications
    }

    checkBackupReminder()
  }, [])

  const handleAddSubject = (subject: {
    name: string
    attended: number
    missed: number
    requirement: number
    glowColor: string
    tags: string[]
  }) => {
    setSubjects([
      ...subjects,
      {
        id: Date.now().toString(),
        ...subject,
      },
    ])
    const newTags = subject.tags.filter((tag) => !allTags.includes(tag))
    if (newTags.length > 0) {
      setAllTags([...allTags, ...newTags])
    }
    setIsModalOpen(false)
  }

  const handleEditSubject = (subjectId: string, updates: Partial<Subject>) => {
    setSubjects(subjects.map((s) => (s.id === subjectId ? { ...s, ...updates } : s)))
    const newTags = (updates.tags || []).filter((tag) => !allTags.includes(tag))
    if (newTags.length > 0) {
      setAllTags([...allTags, ...newTags])
    }
    setIsEditModalOpen(false)
    setEditingSubjectId(null)
  }

  const handleDeleteSubject = (subjectId: string) => {
    setSubjects(subjects.filter((s) => s.id !== subjectId))
  }

  const handleUpdateSubject = (subjectId: string, updates: Partial<Subject>) => {
    setSubjects(subjects.map((s) => (s.id === subjectId ? { ...s, ...updates } : s)))
  }

  const handleDeleteTag = (tagToDelete: string) => {
    setAllTags(allTags.filter((tag) => tag !== tagToDelete))
    setSubjects(
      subjects.map((subject) => ({
        ...subject,
        tags: subject.tags.filter((tag) => tag !== tagToDelete),
      })),
    )
    if (selectedTags.includes(tagToDelete)) {
      setSelectedTags([])
    }
  }

  const handleResetAllData = () => {
    setSubjects([])
    setTasks([])
    setAllTags([])
    setSelectedTags([])
    setTodos([])
    setBinTodos([])
    setHabits([])
    localStorage.removeItem("subjects")
    localStorage.removeItem("tasks")
    localStorage.removeItem("tags")
    localStorage.removeItem("todos")
    localStorage.removeItem("binTodos")
    localStorage.removeItem("habits")
  }

  const handleAddTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    setTodos([newTodo, ...todos])
  }

  const handleToggleTodo = (id: string) => {
    const todo = todos.find((t) => t.id === id)
    if (todo) {
      setTodos(todos.filter((t) => t.id !== id))
      setBinTodos([...binTodos, { ...todo, completed: true }])
    }
  }

  const handleDeleteTodo = (id: string) => {
    const todo = todos.find((t) => t.id === id)
    if (todo) {
      setTodos(todos.filter((t) => t.id !== id))
      setBinTodos([...binTodos, todo])
    }
  }

  const handleRestoreTodo = (id: string) => {
    const todo = binTodos.find((t) => t.id === id)
    if (todo) {
      setBinTodos(binTodos.filter((t) => t.id !== id))
      setTodos([{ ...todo, completed: false }, ...todos])
    }
  }

  const getUpcomingTasksInfo = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const upcomingTasks = tasks.filter((task) => {
      const dueDate = new Date(task.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate >= today
    })

    if (upcomingTasks.length === 0) return null

    const closestTask = upcomingTasks.reduce((closest, task) => {
      const taskDate = new Date(task.dueDate)
      const closestDate = new Date(closest.dueDate)
      return taskDate < closestDate ? task : closest
    })

    const closestDate = new Date(closestTask.dueDate)
    closestDate.setHours(0, 0, 0, 0)
    const tasksOnClosestDate = upcomingTasks.filter((task) => {
      const taskDate = new Date(task.dueDate)
      taskDate.setHours(0, 0, 0, 0)
      return taskDate.getTime() === closestDate.getTime()
    })

    const daysUntil = Math.floor((closestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const hasOtherDeadlines = upcomingTasks.length > tasksOnClosestDate.length

    return {
      count: tasksOnClosestDate.length,
      daysUntil,
      hasOtherDeadlines,
      totalTasks: upcomingTasks.length,
    }
  }

  const handleResolveTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId))
  }

  const filteredSubjects =
    selectedTags.length === 0
      ? subjects
      : subjects.filter((subject) => selectedTags.some((tag) => subject.tags?.includes(tag)))

  const upcomingInfo = getUpcomingTasksInfo()

  const handleAddHabit = (name: string) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      completions: {},
      createdAt: new Date().toISOString(),
    }
    setHabits([newHabit, ...habits])
  }

  const handleDeleteHabit = (id: string) => {
    setHabits(habits.filter((h) => h.id !== id))
  }

  const handleToggleHabit = (id: string, date: string) => {
    setHabits(
      habits.map((h) => {
        if (h.id === id) {
          const currentStatus = h.completions[date]
          return {
            ...h,
            completions: {
              ...h.completions,
              [date]: currentStatus === true ? false : true,
            },
          }
        }
        return h
      }),
    )
  }

  const handleExportHabitCSV = async (habitsToExport: Habit[], exportMonth?: string) => {
    // If an exportMonth is provided (format "YYYY-MM"), use that month; otherwise use current month
    let year: number
    let month: number
    if (exportMonth) {
      const [y, m] = exportMonth.split("-")
      year = parseInt(y)
      month = parseInt(m) - 1
    } else {
      const today = new Date()
      year = today.getFullYear()
      month = today.getMonth()
    }
    const monthName = new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })

    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    // Debug
    console.log("Exporting habits:", habitsToExport)
    habitsToExport.forEach(h => {
      console.log(`Habit "${h.name}" completions:`, h.completions)
    })

    const ExcelJS = (await import("exceljs")).default
    const workbook = new ExcelJS.Workbook()
    
    habitsToExport.forEach((habit) => {
      const worksheet = workbook.addWorksheet(habit.name.substring(0, 31))

      // Title (merged across columns A-G, two rows tall)
      const titleRow = worksheet.addRow([`${habit.name} - ${monthName}`])
      const startTitleRow = titleRow.number
      const endTitleRow = startTitleRow + 1
      // Merge across 7 columns (A..G) and two rows for a large title area
      worksheet.mergeCells(startTitleRow, 1, endTitleRow, 7)
      const mergedTitleCell = worksheet.getCell(startTitleRow, 1)
      mergedTitleCell.value = `${habit.name} - ${monthName}`
      mergedTitleCell.font = { bold: true, size: 18, color: { argb: "FFFFFFFF" } }
      mergedTitleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF6B7280" }, // gray background
      }
      mergedTitleCell.alignment = { horizontal: "center", vertical: "middle" }

      // Add an empty row after the merged title block (this will be the second merged row)
      worksheet.addRow([])

      // Day headers
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      const headerRow = worksheet.addRow(dayNames)
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF1f2937" },
        }
        cell.alignment = { horizontal: "center", vertical: "middle" }
      })

      // Fill calendar
      let currentDate = new Date(startDate)
      const endOfMonth = new Date(year, month + 1, 0) // Last day of month
      
      while (true) {
        const weekRow: string[] = []
        const weekData: Array<{ text: string; completed: boolean; missed: boolean; isMonth: boolean }> = []
        
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
          let cellText = ""
          let isMonth = currentDate.getMonth() === month
          let completed = false
          let missed = false
          
          if (isMonth) {
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`
            const status = habit.completions?.[dateStr]

            cellText = String(currentDate.getDate())

            // Treat undefined (no entry) for past dates as missed. For future dates, leave empty marker.
            const todayDate = new Date()
            const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
            const todayOnly = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())

            if (status === true) {
              cellText += "\n✓"
              completed = true
            } else if (status === false) {
              cellText += "\n✗"
              missed = true
            } else if (currentDateOnly <= todayOnly) {
              // no status recorded and date is in the past (or today) -> mark as miss
              cellText += "\n✗"
              missed = true
            }
          }
          
          weekRow.push(cellText)
          weekData.push({ text: cellText, completed, missed, isMonth })
          currentDate.setDate(currentDate.getDate() + 1)
        }
        
        const row = worksheet.addRow(weekRow)
        row.eachCell((cell, colIndex) => {
          const data = weekData[colIndex - 1]
          if (data.completed) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FF86efac" },
            }
            cell.font = { bold: true, color: { argb: "FF166534" }, size: 11 }
          } else if (data.missed) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFfca5a5" },
            }
            cell.font = { bold: true, color: { argb: "FF7f1d1d" }, size: 11 }
          } else if (data.isMonth) {
            cell.font = { bold: true, size: 11 }
          }
          
          cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          }
        })
        
        // Stop after we've passed the end of the month and finished the week
        if (currentDate > endOfMonth && weekData[6].isMonth === false) {
          break
        }
      }

      dayNames.forEach((_, index) => {
        worksheet.getColumn(index + 1).width = 18
      })

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 3) {
          row.height = 40
        }
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = `habits-calendar-${monthName.replace(" ", "-")}-${new Date().toISOString().split("T")[0]}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleBackupData = async () => {
    try {
      const backupData = {
        subjects,
        tasks,
        tags: allTags,
        todos,
        habits,
      }

      const response = await fetch("/api/export-xlsx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backupData),
      })

      if (!response.ok) throw new Error("Backup failed")

      const blob = await response.blob()
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.href = url
      const timestamp = new Date().toISOString().split("T")[0]
      link.download = `college-tracker-backup-${timestamp}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log("[v0] Backup successful")
    } catch (error) {
      console.error("Backup error:", error)
      alert("Failed to backup data")
    }
  }

  const handleExportTodosAndHabits = async () => {
    const headers = ["Type", "Name", "Status", "Created"]
    const rows: string[] = []

    // Add incomplete todos
    todos.forEach((todo) => {
      if (!todo.completed) {
        rows.push(
          `todo,"${todo.text.replace(/"/g, '""')}","pending","${new Date(todo.createdAt).toLocaleDateString()}"`,
        )
      }
    })

    // Add habits with completion data
    habits.forEach((habit) => {
      const completedDays = Object.values(habit.completions).filter((v) => v === true).length
      rows.push(
        `habit,"${habit.name.replace(/"/g, '""')}","${completedDays} days completed","${new Date(habit.createdAt).toLocaleDateString()}"`,
      )
    })

    const csvContent = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = `todos-habits-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (currentPage === "todos") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6">
          <button
            onClick={() => setCurrentPage("attendance")}
            className="text-green-500 text-xs sm:text-sm mb-4 hover:text-green-400 transition"
          >
            ← Back to Attendance
          </button>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">To-Do List</h1>
          <p className="text-gray-500 text-xs sm:text-sm">Manage your daily tasks</p>
        </div>

        <div className="h-1 bg-green-500 mb-4 sm:mb-6"></div>

        <div className="flex-1 px-4 sm:px-6 pb-24">
          <div className="max-w-2xl w-full">
            <TodoListModal
              todos={todos}
              onAddTodo={handleAddTodo}
              onToggleTodo={handleToggleTodo}
              onDeleteTodo={handleDeleteTodo}
              onRestoreTodo={handleRestoreTodo}
              binTodos={binTodos}
            />
          </div>
        </div>

        <BottomNav currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>
    )
  }

  if (currentPage === "exams") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6">
          <button
            onClick={() => setCurrentPage("attendance")}
            className="text-green-500 text-xs sm:text-sm mb-4 hover:text-green-400 transition"
          >
            ← Back to Attendance
          </button>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">Exams and Assignments</h1>
          <p className="text-gray-500 text-xs sm:text-sm">Manage your deadlines</p>
        </div>

        <div className="h-1 bg-green-500 mb-4 sm:mb-6"></div>

        <div className="flex-1 px-4 sm:px-6 pb-24 overflow-y-auto">
          <div className="max-w-4xl w-full">
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="mb-4 sm:mb-6 px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition text-sm sm:text-base"
            >
              + Add Task
            </button>

            <div className="space-y-3 sm:space-y-4">
              {tasks.length === 0 ? (
                <p className="text-gray-500 text-center py-8 text-xs sm:text-base">
                  No tasks yet. Click "Add Task" to create one.
                </p>
              ) : (
                tasks.map((task) => {
                  const dueDate = new Date(task.dueDate)
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  dueDate.setHours(0, 0, 0, 0)
                  const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  const isOverdue = daysUntil < 0
                  const isToday = daysUntil === 0

                  return (
                    <div
                      key={task.id}
                      className="bg-gray-900 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-lg font-semibold">{task.title}</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">
                          {task.type === "exam" ? "Exam" : "Assignment"} • {dueDate.toLocaleDateString()}
                          {(task.remindDaysBefore || 0) > 0 && ` • Remind ${task.remindDaysBefore}d before`}
                        </p>
                      </div>
                      <div
                        className={`text-right ${isOverdue ? "text-red-500" : isToday ? "text-yellow-500" : "text-gray-400"}`}
                      >
                        {isOverdue ? (
                          <p className="font-semibold text-xs sm:text-base">{Math.abs(daysUntil)} days overdue</p>
                        ) : isToday ? (
                          <p className="font-semibold text-xs sm:text-base">Today</p>
                        ) : (
                          <p className="font-semibold text-xs sm:text-base">{daysUntil} days left</p>
                        )}
                      </div>
                      <button
                        onClick={() => setTasks(tasks.filter((t) => t.id !== task.id))}
                        className="ml-0 sm:ml-4 px-2 sm:px-3 py-1 bg-red-900 hover:bg-red-800 text-red-300 rounded transition text-xs sm:text-sm w-full sm:w-auto"
                      >
                        Delete
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <BottomNav currentPage={currentPage} onPageChange={setCurrentPage} />
        <CalendarModal
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          onAddTask={(task) => {
            setTasks([...tasks, { id: Date.now().toString(), ...task }])
            setIsCalendarOpen(false)
          }}
        />
      </div>
    )
  }

  if (currentPage === "habits") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6">
          <button
            onClick={() => setCurrentPage("attendance")}
            className="text-green-500 text-xs sm:text-sm mb-4 hover:text-green-400 transition"
          >
            ← Back to Attendance
          </button>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold mb-2">Habit Tracker</h1>
              <p className="text-gray-500 text-xs sm:text-sm">Track your daily habits</p>
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm text-gray-500">Today</p>
              <p className="text-base sm:text-lg font-semibold text-green-500">{currentDate}</p>
            </div>
          </div>
        </div>

        <div className="h-1 bg-green-500 mb-4 sm:mb-6"></div>

        <div className="flex-1 px-4 sm:px-6 pb-24 overflow-y-auto">
          <div className="max-w-2xl w-full">
            <HabitTrackerModal
              habits={habits}
              onAddHabit={handleAddHabit}
              onDeleteHabit={handleDeleteHabit}
              onToggleHabit={handleToggleHabit}
              onExportCSV={handleExportHabitCSV}
            />
          </div>
        </div>

        <BottomNav currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6">
        <div className="text-xs sm:text-sm text-gray-500 mb-2">
          <ClientDate />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 break-words">Your Attendance</h1>
            {upcomingInfo && (
              <p className="text-gray-400 text-xs sm:text-sm mt-3 flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse-glow flex-shrink-0"></span>
                <span>
                  {upcomingInfo.count} task{upcomingInfo.count !== 1 ? "s" : ""} due in{" "}
                  <span className="text-red-500 font-semibold">{upcomingInfo.daysUntil}</span> day
                  {upcomingInfo.daysUntil !== 1 ? "s" : ""}
                  {upcomingInfo.hasOtherDeadlines && (
                    <>
                      {" "}
                      and{" "}
                      <button
                        onClick={() => setIsDeadlinePreviewOpen(true)}
                        className="underline text-red-500 hover:text-red-400 transition cursor-pointer"
                      >
                        others...
                      </button>
                    </>
                  )}
                </span>
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0 flex-wrap items-center">
            <button
              onClick={() => setShowTutorial(true)}
              className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition flex-shrink-0 text-green-500"
              title="View tutorial"
            >
              <InfoIcon />
            </button>
            <button
              onClick={() => setIsScheduleOpen(true)}
              className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition flex-shrink-0 text-yellow-400"
              title="Set notification schedule"
            >
              <BellIcon />
            </button>
            <button
              onClick={() => setIsTagManagementOpen(true)}
              className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition flex-shrink-0 text-purple-400"
              title="Settings"
            >
              <SettingsIcon />
            </button>
            <button
              onClick={() => setIsTaskPreviewOpen(true)}
              className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition flex-shrink-0 text-cyan-400"
            >
              <CalendarIcon />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition flex-shrink-0 text-orange-400"
            >
              <PlusIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Green Divider */}
      <div className="h-1 bg-green-500 mb-4 sm:mb-6"></div>

      {/* Main Content - Grid Layout */}
      <div className="flex-1 px-4 sm:px-6 pb-24 overflow-y-auto">
        {allTags.length > 0 && (
          <div className="mb-4 sm:mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTags([])}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition ${
                selectedTags.length === 0 ? "bg-green-500 text-black" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
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
                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition ${
                  selectedTags.includes(tag) ? "bg-green-500 text-black" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 auto-rows-max">
          {filteredSubjects.map((subject) => (
            <div key={subject.id} className="min-w-0">
              <AttendanceCard
                subjectId={subject.id}
                subject={subject.name}
                attended={subject.attended}
                missed={subject.missed}
                requirement={subject.requirement}
                glowColor={subject.glowColor}
                onAttendedIncrease={() => handleUpdateSubject(subject.id, { attended: subject.attended + 1 })}
                onAttendedDecrease={() =>
                  handleUpdateSubject(subject.id, { attended: Math.max(0, subject.attended - 1) })
                }
                onMissedIncrease={() => handleUpdateSubject(subject.id, { missed: subject.missed + 1 })}
                onMissedDecrease={() => handleUpdateSubject(subject.id, { missed: Math.max(0, subject.missed - 1) })}
                onDelete={() => handleDeleteSubject(subject.id)}
                onEdit={() => {
                  setEditingSubjectId(subject.id)
                  setIsEditModalOpen(true)
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentPage={currentPage} onPageChange={setCurrentPage} />

      <AddSubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddSubject}
        existingTags={allTags}
      />
      {editingSubjectId && (
        <EditSubjectModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingSubjectId(null)
          }}
          onSave={handleEditSubject}
          subject={subjects.find((s) => s.id === editingSubjectId)!}
          existingTags={allTags}
        />
      )}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onAddTask={(task) => {
          setTasks([...tasks, { id: Date.now().toString(), ...task }])
          setIsCalendarOpen(false)
        }}
      />
      <TaskPreviewModal
        isOpen={isTaskPreviewOpen}
        onClose={() => setIsTaskPreviewOpen(false)}
        tasks={tasks}
        onResolveTask={handleResolveTask}
        subjects={subjects}
        allTags={allTags}
        initialSelectedTags={[]}
      />
      <TaskPreviewModal
        isOpen={isDeadlinePreviewOpen}
        onClose={() => setIsDeadlinePreviewOpen(false)}
        tasks={tasks}
        onResolveTask={handleResolveTask}
        subjects={subjects}
        allTags={allTags}
        initialSelectedTags={[]}
      />

      <TutorialModal
        isOpen={showTutorial}
        onClose={() => {
          setShowTutorial(false)
          localStorage.setItem("tutorialSeen", "true")
        }}
      />
      <TagManagementModal
        isOpen={isTagManagementOpen}
        onClose={() => setIsTagManagementOpen(false)}
        tags={allTags}
        onDeleteTag={handleDeleteTag}
        onResetAllData={handleResetAllData}
        subjects={subjects}
        tasks={tasks}
        onExportData={handleBackupData}
        onImportData={(data) => {
          setSubjects(data.subjects)
          setTasks(data.tasks)
          setAllTags(data.tags)
          if (data.todos) setTodos(data.todos)
          if (data.habits) setHabits(data.habits)
        }}
        notificationSupported={notificationSupported}
        notificationPermission={notificationPermission || undefined}
        onEnableNotifications={enableNotifications}
      />
      {isScheduleOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsScheduleOpen(false)}
        >
          <div
            className="bg-gray-900 rounded-2xl p-8 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Notification Schedule</h2>
              <button onClick={() => setIsScheduleOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <NotificationSchedule subjects={subjects.map(s => ({ id: s.id, name: s.name, tags: s.tags }))} />
          </div>
        </div>
      )}
    </div>
  )
}

function handleCloseTutorial(setShowTutorial: React.Dispatch<React.SetStateAction<boolean>>) {
  setShowTutorial(false)
  localStorage.setItem("tutorialSeen", "true")
}

function convertToCSV(data: { subjects: any[]; tasks: any[]; tags: string[] }): string {
  const headers = [
    "type",
    "id",
    "name",
    "attended",
    "missed",
    "requirement",
    "glowColor",
    "tags",
    "title",
    "dueDate",
    "taskType",
    "remindDaysBefore",
    "notificationType",
    "notificationTitle",
    "notificationDescription",
  ]
  const rows: string[] = [headers.join(",")]

  data.subjects.forEach((subject) => {
    const row = [
      "subject",
      subject.id,
      `"${subject.name}"`,
      subject.attended,
      subject.missed,
      subject.requirement,
      subject.glowColor,
      `"${subject.tags.join("|")}"`,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]
    rows.push(row.join(","))
  })

  data.tasks.forEach((task) => {
    const row = [
      "task",
      task.id,
      "",
      "",
      "",
      "",
      "",
      "",
      `"${task.title}"`,
      task.dueDate,
      task.type,
      task.remindDaysBefore || 0,
      "",
      "",
      "",
    ]
    rows.push(row.join(","))
  })

  if (data.tags) {
    data.tags.forEach((tag) => {
      const row = ["tag", "", `"${tag}"`, "", "", "", "", "", "", "", "", "", "", "", ""]
      rows.push(row.join(","))
    })
  }

  return rows.join("\n")
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Debug export for testing
if (typeof window !== "undefined") {
  (window as any).createTestHabits = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const testHabits = [
      {
        id: "test1",
        name: "Morning Run",
        completions: {
          [`${year}-${String(month).padStart(2, "0")}-01`]: true,
          [`${year}-${String(month).padStart(2, "0")}-02`]: true,
          [`${year}-${String(month).padStart(2, "0")}-03`]: false,
          [`${year}-${String(month).padStart(2, "0")}-04`]: true,
          [`${year}-${String(month).padStart(2, "0")}-05`]: false,
          [`${year}-${String(month).padStart(2, "0")}-06`]: true,
          [`${year}-${String(month).padStart(2, "0")}-07`]: true,
          [`${year}-${String(month).padStart(2, "0")}-08`]: true,
          [`${year}-${String(month).padStart(2, "0")}-09`]: false,
          [`${year}-${String(month).padStart(2, "0")}-10`]: true,
        },
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem("habits", JSON.stringify(testHabits))
    alert("Test habit created! Refresh the page to see it.")
  }
}
