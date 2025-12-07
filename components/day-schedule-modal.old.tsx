"use client"

import { X } from "lucide-react"
import { useState, useEffect } from "react"

interface SubjectItem {
  id: string
  name: string
  tags?: string[]
}
export interface ScheduleEntry {
  id: string
  day: number // 0 = Sunday .. 6 = Saturday
  startTime: string // "HH:MM"
  endTime: string // "HH:MM"
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
  const [startAm, setStartAm] = useState<string>(initial ? (Number(initial.startTime?.split(":" )[0]) >= 12 ? "PM" : "AM") : "")
  const [endAm, setEndAm] = useState<string>(initial ? (Number(initial.endTime?.split(":" )[0]) >= 12 ? "PM" : "AM") : "")
  const [subjectName, setSubjectName] = useState(initial?.subjectName || "")
  const [notifyOffset, setNotifyOffset] = useState<string>(initial?.notifyOffset != null ? String(initial?.notifyOffset) : "")
  const [notifyWhen, setNotifyWhen] = useState<string>((initial?.notifyWhen as string) || "")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  useEffect(() => {
    if (initial) {
      setStartTime(initial.startTime || "08:00")
      setEndTime(initial.endTime || "09:00")
      // set AM/PM based on stored 24h times
      try {
        const sh = initial.startTime?.split(":" )?.[0]
        const eh = initial.endTime?.split(":" )?.[0]
        if (sh != null) setStartAm(Number(sh) >= 12 ? "PM" : "AM")
        if (eh != null) setEndAm(Number(eh) >= 12 ? "PM" : "AM")
      } catch (e) {
        // ignore
      }
      setSubjectName(initial.subjectName || "")
      setNotifyOffset(initial.notifyOffset != null ? String(initial.notifyOffset) : "")
      setNotifyWhen((initial.notifyWhen as string) || "")
      // pre-select tag if subject exists in subjects list
      if (initial.subjectName) {
        const found = subjects.find((s) => s.name === initial.subjectName)
        if (found && found.tags && found.tags.length > 0) setSelectedTag(found.tags[0])
      }
    }
  }, [initial, isOpen])

  if (!isOpen) return null

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  const handleSave = () => {
    if (!startAm || !endAm) {
      alert("Please select AM/PM for both start and end times")
      return
    }

    if (!subjectName.trim()) {
      alert("Please select an existing subject from the list before saving")
      return
    }

    if (!notifyOffset || isNaN(Number(notifyOffset))) {
      alert("Please enter a valid minutes value for notification")
      return
    }

    if (!notifyWhen) {
      alert("Please select Before or After for the notification")
      return
    }

    const entry: ScheduleEntry = {
      id: initial?.id || Date.now().toString(),
      day,
      startTime: convertTo24(startTime, startAm),
      endTime: convertTo24(endTime, endAm),
      subjectName: subjectName.trim(),
      notifyOffset: Number(notifyOffset),
      notifyWhen: notifyWhen as "before" | "after",
    }

    onSave(entry)
    onClose()
  }

