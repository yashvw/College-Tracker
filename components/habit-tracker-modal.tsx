"use client"

import { useState, useEffect } from "react"
import { TrashIcon, DownloadIcon } from "@/components/icons"
import { X } from "lucide-react"

interface Habit {
  id: string
  name: string
  completions: Record<string, boolean>
  createdAt: string
}

interface HabitTrackerModalProps {
  habits: Habit[]
  onAddHabit: (name: string) => void
  onDeleteHabit: (id: string) => void
  onToggleHabit: (id: string, date: string) => void
  onExportCSV: (habits: Habit[], month?: string) => void
}

export default function HabitTrackerModal({
  habits,
  onAddHabit,
  onDeleteHabit,
  onToggleHabit,
  onExportCSV,
}: HabitTrackerModalProps) {
  const [newHabit, setNewHabit] = useState("")
  const [showLimitWarning, setShowLimitWarning] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString(new Date()))
  
  const handleAddHabit = () => {
    if (newHabit.trim()) {
      if (habits.length >= 10) {
        setShowLimitWarning(true)
        setTimeout(() => setShowLimitWarning(false), 3000)
        return
      }
      onAddHabit(newHabit)
      setNewHabit("")
    }
  }

  // Get an array of dates for the current week (7 days)
  const getDatesArray = () => {
    const dates = []
    const today = new Date()
    
    // Get the start of the current week (Sunday)
    const startOfWeek = new Date(today)
    const day = today.getDay()
    const diff = today.getDate() - day
    startOfWeek.setDate(diff)
    
    // Generate 7 days starting from Sunday
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(getLocalDateString(date))
    }
    return dates
  }

  const dates = getDatesArray()

  const getCompletionStats = (habit: Habit) => {
    // Compute stats for the current month.
    // - completed: number of days in the month with true
    // - notCompleted: number of past days in the month without a true (false or missing)
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const endOfMonth = new Date(year, month + 1, 0).getDate()

    let completed = 0
    let notCompleted = 0

    for (let d = 1; d <= endOfMonth; d++) {
      const date = new Date(year, month, d)
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      const status = habit.completions?.[dateStr]

      // Consider only dates up to today as past (count misses for them). Future dates are ignored.
      const isPastOrToday = date <= new Date(today.getFullYear(), today.getMonth(), today.getDate())

      if (status === true) {
        completed++
      } else if (isPastOrToday) {
        // status === false OR undefined (no entry) for past dates counts as missed
        notCompleted++
      }
    }

    return { completed, notCompleted }
  }

  // Export Modal Component
  const ExportModal = () => {
    const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set())
    const [exportMonth, setExportMonth] = useState(() => {
      const today = new Date()
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
    })

    const handleToggleHabit = (habitId: string) => {
      const newSelected = new Set(selectedHabits)
      if (newSelected.has(habitId)) {
        newSelected.delete(habitId)
      } else {
        newSelected.add(habitId)
      }
      setSelectedHabits(newSelected)
    }

    const handleSelectAll = () => {
      if (selectedHabits.size === habits.length) {
        setSelectedHabits(new Set())
      } else {
        setSelectedHabits(new Set(habits.map((h) => h.id)))
      }
    }

    const [noDataForMonth, setNoDataForMonth] = useState(false)

    const checkMonthHasData = (monthValue: string) => {
      const [y, m] = monthValue.split("-")
      const prefix = `${y}-${m}`
      // If any selected habit has at least one entry for this month, consider it has data
      const selected = habits.filter((h) => selectedHabits.has(h.id))
      if (selected.length === 0) return false
      return selected.some((h) => Object.keys(h.completions || {}).some((k) => k.startsWith(prefix)))
    }

    useEffect(() => {
      // Re-check whether selected month has data whenever month or selection changes
      if (!exportMonth) return
      const has = checkMonthHasData(exportMonth)
      setNoDataForMonth(!has)
    }, [exportMonth, selectedHabits.size])

    const handleExport = () => {
      if (selectedHabits.size === 0) {
        alert("Please select at least one habit to export")
        return
      }

      const selected = habits.filter((h) => selectedHabits.has(h.id))
      const hasData = checkMonthHasData(exportMonth)
      setNoDataForMonth(!hasData)
      if (!hasData) {
        alert("No entries found for the selected month for the selected habits.")
        return
      }

      onExportCSV(selected, exportMonth)
      setShowExportModal(false)
    }

    const monthName = new Date(exportMonth + "-01").toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })

    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Export Habits</h2>
          <button
            onClick={() => setShowExportModal(false)}
            className="p-1 hover:bg-gray-800 rounded transition text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Month Selection */}
        <div className="mb-6">
          <label className="block text-gray-400 text-sm mb-2">Select Month</label>
          <input
            type="month"
            value={exportMonth}
            onChange={(e) => setExportMonth(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500 transition"
          />
          <p className="text-gray-500 text-xs mt-2">Exporting: {monthName}</p>
          {noDataForMonth && (
            <p className="text-yellow-400 text-xs mt-2">No data found for the selected month and selected habits.</p>
          )}
        </div>

        {/* Habit Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-gray-400 text-sm font-medium">Select Habits</label>
            <button
              onClick={handleSelectAll}
              className="text-xs text-green-500 hover:text-green-400 transition"
            >
              {selectedHabits.size === habits.length ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {habits.length === 0 ? (
              <p className="text-gray-500 text-sm">No habits to export</p>
            ) : (
              habits.map((habit) => (
                <label key={habit.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={selectedHabits.has(habit.id)}
                    onChange={() => handleToggleHabit(habit.id)}
                    className="w-4 h-4 rounded bg-gray-800 border-gray-700 accent-green-500"
                  />
                  <span className="text-gray-400 text-sm">{habit.name}</span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={selectedHabits.size === 0}
          className={`w-full py-3 rounded-lg font-medium transition ${
            selectedHabits.size === 0
              ? "bg-gray-700 text-gray-600 cursor-not-allowed opacity-50"
              : "bg-green-500 hover:bg-green-600 text-black cursor-pointer"
          }`}
        >
          Export {selectedHabits.size > 0 ? `(${selectedHabits.size})` : ""} as CSV
        </button>
      </>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4 w-full">
      {/* Add Habit Section */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddHabit()}
          placeholder="Add a new habit..."
          className="flex-1 px-3 sm:px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition min-w-0"
        />
        <button
          onClick={handleAddHabit}
          className="px-4 sm:px-6 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition text-xs sm:text-base whitespace-nowrap"
        >
          Add
        </button>
      </div>

      {/* Limit Warning */}
      {showLimitWarning && (
        <div className="p-2 sm:p-3 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg text-red-300 text-xs sm:text-sm">
          Max 10 habits. Delete some first.
        </div>
      )}

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-blue-900 hover:bg-blue-800 text-blue-300 text-xs sm:text-sm rounded-lg transition"
        >
          <DownloadIcon />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <ExportModal />
          </div>
        </div>
      )}

      {/* Habits List */}
      <div className="space-y-2 sm:space-y-3">
        {habits.length === 0 ? (
          <p className="text-gray-500 text-center py-6 sm:py-8 text-xs sm:text-base">
            No habits yet. Add one to get started!
          </p>
        ) : (
          habits.map((habit) => {
            const stats = getCompletionStats(habit)

            return (
              <div key={habit.id} className="space-y-1 sm:space-y-2">
                {/* Habit Row */}
                <div className="px-2 sm:px-3 py-2 sm:py-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-xs sm:text-base text-white">
                      {habit.name}
                    </span>
                    <button
                      onClick={() => onDeleteHabit(habit.id)}
                      className="p-1 hover:bg-red-900 hover:bg-opacity-50 rounded transition flex-shrink-0 ml-2 text-red-500"
                      title="Delete"
                    >
                      <TrashIcon />
                    </button>
                  </div>

                  {/* Daily Checkboxes */}
                  <div className="grid grid-cols-7 gap-2">
                    {dates.map((date) => {
                      const isCompleted = habit.completions[date] === true
                      const displayDate = new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
                      
                      return (
                        <div key={date} className="flex flex-col items-center">
                          <span className="text-xs text-gray-500 mb-1">{displayDate}</span>
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() => onToggleHabit(habit.id, date)}
                            className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer accent-green-500"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-2 sm:gap-3 text-xs text-gray-400 px-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="text-sm text-green-500">✓</span>
                    <span className="text-xs sm:text-sm">{stats.completed} done</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-sm text-red-500">✗</span>
                    <span className="text-xs sm:text-sm">{stats.notCompleted} missed</span>
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
