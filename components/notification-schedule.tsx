"use client"

import { useEffect, useState, useRef } from "react"
import DayScheduleModal, { type ScheduleEntry } from "./day-schedule-modal"

interface Subject {
  id: string
  name: string
  tags?: string[]
}

interface Props {
  subjects: Subject[]
}

export default function NotificationSchedule({ subjects }: Props) {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('notificationSchedule') : null;
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [openDay, setOpenDay] = useState<number | null>(null)
  const [editing, setEditing] = useState<ScheduleEntry | null>(null)
  const [showManage, setShowManage] = useState(false)

  // Removed duplicate localStorage load effect, now handled in useState initializer

  useEffect(() => {
    try {
      localStorage.setItem("notificationSchedule", JSON.stringify(schedule))
    } catch (e) {
      console.error(e)
    }
  }, [schedule])

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  const handleAdd = (day: number) => {
    setEditing(null)
    setOpenDay(day)
  }

  const handleEdit = (entry: ScheduleEntry) => {
    setEditing(entry)
    setOpenDay(entry.day)
  }

  const handleSave = (entry: ScheduleEntry) => {
    setSchedule((prev) => {
      const exists = prev.find((p) => p.id === entry.id)
      if (exists) return prev.map((p) => (p.id === entry.id ? entry : p))
      return [...prev, entry]
    })
  }

  const handleRemove = (id: string) => {
    setSchedule((prev) => prev.filter((p) => p.id !== id))
  }

  const [currentDay, setCurrentDay] = useState<number>(0)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    // clamp currentDay if schedule changes (not strictly necessary but safe)
    if (currentDay < 0) setCurrentDay(0)
    if (currentDay > 6) setCurrentDay(6)
  }, [currentDay])

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx > 50) {
      // swipe right -> previous day
      setCurrentDay((d) => Math.max(0, d - 1))
    } else if (dx < -50) {
      // swipe left -> next day
      setCurrentDay((d) => Math.min(6, d + 1))
    }
    touchStartX.current = null
  }

  const entriesForDay = schedule.filter((s) => s.day === currentDay)

  return (
      <div
        className="p-0 flex flex-col items-stretch w-full max-w-none md:max-w-4xl lg:max-w-5xl mx-auto h-[60vh] md:h-[70vh] max-h-[88vh] md:max-h-none overflow-hidden md:overflow-visible"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex items-center mb-2 w-full">
          <div className="flex-1 flex items-center">
            <button
              onClick={() => setCurrentDay((d) => Math.max(0, d - 1))}
              className="px-2 py-2 bg-gray-700 rounded hover:bg-gray-600 text-xl font-bold flex items-center justify-center"
              aria-label="Previous day"
            >
              &#x25C0;
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <h3 className="text-2xl md:text-4xl font-extrabold tracking-wide text-white px-2 text-center">{dayNames[currentDay]}</h3>
          </div>
          <div className="flex-1 flex items-center justify-end">
            <button
              onClick={() => setCurrentDay((d) => Math.min(6, d + 1))}
              className="px-2 py-2 bg-gray-700 rounded hover:bg-gray-600 text-xl font-bold flex items-center justify-center"
              aria-label="Next day"
            >
              &#x25B6;
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-center mb-2">
          <button
            onClick={() => { setEditing(null); setOpenDay(currentDay) }}
            aria-label="Add schedule entry"
            className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-2xl font-bold text-white"
          >
            +
          </button>
          <button onClick={() => setShowManage(true)} className="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600 text-sm">Manage</button>
        </div>

        {entriesForDay.length === 0 ? (
          <div className="text-gray-400">No entries for {dayNames[currentDay]}. Tap + to add.</div>
        ) : (
          <div className="space-y-3">
            {entriesForDay.map((s) => {
              const subj = subjects.find((x) => x.name === s.subjectName)
              return (
                <div key={s.id} className="bg-gray-800 rounded-lg shadow p-2 border border-gray-700">
                  <div className="font-semibold text-white">{s.subjectName}</div>
                  {subj?.tags && subj.tags.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {subj.tags.map((t) => (
                        <span key={t} className="text-xs bg-gray-700 text-gray-200 rounded-md px-2 py-0.5">{t}</span>
                      ))}
                    </div>
                  ) : null}
                  <div className="text-xs text-gray-400 mt-2">{s.startTime} — {s.endTime}</div>
                </div>
              )
            })}
          </div>
        )}

      {showManage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60" onClick={() => setShowManage(false)}>
          <div className="bg-gray-900 rounded-2xl p-4 md:p-6 w-full max-w-none md:max-w-4xl h-[86vh] md:h-[80vh] mx-4 md:mx-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-2 md:p-0 flex-1 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Manage Notification Schedule — {dayNames[currentDay]}</h3>
                <button onClick={() => setShowManage(false)} className="px-2 py-1 bg-gray-800 rounded">Close</button>
              </div>

              <div className="space-y-2 max-h-[46vh] md:max-h-72 overflow-y-auto">
                {schedule.filter((e) => e.day === currentDay).length === 0 ? (
                  <div className="text-gray-400">No scheduled entries for this day</div>
                ) : (
                  <>
                    {schedule
                      .filter((e) => e.day === currentDay)
                      .map((e) => {
                        const subj = subjects.find((x) => x.name === e.subjectName)
                        return (
                          <div key={e.id} className="bg-gray-800 rounded p-3 flex items-center justify-between">
                            <div>
                              <div className="font-semibold">{e.subjectName}</div>
                              <div className="text-xs text-gray-400">{e.startTime} — {e.endTime}</div>
                              {subj?.tags && subj.tags.length > 0 ? (
                                <div className="mt-1 flex flex-wrap gap-2">
                                  {subj.tags.map((t) => (
                                    <span key={t} className="text-xs bg-gray-700 text-gray-200 rounded-md px-2 py-0.5">{t}</span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => { setEditing(e); setOpenDay(e.day); setShowManage(false) }} className="px-3 py-1 bg-gray-700 rounded">Edit</button>
                              <button onClick={() => handleRemove(e.id)} className="px-3 py-1 bg-red-900 rounded">Delete</button>
                            </div>
                          </div>
                        )
                      })}
                  </>
                )}
              </div>

              {/* Removed bottom Close button for cleaner UI */}
            </div>
          </div>
        </div>
      )}

      {openDay !== null && (
        <DayScheduleModal
          isOpen={true}
          onClose={() => { setOpenDay(null); setEditing(null) }}
          day={openDay}
          subjects={subjects.map(s => ({ id: s.id, name: s.name, tags: s.tags }))}
          initial={editing ?? undefined}
          onSave={(entry) => {
            handleSave(entry)
            setCurrentDay(entry.day)
          }}
        />
      )}
    </div>
  )
}