  // build tag list: include global tags saved in localStorage (Tag management)
  let savedTags: string[] = []
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("tags")
      if (raw) savedTags = JSON.parse(raw)
    } catch (e) {
      // ignore parse errors
    }
  }

  const allTags = Array.from(new Set([...(savedTags || []), ...subjects.flatMap((s) => s.tags || [])]))

  const timeAmPmValid = !!startAm && !!endAm

  function convertTo24(time: string, ampm: string) {
    // time: "HH:MM" (from input). ampm: "AM" | "PM"
    const [hhStr, mm] = time.split(":" )
    let hh = Number(hhStr)
    if (ampm === "AM") {
      if (hh === 12) hh = 0
    } else if (ampm === "PM") {
      if (hh < 12) hh += 12
    }
    return `${String(hh).padStart(2, "0")}:${mm}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 md:items-center md:justify-center" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-none md:rounded-2xl p-0 md:p-6 w-full h-full max-w-none max-h-none mx-0 md:w-full md:h-auto md:max-w-xl md:mx-4 flex flex-col"
        style={{ maxHeight: '100vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 md:p-0 flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{dayNames[day]}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-sm text-gray-300">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Time slot</label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-3 py-2 w-full" />
                <select value={startAm} onChange={(e) => setStartAm(e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-3 py-2 w-24">
                  <option value="">AM/PM</option>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-3 py-2 w-full" />
                <select value={endAm} onChange={(e) => setEndAm(e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-3 py-2 w-24">
                  <option value="">AM/PM</option>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            {!timeAmPmValid && (
              <div className="text-xs text-yellow-300 mt-2">Select AM/PM for both start and end times to continue.</div>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Subject</label>

            <div className="mb-2 flex gap-2 flex-wrap">
              {allTags.length === 0 && <span className="text-xs text-gray-500">No tags</span>}
              {allTags.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    if (!timeAmPmValid) return
                    setSelectedTag(selectedTag === t ? null : t)
                    setSubjectName("")
                  }}
                  disabled={!timeAmPmValid}
                  className={`text-xs px-3 py-1 rounded-full ${selectedTag === t ? "bg-green-500 text-black" : "bg-gray-800 text-gray-300"} ${!timeAmPmValid ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Selected subject display */}
            {subjectName ? (
                <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Selected subject</label>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-green-500 text-black rounded text-sm break-words">{subjectName}</div>
                  <button
                    onClick={() => setSubjectName("")}
                    className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800"
                    aria-label="Clear selected subject"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : null}

            <div className="bg-gray-800 border border-gray-700 rounded px-2 py-2 max-h-40 overflow-y-auto">
              {!selectedTag && (
                <div className="text-xs text-gray-400 px-2 py-2">Select a tag to view subjects.</div>
              )}

              {selectedTag && subjects.filter((s) => (s.tags || []).includes(selectedTag)).length === 0 && (
                <div className="text-xs text-gray-500 px-2 py-2">No subjects under this tag</div>
              )}

              {selectedTag && subjects
                .filter((s) => (s.tags || []).includes(selectedTag))
                .sort((a, b) => {
                  const aTag = (a.tags && a.tags[0]) || ""
                  const bTag = (b.tags && b.tags[0]) || ""
                  if (aTag === bTag) return a.name.localeCompare(b.name)
                  return aTag.localeCompare(bTag)
                })
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSubjectName(s.name)}
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between ${subjectName === s.name ? 'bg-green-500 text-black' : 'hover:bg-gray-700'}`}
                  >
                    <div className="break-words">{s.name}</div>
                    <div className="text-xs text-gray-400">{(s.tags || []).join(", ")}</div>
                  </button>
                ))}
            </div>

            <div className="mt-2">
              <div className="text-xs text-gray-500">Select a subject from the list above. To add new subjects, use the Subject management screen.</div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Notification</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={notifyOffset}
                onChange={(e) => setNotifyOffset(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 w-24"
                placeholder=""
              />
              <span className="text-gray-400">mins</span>
              <select value={notifyWhen} onChange={(e) => setNotifyWhen(e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-3 py-2">
                <option value="">Select</option>
                <option value="before">Before</option>
                <option value="after">After</option>
              </select>
              <span className="text-gray-400">the lecture</span>
            </div>
            {!notifyWhen && (
              <div className="text-xs text-yellow-300 mt-2">Open the dropdown and select "Before" or "After" to continue.</div>
            )}
          </div>

          <div className="flex gap-3 pt-3">
            <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300">Cancel</button>
            <button
              onClick={handleSave}
              disabled={!(timeAmPmValid && subjectName && notifyWhen && notifyOffset && !isNaN(Number(notifyOffset)))}
              className={`flex-1 px-4 py-2 rounded-lg text-black ${timeAmPmValid && subjectName && notifyWhen && notifyOffset && !isNaN(Number(notifyOffset)) ? 'bg-green-500 hover:bg-green-600' : 'bg-green-700 opacity-60 cursor-not-allowed'}`}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
