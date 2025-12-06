"use client"

import { useState } from "react"
import { X } from "lucide-react"

interface Habit {
  id: string
  name: string
  completions: Record<string, boolean>
  createdAt: string
}

interface HabitExportModalProps {
  isOpen: boolean
  onClose: () => void
  habits: Habit[]
  onExport: (selectedHabits: Habit[], month: Date) => void
}

export default function HabitExportModal({ isOpen, onClose, habits, onExport }: HabitExportModalProps) {
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

  const handleExport = () => {
    if (selectedHabits.size === 0) {
      alert("Please select at least one habit to export")
      return
    }

    const selected = habits.filter((h) => selectedHabits.has(h.id))
    const [year, month] = exportMonth.split("-")
    const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1)

    onExport(selected, monthDate)
    onClose()
  }

  if (!isOpen) return null

  const monthName = new Date(exportMonth + "-01").toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Export Habits</h2>
          <button
            onClick={onClose}
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
      </div>
    </div>
  )
}
