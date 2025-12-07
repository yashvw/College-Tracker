"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface SubjectItem {
  id: string
  name: string
  tags?: string[]
}

export interface ScheduleEntry {
  id: string
  day: number
  startTime: string // "HH:MM" in 24-hour format
  endTime: string
  subjectName: string
  notifyOffset: number
  notifyWhen: "before" | "after"
}

interface Props {
  isOpen: boolean
  onClose: () => void
  day: number
  subjects: SubjectItem[]
  initial?: Partial<ScheduleEntry>
  onSave: (entry: ScheduleEntry) => void
}

export default function DayScheduleModal({ isOpen, onClose, day, subjects, initial, onSave }: Props) {
  const [startTime, setStartTime] = useState(initial?.startTime || "08:00")
  const [endTime, setEndTime] = useState(initial?.endTime || "09:00")
  const [subjectName, setSubjectName] = useState(initial?.subjectName || "")
  const [notifyOffset, setNotifyOffset] = useState<string>(
    initial?.notifyOffset != null ? String(initial.notifyOffset) : "15"
  )
  const [notifyWhen, setNotifyWhen] = useState<"before" | "after">(initial?.notifyWhen || "before")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  useEffect(() => {
    if (initial) {
      setStartTime(initial.startTime || "08:00")
      setEndTime(initial.endTime || "09:00")
      setSubjectName(initial.subjectName || "")
      setNotifyOffset(initial.notifyOffset != null ? String(initial.notifyOffset) : "15")
      setNotifyWhen(initial.notifyWhen || "before")

      if (initial.subjectName) {
        const found = subjects.find((s) => s.name === initial.subjectName)
        if (found && found.tags && found.tags.length > 0) setSelectedTag(found.tags[0])
      }
    }
  }, [initial, isOpen, subjects])

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  const handleSave = () => {
    if (!subjectName.trim()) {
      alert("Please select a subject")
      return
    }

    if (!notifyOffset || isNaN(Number(notifyOffset))) {
      alert("Please enter a valid notification time (minutes)")
      return
    }

    const entry: ScheduleEntry = {
      id: initial?.id || Date.now().toString(),
      day,
      startTime, // Already in 24-hour format
      endTime,
      subjectName: subjectName.trim(),
      notifyOffset: Number(notifyOffset),
      notifyWhen,
    }

    onSave(entry)
    onClose()
  }

  const savedTags: string[] = []
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("tags")
      if (raw) savedTags.push(...JSON.parse(raw))
    } catch (e) {
      // ignore
    }
  }

  const allTags = Array.from(new Set([...savedTags, ...subjects.flatMap((s) => s.tags || [])]))

  const filteredSubjects = selectedTag
    ? subjects.filter((s) => (s.tags || []).includes(selectedTag))
    : []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dayNames[day]}</DialogTitle>
          <DialogDescription>
            Add a class schedule and set notification reminder
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Time Slots */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Subject Selection */}
          <div className="space-y-3">
            <Label>Subject</Label>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Subject Display */}
            {subjectName ? (
              <Card>
                <CardContent className="p-3 flex items-center justify-between">
                  <span className="font-medium">{subjectName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSubjectName("")}
                  >
                    Change
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-3 max-h-40 overflow-y-auto">
                  {!selectedTag ? (
                    <p className="text-muted-foreground text-xs text-center py-2">
                      Select a tag to view subjects
                    </p>
                  ) : filteredSubjects.length === 0 ? (
                    <p className="text-muted-foreground text-xs text-center py-2">
                      No subjects with this tag
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {filteredSubjects.map((subject) => (
                        <Button
                          key={subject.id}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => setSubjectName(subject.name)}
                        >
                          {subject.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!subjectName && allTags.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Add subjects with tags first, or select a subject from the list above
              </p>
            )}
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <Label>Notification</Label>

            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="notify-offset" className="text-xs">Minutes</Label>
                <Input
                  id="notify-offset"
                  type="number"
                  min="1"
                  max="60"
                  value={notifyOffset}
                  onChange={(e) => setNotifyOffset(e.target.value)}
                  placeholder="15"
                />
              </div>

              <div className="flex-1">
                <Label className="text-xs">When</Label>
                <Select value={notifyWhen} onValueChange={(v) => setNotifyWhen(v as "before" | "after")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before">Before</SelectItem>
                    <SelectItem value="after">After</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Get notified {notifyOffset || "___"} minutes {notifyWhen} the class
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!subjectName.trim() || !notifyOffset}
              className="flex-1"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
