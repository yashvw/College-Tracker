"use client"

import { useEffect, useState, useRef } from "react"
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from "lucide-react"
import DayScheduleModal, { type ScheduleEntry } from "./day-schedule-modal"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
    // clamp currentDay if schedule changes
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
      {/* Day Navigation Header */}
      <div className="flex items-center mb-4 w-full gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentDay((d) => Math.max(0, d - 1))}
          disabled={currentDay === 0}
          aria-label="Previous day"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1 text-center">
          <h3 className="text-2xl md:text-4xl font-extrabold tracking-wide text-foreground">
            {dayNames[currentDay]}
          </h3>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentDay((d) => Math.min(6, d + 1))}
          disabled={currentDay === 6}
          aria-label="Next day"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 justify-center mb-4">
        <Button
          onClick={() => { setEditing(null); setOpenDay(currentDay) }}
          aria-label="Add schedule entry"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Entry
        </Button>
        <Button
          onClick={() => setShowManage(true)}
          variant="outline"
          className="gap-2"
        >
          <Edit className="h-4 w-4" />
          Manage
        </Button>
      </div>

      {/* Entries for Current Day */}
      {entriesForDay.length === 0 ? (
        <div className="text-muted-foreground text-center py-8">
          No entries for {dayNames[currentDay]}. Tap "Add Entry" to create one.
        </div>
      ) : (
        <div className="space-y-3">
          {entriesForDay.map((s) => {
            const subj = subjects.find((x) => x.name === s.subjectName)
            return (
              <Card key={s.id} className="p-4 hover:bg-accent/50 transition">
                <div className="font-semibold text-foreground mb-2">{s.subjectName}</div>
                {subj?.tags && subj.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {subj.tags.map((t) => (
                      <Badge key={t} variant="secondary">{t}</Badge>
                    ))}
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  {s.startTime} — {s.endTime}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Manage Modal */}
      {showManage && (
        <Dialog open={showManage} onOpenChange={setShowManage}>
          <DialogContent className="sm:max-w-[600px] max-h-[86vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Notification Schedule</DialogTitle>
              <DialogDescription>
                {dayNames[currentDay]} — Edit or delete scheduled notifications
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              {schedule.filter((e) => e.day === currentDay).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No scheduled entries for this day
                </p>
              ) : (
                schedule
                  .filter((e) => e.day === currentDay)
                  .map((e) => {
                    const subj = subjects.find((x) => x.name === e.subjectName)
                    return (
                      <Card key={e.id} className="p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-foreground">{e.subjectName}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {e.startTime} — {e.endTime}
                          </div>
                          {subj?.tags && subj.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {subj.tags.map((t) => (
                                <Badge key={t} variant="secondary">{t}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            onClick={() => { setEditing(e); setOpenDay(e.day); setShowManage(false) }}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleRemove(e.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </Card>
                    )
                  })
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Day Schedule Modal */}
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
