"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Trash2, Download, Upload, Settings2, Bell, BellOff, Send, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

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
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [isPWA, setIsPWA] = useState(false)
  const [localPermission, setLocalPermission] = useState<NotificationPermission | undefined>(notificationPermission)
  const [isScheduling, setIsScheduling] = useState(false)
  const [scheduledNotifications, setScheduledNotifications] = useState<Array<{
    id: string;
    scheduledTime: string;
    delayMinutes: number;
    countdown: number;
  }>>([])
  const [selectedDelay, setSelectedDelay] = useState<number>(1)

  // Update local permission when prop changes
  useEffect(() => {
    setLocalPermission(notificationPermission)
  }, [notificationPermission])

  // Check if app is installed as PWA
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true;
      setIsPWA(isInstalled);
    }
  }, [])

  // Countdown timer for scheduled notifications
  useEffect(() => {
    if (scheduledNotifications.length === 0) return;

    const interval = setInterval(() => {
      setScheduledNotifications(prev => {
        const updated = prev.map(notification => {
          const scheduledTime = new Date(notification.scheduledTime).getTime();
          const now = Date.now();
          const countdown = Math.max(0, Math.floor((scheduledTime - now) / 1000));

          return { ...notification, countdown };
        }).filter(n => n.countdown > 0); // Remove expired ones

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [scheduledNotifications.length])

  const sendTestNotification = async () => {
    setIsSendingTest(true);

    try {
      // Get current subscription
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        toast.error('No subscription found. Please enable notifications first.');
        setIsSendingTest(false);
        return;
      }

      // Send test notification
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Test notification sent! Check your device notification panel.', {
          description: isPWA
            ? 'If you don\'t see it, check system notification settings.'
            : 'For best results, install the app as PWA from your browser menu.',
          duration: 5000,
        });
      } else {
        toast.error(data.error || 'Failed to send test notification');
      }
    } catch (error) {
      console.error('Test notification error:', error);
      toast.error('Failed to send test notification. Check console for details.');
    } finally {
      setIsSendingTest(false);
    }
  };

  const scheduleNotification = async () => {
    setIsScheduling(true);

    try {
      // Get current subscription
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        toast.error('No subscription found. Please enable notifications first.');
        setIsScheduling(false);
        return;
      }

      // Calculate scheduled time
      const scheduledTime = new Date(Date.now() + selectedDelay * 60 * 1000);

      // Create schedule via QStash API
      const response = await fetch('/api/notifications/schedule-qstash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          delayMinutes: selectedDelay,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Notification scheduled for ${selectedDelay} minute(s) from now!`, {
          description: 'Upstash QStash will send it automatically. Close the app to test!',
          duration: 4000,
        });

        // Add to scheduled list with countdown
        setScheduledNotifications(prev => [...prev, {
          id: data.scheduleId,
          scheduledTime: data.scheduledTime,
          delayMinutes: data.delayMinutes,
          countdown: selectedDelay * 60,
        }]);
      } else {
        toast.error(data.error || data.message || 'Failed to schedule notification');
      }
    } catch (error) {
      console.error('Schedule notification error:', error);
      toast.error('Failed to schedule notification. Check console for details.');
    } finally {
      setIsScheduling(false);
    }
  };

  const cancelScheduledNotification = async (scheduleId: string) => {
    // Note: QStash doesn't support cancelling scheduled messages in free tier
    // So we just remove it from UI
    toast.info('Removing from list. Note: QStash free tier cannot cancel scheduled messages.');
    setScheduledNotifications(prev => prev.filter(n => n.id !== scheduleId));
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
              <div className="bg-gray-800 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
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
                          toast.error('Unable to enable notifications. Please refresh the page and try again.')
                          setIsEnablingNotifications(false)
                          return
                        }
                        console.log('🔔 Button clicked - calling onEnableNotifications immediately')
                        // Call the function directly without any delays
                        await onEnableNotifications()
                        console.log('🔔 Permission request completed')
                        toast.success('Notifications enabled! Tap "Send Test" to verify.')
                      } catch (error) {
                        console.error('Error enabling notifications:', error)
                        toast.error('Failed to enable notifications: ' + String(error))
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

                {/* Test button - only shows when notifications are enabled */}
                {localPermission === 'granted' && (
                  <div className="pt-3 border-t border-gray-700">
                    <button
                      onClick={sendTestNotification}
                      disabled={isSendingTest}
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {isSendingTest ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          <span>Sending Test...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Test Notification</span>
                        </>
                      )}
                    </button>

                    {/* PWA status indicator */}
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      {isPWA ? (
                        <div className="flex items-center gap-1 text-green-400">
                          <CheckCircle className="h-3 w-3" />
                          <span>PWA Installed - Full notification support</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-yellow-400">
                          <AlertCircle className="h-3 w-3" />
                          <span>Install as PWA for best results</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Scheduled Notifications Test */}
                {localPermission === 'granted' && (
                  <div className="pt-3 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-3">Schedule Auto-Notification (Test)</p>

                    {/* Delay selector and schedule button */}
                    <div className="flex gap-2 mb-3">
                      <select
                        value={selectedDelay}
                        onChange={(e) => setSelectedDelay(Number(e.target.value))}
                        className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
                      >
                        <option value={1}>1 minute</option>
                        <option value={2}>2 minutes</option>
                        <option value={3}>3 minutes</option>
                        <option value={5}>5 minutes</option>
                        <option value={10}>10 minutes</option>
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                      </select>

                      <button
                        onClick={scheduleNotification}
                        disabled={isScheduling}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium disabled:opacity-75 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {isScheduling ? 'Scheduling...' : 'Schedule'}
                      </button>
                    </div>

                    {/* Active scheduled notifications */}
                    {scheduledNotifications.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 mb-2">Active Schedules:</p>
                        {scheduledNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="flex items-center justify-between bg-gray-700 px-3 py-2 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-sm text-gray-300">
                                Sending in {formatCountdown(notification.countdown)}
                              </span>
                            </div>
                            <button
                              onClick={() => cancelScheduledNotification(notification.id)}
                              className="text-xs text-red-400 hover:text-red-300 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        ))}
                        <p className="text-xs text-gray-500 mt-2">
                          💡 Close the app to test background notifications
                        </p>
                      </div>
                    )}
                  </div>
                )}
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
