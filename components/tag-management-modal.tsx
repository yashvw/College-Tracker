"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Trash2, Download, Upload, Settings2, Bell, BellOff } from "lucide-react"

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

interface Notification {
  id: string
  type: "reminder" | "attendance" | "backup" | "back-on-track"
  title: string
  description: string
  timestamp: string
  data?: {
    taskId?: string
    subjectId?: string
    subjectName?: string
    currentAttendance?: number
    requirement?: number
    classesNeeded?: number
  }
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

interface TagManagementModalProps {
  isOpen: boolean
  onClose: () => void
  tags: string[]
  onDeleteTag: (tag: string) => void
  onResetAllData: () => void
  subjects: Subject[]
  tasks: Task[]
  notifications?: Notification[]
  onExportData: () => Promise<void>
  onImportData: (data: {
    subjects: Subject[]
    tasks: Task[]
    tags: string[]
    notifications?: Notification[]
    todos?: Todo[]
    habits?: Habit[]
  }) => void
  notificationSupported?: boolean
  notificationPermission?: NotificationPermission
  onEnableNotifications?: () => Promise<void>
}

export default function TagManagementModal({
  isOpen,
  onClose,
  tags,
  onDeleteTag,
  onResetAllData,
  subjects,
  tasks,
  notifications = [],
  onExportData,
  onImportData,
  notificationSupported = false,
  notificationPermission,
  onEnableNotifications,
}: TagManagementModalProps) {
  const [deleteConfirmTag, setDeleteConfirmTag] = useState<string | null>(null)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isEnablingNotifications, setIsEnablingNotifications] = useState(false)
  const [localPermission, setLocalPermission] = useState<NotificationPermission | undefined>(notificationPermission)

