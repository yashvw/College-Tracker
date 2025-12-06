import { type NextRequest, NextResponse } from "next/server"

interface BackupData {
  subjects: any[]
  tasks: any[]
  tags: string[]
  todos: any[]
  habits: any[]
  notifications: any[]
}

export async function POST(request: NextRequest) {
  try {
    const body: BackupData = await request.json()

    // Generate individual CSV files with enhanced data
    const subjectsCSV = generateSubjectsCSV(body.subjects)
    const tasksCSV = generateTasksCSV(body.tasks)
    const todosCSV = generateTodosCSV(body.todos)
    const habitsCSV = generateHabitsCSV(body.habits)
    const tagsCSV = generateTagsCSV(body.tags)
    const notificationsCSV = generateNotificationsCSV(body.notifications)

    const backupFiles = {
      "subjects.csv": subjectsCSV,
      "tasks.csv": tasksCSV,
      "todos.csv": todosCSV,
      "habits.csv": habitsCSV,
      "tags.csv": tagsCSV,
      "notifications.csv": notificationsCSV,
      "backup-summary.txt": generateBackupSummary(body),
    }

    return NextResponse.json(backupFiles)
  } catch (error) {
    console.error("Backup error:", error)
    return NextResponse.json({ error: "Backup failed" }, { status: 500 })
  }
}

function generateSubjectsCSV(subjects: any[]): string {
  if (subjects.length === 0) return "id,name,attended,missed,requirement,glowColor,tags\n"

  const headers = ["id", "name", "attended", "missed", "requirement", "glowColor", "tags"]
  const rows = subjects.map((s) => [
    s.id,
    `"${s.name}"`,
    s.attended,
    s.missed,
    s.requirement,
    s.glowColor,
    `"${(s.tags || []).join("|")}"`,
  ])

  return [headers, ...rows].map((row) => row.join(",")).join("\n")
}

function generateTasksCSV(tasks: any[]): string {
  if (tasks.length === 0) return "id,title,dueDate,type,remindDaysBefore\n"

  const headers = ["id", "title", "dueDate", "type", "remindDaysBefore"]
  const rows = tasks.map((t) => [t.id, `"${t.title}"`, t.dueDate, t.type, t.remindDaysBefore || 0])

  return [headers, ...rows].map((row) => row.join(",")).join("\n")
}

function generateTodosCSV(todos: any[]): string {
  if (todos.length === 0) return "id,text,completed,createdAt\n"

  const headers = ["id", "text", "completed", "createdAt"]
  const rows = todos.map((t) => [
    t.id,
    `"${(t.text || "").replace(/"/g, '""')}"`, // Properly escape quotes in CSV
    t.completed ? "true" : "false",
    t.createdAt,
  ])

  return [headers, ...rows].map((row) => row.join(",")).join("\n")
}

function generateHabitsCSV(habits: any[]): string {
  if (habits.length === 0) return "id,name,createdAt,completions\n"

  const headers = ["id", "name", "createdAt", "completions"]
  const rows = habits.map((h) => [
    h.id,
    `"${(h.name || "").replace(/"/g, '""')}"`, // Properly escape quotes in CSV
    h.createdAt,
    `"${JSON.stringify(h.completions || {})}"`, // Store completions as JSON string
  ])

  return [headers, ...rows].map((row) => row.join(",")).join("\n")
}

function generateTagsCSV(tags: string[]): string {
  if (tags.length === 0) return "tag\n"

  const headers = ["tag"]
  const rows = tags.map((t) => [`"${t.replace(/"/g, '""')}"`])

  return [headers, ...rows].map((row) => row.join(",")).join("\n")
}

function generateNotificationsCSV(notifications: any[]): string {
  if (notifications.length === 0) return "id,type,title,description,timestamp\n"

  const headers = ["id", "type", "title", "description", "timestamp"]
  const rows = notifications.map((n) => [
    n.id,
    n.type,
    `"${(n.title || "").replace(/"/g, '""')}"`,
    `"${(n.description || "").replace(/"/g, '""')}"`,
    n.timestamp,
  ])

  return [headers, ...rows].map((row) => row.join(",")).join("\n")
}

function generateBackupSummary(data: BackupData): string {
  const date = new Date().toLocaleString()
  return `College Tracker Backup Summary
Generated: ${date}

Summary:
- Subjects: ${data.subjects.length}
- Tasks: ${data.tasks.length}
- To-Dos: ${data.todos.length}
- Habits: ${data.habits.length}
- Tags: ${data.tags.length}
- Notifications: ${data.notifications.length}

Files included:
- subjects.csv - All your subjects with attendance records
- tasks.csv - All exams and assignments
- todos.csv - All to-do items (completed and pending)
- habits.csv - All habits with daily completion history
- tags.csv - All tags used in subjects
- notifications.csv - All notifications and reminders

Each CSV file contains all data for that feature in a standard format that can be imported back or used in other applications.

Note: Habit completions are stored as JSON in the habits.csv file for easy restoration of daily tracking data.
`
}
