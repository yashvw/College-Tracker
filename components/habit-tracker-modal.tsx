"use client"

import { useState, useEffect } from "react"
import { TrashIcon, DownloadIcon } from "@/components/icons"
import { X, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Export Habits</DialogTitle>
            <DialogDescription>
              Export habit completion data as a calendar CSV
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Month Selection */}
            <div className="space-y-2">
              <Label htmlFor="export-month">Select Month</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="export-month"
                  type="month"
                  value={exportMonth}
                  onChange={(e) => setExportMonth(e.target.value)}
                  className="flex-1"
                />
              </div>
              <p className="text-muted-foreground text-xs">Exporting: {monthName}</p>
              {noDataForMonth && (
                <p className="text-yellow-500 text-xs">No data found for the selected month and selected habits.</p>
              )}
            </div>

            {/* Habit Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Select Habits</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs h-auto p-0"
                >
                  {selectedHabits.size === habits.length ? "Deselect All" : "Select All"}
                </Button>
              </div>

              <Card className="p-3 max-h-64 overflow-y-auto">
                {habits.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No habits to export</p>
                ) : (
                  <div className="space-y-2">
                    {habits.map((habit) => (
                      <div key={habit.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`habit-${habit.id}`}
                          checked={selectedHabits.has(habit.id)}
                          onCheckedChange={() => handleToggleHabit(habit.id)}
                        />
                        <Label
                          htmlFor={`habit-${habit.id}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          {habit.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Export Button */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowExportModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={selectedHabits.size === 0}
                className="flex-1"
              >
                Export {selectedHabits.size > 0 ? `(${selectedHabits.size})` : ""}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Add Habit Section */}
      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        <Input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddHabit()}
          placeholder="Add a new habit..."
          className="flex-1"
        />
        <Button
          onClick={handleAddHabit}
          disabled={!newHabit.trim()}
          className="whitespace-nowrap"
        >
          Add
        </Button>
      </div>

      {/* Limit Warning */}
      {showLimitWarning && (
        <Card className="p-2 sm:p-3 bg-destructive/10 border-destructive">
          <p className="text-destructive text-xs sm:text-sm">
            Max 10 habits. Delete some first.
          </p>
        </Card>
      )}

      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExportModal(true)}
          className="gap-1 sm:gap-2"
        >
          <DownloadIcon />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">Export</span>
        </Button>
      </div>

      {/* Export Modal */}
      <ExportModal />

      {/* Habits List */}
      <div className="space-y-2 sm:space-y-3">
        {habits.length === 0 ? (
          <p className="text-muted-foreground text-center py-6 sm:py-8 text-xs sm:text-base">
            No habits yet. Add one to get started!
          </p>
        ) : (
          habits.map((habit) => {
            const stats = getCompletionStats(habit)

            return (
              <Card key={habit.id} className="p-2 sm:p-3">
                <div className="space-y-2 sm:space-y-3">
                  {/* Habit Header */}
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs sm:text-base text-foreground">
                      {habit.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteHabit(habit.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      title="Delete"
                    >
                      <TrashIcon />
                    </Button>
                  </div>

                  {/* Daily Checkboxes */}
                  <div className="grid grid-cols-7 gap-2">
                    {dates.map((date) => {
                      const isCompleted = habit.completions[date] === true
                      const displayDate = new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })

                      return (
                        <div key={date} className="flex flex-col items-center gap-1">
                          <span className="text-xs text-muted-foreground">{displayDate}</span>
                          <Checkbox
                            checked={isCompleted}
                            onCheckedChange={() => onToggleHabit(habit.id, date)}
                            className="h-4 w-4 sm:h-5 sm:w-5"
                          />
                        </div>
                      )
                    })}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-2 sm:gap-3 text-xs flex-wrap pt-1">
                    <Badge variant="outline" className="gap-1">
                      <span className="text-green-500">✓</span>
                      <span>{stats.completed} done</span>
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <span className="text-red-500">✗</span>
                      <span>{stats.notCompleted} missed</span>
                    </Badge>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