  // Update local permission when prop changes
  useEffect(() => {
    setLocalPermission(notificationPermission)
  }, [notificationPermission])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await onExportData()
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)

    // Helper to parse date strings (or Excel values) into YYYY-MM-DD which this app expects
    const parseExcelDateToYMD = (value: any): string | null => {
      if (!value && value !== 0) return null

      if (value instanceof Date) {
        const y = value.getFullYear()
        const m = String(value.getMonth() + 1).padStart(2, "0")
        const d = String(value.getDate()).padStart(2, "0")
        return `${y}-${m}-${d}`
      }

      if (typeof value === "number") {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30))
        const millis = value * 24 * 60 * 60 * 1000
        const dObj = new Date(excelEpoch.getTime() + millis)
        const y = dObj.getFullYear()
        const m = String(dObj.getMonth() + 1).padStart(2, "0")
        const d = String(dObj.getDate()).padStart(2, "0")
        return `${y}-${m}-${d}`
      }

      const s = String(value).trim()
      const isoMatch = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
      if (isoMatch) {
        const [, yy, mm, dd] = isoMatch
        return `${yy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`
      }

      const slashMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
      if (slashMatch) {
        const [, p1, p2, p3] = slashMatch
        const dd = String(p1).padStart(2, "0")
        const mm = String(p2).padStart(2, "0")
        const yy = p3
        return `${yy}-${mm}-${dd}`
      }

      const parsed = new Date(s)
      if (!isNaN(parsed.getTime())) {
        const y = parsed.getFullYear()
        const m = String(parsed.getMonth() + 1).padStart(2, "0")
        const d = String(parsed.getDate()).padStart(2, "0")
        return `${y}-${m}-${d}`
      }

      return null
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const fileType = file.name.split(".").pop()?.toLowerCase()

        if (fileType === "zip") {
          const JSZip = (await import("jszip")).default
          const zip = new JSZip()
          const zipData = await zip.loadAsync(e.target?.result as ArrayBuffer)

          const importedSubjects: Subject[] = []
          const importedTasks: Task[] = []
          const importedTodos: Todo[] = []
          const importedHabits: Habit[] = []
          const importedTags: string[] = []
          const importedNotifications: Notification[] = []

          for (const [filename, file] of Object.entries(zipData.files)) {
            if (filename.includes("Attendance") && !filename.startsWith("__MACOSX")) {
              const ExcelJS = (await import("exceljs")).default
              const workbook = new ExcelJS.Workbook()
              const buffer = await file.async("arraybuffer")
              await workbook.xlsx.load(buffer)
              const worksheet = workbook.worksheets[0]

              worksheet?.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return

                importedSubjects.push({
                  id: Date.now().toString() + Math.random(),
                  name: row.getCell(1).value as string,
                  attended: Number(row.getCell(2).value) || 0,
                  missed: Number(row.getCell(3).value) || 0,
                  requirement: Number(row.getCell(5).value?.toString().replace("%", "")) || 75,
                  glowColor: "#22c55e",
                  tags: [],
                })
              })
            } else if (filename.includes("Exams-Assignments") && !filename.startsWith("__MACOSX")) {
              const ExcelJS = (await import("exceljs")).default
              const workbook = new ExcelJS.Workbook()
              const buffer = await file.async("arraybuffer")
              await workbook.xlsx.load(buffer)
              const worksheet = workbook.worksheets[0]

              // Helper to parse various Excel date formats into YYYY-MM-DD
              const parseExcelDateToYMD = (value: any): string | null => {
                if (!value && value !== 0) return null

                // ExcelJS may give a Date object
                if (value instanceof Date) {
                  const y = value.getFullYear()
                  const m = String(value.getMonth() + 1).padStart(2, "0")
                  const d = String(value.getDate()).padStart(2, "0")
                  return `${y}-${m}-${d}`
                }

                // If it's a number (Excel serial), try converting using Excel's epoch
                if (typeof value === "number") {
                  // Excel stores dates as number of days since 1899-12-31 (approx). We'll convert.
                  const excelEpoch = new Date(Date.UTC(1899, 11, 30)) // 1899-12-30 accounts for Excel bug
                  const millis = value * 24 * 60 * 60 * 1000
                  const dObj = new Date(excelEpoch.getTime() + millis)
                  const y = dObj.getFullYear()
                  const m = String(dObj.getMonth() + 1).padStart(2, "0")
                  const d = String(dObj.getDate()).padStart(2, "0")
                  return `${y}-${m}-${d}`
                }

                // Otherwise assume string. Support common formats: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
                const s = String(value).trim()
                // YYYY-MM-DD
                const isoMatch = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
                if (isoMatch) {
                  const [, yy, mm, dd] = isoMatch
                  return `${yy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`
                }

                // Slash-separated: assume exported format is en-GB (DD/MM/YYYY). If day > 12 treat as DD/MM/YYYY else
                // default to DD/MM/YYYY to match exporter behaviour.
                const slashMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
                if (slashMatch) {
                  const [, p1, p2, p3] = slashMatch
                  // assume p1=DD p2=MM for imports from this app
                  const dd = String(p1).padStart(2, "0")
                  const mm = String(p2).padStart(2, "0")
                  const yy = p3
                  return `${yy}-${mm}-${dd}`
                }

                // Fallback: try Date parse
                const parsed = new Date(s)
                if (!isNaN(parsed.getTime())) {
                  const y = parsed.getFullYear()
                  const m = String(parsed.getMonth() + 1).padStart(2, "0")
                  const d = String(parsed.getDate()).padStart(2, "0")
                  return `${y}-${m}-${d}`
                }

                return null
              }

              worksheet?.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return

                const rawDue = row.getCell(3).value as any
                const parsedDue = parseExcelDateToYMD(rawDue)

                importedTasks.push({
                  id: Date.now().toString() + Math.random(),
                  title: row.getCell(1).value as string,
                  dueDate: parsedDue || new Date().toISOString().split("T")[0],
                  type: (row.getCell(2).value as string)?.toLowerCase() === "exam" ? "exam" : "assignment",
                  remindDaysBefore: Number(row.getCell(5).value) || 0,
                })
              })
            } else if (filename.includes("Todo") && !filename.startsWith("__MACOSX")) {
              const ExcelJS = (await import("exceljs")).default
              const workbook = new ExcelJS.Workbook()
              const buffer = await file.async("arraybuffer")
              await workbook.xlsx.load(buffer)
              const worksheet = workbook.worksheets[0]

              worksheet?.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return

                const text = row.getCell(1).value as string
                const statusCell = row.getCell(2).value as string
                const completed = statusCell?.toLowerCase() === "completed"

                if (text) {
                  importedTodos.push({
                    id: Date.now().toString() + Math.random(),
                    text,
                    completed,
                    createdAt: new Date().toISOString(),
                  })
                }
              })
            } else if (filename.includes("Habits") && !filename.startsWith("__MACOSX")) {
              const ExcelJS = (await import("exceljs")).default
              const workbook = new ExcelJS.Workbook()
              const buffer = await file.async("arraybuffer")
              await workbook.xlsx.load(buffer)
              const worksheet = workbook.worksheets[0]

              worksheet?.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return

                const habitName = row.getCell(1).value as string
                if (habitName) {
                  importedHabits.push({
                    id: Date.now().toString() + Math.random(),
                    name: habitName,
                    completions: {},
                    createdAt: new Date().toISOString(),
                  })
                }
              })
            } else if (filename.includes("Tags") && !filename.startsWith("__MACOSX")) {
              const ExcelJS = (await import("exceljs")).default
              const workbook = new ExcelJS.Workbook()
              const buffer = await file.async("arraybuffer")
              await workbook.xlsx.load(buffer)
              const worksheet = workbook.worksheets[0]

              worksheet?.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return

                const tag = row.getCell(1).value as string
                if (tag) importedTags.push(tag)
              })
            } else if (filename.includes("Notifications") && !filename.startsWith("__MACOSX")) {
              const ExcelJS = (await import("exceljs")).default
              const workbook = new ExcelJS.Workbook()
              const buffer = await file.async("arraybuffer")
              await workbook.xlsx.load(buffer)
              const worksheet = workbook.worksheets[0]

              worksheet?.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return

                importedNotifications.push({
                  id: row.getCell(1).value as string,
                  type: row.getCell(2).value as string as "reminder" | "attendance" | "backup" | "back-on-track",
                  title: row.getCell(3).value as string,
                  description: row.getCell(4).value as string,
                  timestamp: new Date().toLocaleTimeString(),
                })
              })
            }
          }

          onImportData({
            subjects: importedSubjects,
            tasks: importedTasks,
            tags: importedTags,
            notifications: importedNotifications,
            todos: importedTodos,
            habits: importedHabits,
          })

          alert("Data imported successfully from ZIP!")
        } else {
          const csv = e.target?.result as string
          const lines = csv.split("\n")
          const headers = lines[0].split(",")

          const importedSubjects: Subject[] = []
          const importedTasks: Task[] = []
          const importedTags: string[] = []
          const importedNotifications: Notification[] = []

          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue

            const values = parseCSVLine(lines[i])
            const type = values[0]

            if (type === "subject") {
              importedSubjects.push({
                id: values[1],
                name: values[2],
                attended: Number.parseInt(values[3]),
                missed: Number.parseInt(values[4]),
                requirement: Number.parseInt(values[5]),
                glowColor: values[6],
                tags: values[7] ? values[7].split("|") : [],
              })
            } else if (type === "task") {
              importedTasks.push({
                id: values[1],
                title: values[8],
                dueDate: values[9],
                type: values[10] as "exam" | "assignment",
                remindDaysBefore: values[11] ? Number.parseInt(values[11]) : 0,
              })
            } else if (type === "tag") {
              importedTags.push(values[2])
            } else if (type === "notification") {
              importedNotifications.push({
                id: values[1],
                type: values[12] as "reminder" | "attendance" | "backup" | "back-on-track",
                title: values[13],
                description: values[14],
                timestamp: new Date().toLocaleTimeString(),
              })
            }
          }

          onImportData({
            subjects: importedSubjects,
            tasks: importedTasks,
            tags: importedTags,
            notifications: importedNotifications,
          })

          alert("Data imported successfully!")
        }
      } catch (error) {
        alert("Error importing data. Please check the file format.")
        console.error(error)
      } finally {
        setIsImporting(false)
        event.target.value = ""
      }
    }

    if (file.name.endsWith(".zip")) {
      reader.readAsArrayBuffer(file)
    } else {
      reader.readAsText(file)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-2xl p-8 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-gray-400" />
            <h2 className="text-2xl font-bold">Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {notificationSupported && (
          <>
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-300">Notifications</h3>
              <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  {localPermission === 'granted' ? (
                    <Bell className="w-5 h-5 text-blue-500" />
                  ) : (
                    <BellOff className="w-5 h-5 text-gray-500" />
                  )}
                  <div>
                    <p className="text-gray-300 font-medium">Device Notifications</p>
                    <p className="text-gray-500 text-sm">
                      {localPermission === 'granted'
                        ? 'Notifications enabled'
                        : 'Enable notifications for reminders and updates'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    setIsEnablingNotifications(true)
                    try {
                      if (!onEnableNotifications) {
                        console.error('onEnableNotifications callback not provided')
                        alert('Unable to enable notifications. Please refresh the page and try again.')
                        setIsEnablingNotifications(false)
                        return
                      }
                      console.log('🔔 Button clicked - calling onEnableNotifications immediately')
                      // Call the function directly without any delays
                      await onEnableNotifications()
                      console.log('🔔 Permission request completed')
                    } catch (error) {
                      console.error('Error enabling notifications:', error)
                      alert('Failed to enable notifications: ' + String(error))
                    } finally {
                      setIsEnablingNotifications(false)
                      // Force update the UI by re-checking permission
                      setTimeout(() => {
                        if ('Notification' in window) {
                          setLocalPermission(Notification.permission)
                        }
                      }, 500)
                    }
                  }}
                  disabled={localPermission === 'granted' || isEnablingNotifications}
                  className={`px-4 py-2 rounded-lg transition font-medium ${
                    localPermission === 'granted'
                      ? 'bg-green-600 text-white cursor-default'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } disabled:opacity-75`}
                >
                  {isEnablingNotifications ? 'Enabling...' : localPermission === 'granted' ? 'Enabled' : 'Enable'}
                </button>
              </div>
            </div>

            <div className="h-px bg-gray-700 mb-8"></div>
          </>
        )}

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-300">Manage Tags</h3>
          {tags.length === 0 ? (
            <p className="text-gray-500 text-sm">No tags created yet</p>
          ) : (
            <div className="space-y-2">
              {tags.map((tag) => (
                <div key={tag} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                  <span className="text-gray-300">{tag}</span>
                  {deleteConfirmTag === tag ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeleteConfirmTag(null)}
                        className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          onDeleteTag(tag)
                          setDeleteConfirmTag(null)
                        }}
                        className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition"
                      >
                        Confirm
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmTag(tag)}
                      className="p-2 hover:bg-gray-700 rounded transition text-red-500 hover:text-red-400"
                      title="Delete tag"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-px bg-gray-700 mb-8"></div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-300">Backup & Restore</h3>
          <p className="text-gray-500 text-sm mb-4">
            Export your data as a ZIP file containing individual Excel files for each feature including attendance
            tracker, to-do list, habits tracker, exams/assignments, notifications, and tags. Import to restore on
            another device.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition font-medium flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isExporting ? "Exporting..." : "Export Data as ZIP"}
            </button>

            <label className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              {isImporting ? "Importing..." : "Import Data"}
              <input type="file" accept=".csv,.zip" onChange={handleImport} className="hidden" disabled={isImporting} />
            </label>
          </div>
        </div>

        <div className="h-px bg-gray-700 mb-8"></div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-300">Reset Data</h3>
          <p className="text-gray-500 text-sm mb-4">
            Clear all subjects, tasks, and tags to start fresh with a new year. This action cannot be undone.
          </p>

          {resetConfirm ? (
            <div className="space-y-3">
              <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded-lg p-3">
                <p className="text-red-300 text-sm font-medium">Are you sure? This will delete everything.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setResetConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onResetAllData()
                    setResetConfirm(false)
                    onClose()
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
                >
                  Reset All
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setResetConfirm(true)}
              className="w-full px-4 py-2 bg-red-900 hover:bg-red-800 text-red-300 rounded-lg transition font-medium"
            >
              Reset All Data
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let insideQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      insideQuotes = !insideQuotes
    } else if (char === "," && !insideQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}
