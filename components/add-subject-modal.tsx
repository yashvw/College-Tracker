"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown, X } from "lucide-react"

interface AddSubjectModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (subject: {
    name: string
    attended: number
    missed: number
    requirement: number
    glowColor: string
    tags: string[]
  }) => void
  existingTags: string[]
}

const GLOW_COLORS = [
  { name: "Green", value: "#22c55e", hex: "#22c55e" },
  { name: "Blue", value: "#3b82f6", hex: "#3b82f6" },
  { name: "Purple", value: "#a855f7", hex: "#a855f7" },
  { name: "Pink", value: "#ec4899", hex: "#ec4899" },
  { name: "Orange", value: "#f97316", hex: "#f97316" },
  { name: "Red", value: "#ef4444", hex: "#ef4444" },
]

export default function AddSubjectModal({ isOpen, onClose, onAdd, existingTags }: AddSubjectModalProps) {
  const [subjectName, setSubjectName] = useState("")
  const [attended, setAttended] = useState(0)
  const [missed, setMissed] = useState(0)
  const [requirement, setRequirement] = useState(0)
  const [glowColor, setGlowColor] = useState("#22c55e")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [requirementError, setRequirementError] = useState("")

  const hasTextInTagField = newTag.trim().length > 0
  const isRequirementZero = requirement === 0
  const canAddSubject = subjectName.trim() && !hasTextInTagField && !isRequirementZero

  const handleAdd = () => {
    if (!canAddSubject) return

    if (requirement === 0) {
      setRequirementError("Requirement cannot be 0")
      return
    }

    onAdd({
      name: subjectName,
      attended,
      missed,
      requirement,
      glowColor,
      tags: selectedTags,
    })
    setSubjectName("")
    setAttended(0)
    setMissed(0)
    setRequirement(0)
    setGlowColor("#22c55e")
    setSelectedTags([])
    setNewTag("")
    setRequirementError("")
  }

  const handleAddTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag))
  }

  const handleToggleExistingTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <h2 className="text-center text-gray-400 text-sm mb-6">Subject Name</h2>

        {/* Input Field */}
        <div className="mb-8">
          <input
            type="text"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder="Ex. Biology"
            className="w-full bg-transparent text-center text-4xl font-bold text-gray-400 placeholder-gray-600 border-b border-gray-700 pb-4 focus:outline-none focus:border-green-500 transition"
          />
        </div>

        {/* Stats Controls */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Attended */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => setAttended(attended + 1)}
              className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition mb-3"
            >
              <ChevronUp className="w-6 h-6 text-green-500" />
            </button>
            <span className="text-2xl font-bold mb-2">{attended}</span>
            <button
              onClick={() => setAttended(Math.max(0, attended - 1))}
              className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition"
            >
              <ChevronDown className="w-6 h-6 text-gray-500" />
            </button>
            <p className="text-gray-400 text-sm mt-3">Attended</p>
          </div>

          {/* Missed */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => setMissed(missed + 1)}
              className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition mb-3"
            >
              <ChevronUp className="w-6 h-6 text-gray-500" />
            </button>
            <span className="text-2xl font-bold mb-2">{missed}</span>
            <button
              onClick={() => setMissed(Math.max(0, missed - 1))}
              className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition"
            >
              <ChevronDown className="w-6 h-6 text-gray-500" />
            </button>
            <p className="text-gray-400 text-sm mt-3">Missed</p>
          </div>

          {/* Requirement */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => {
                setRequirement((prev) => Math.min(100, prev + 5))
                setRequirementError("")
              }}
              className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition mb-3"
              aria-label="Increase requirement"
            >
              <ChevronUp className="w-6 h-6 text-gray-500" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={requirement}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  if (Number.isNaN(v)) return
                  setRequirement(Math.min(100, Math.max(0, Math.round(v))))
                  setRequirementError("")
                }}
                className="w-20 text-center bg-transparent text-2xl font-bold text-gray-400 border-b border-gray-700 pb-1 focus:outline-none"
                aria-label="Requirement percentage"
              />
              <span className="text-gray-400">%</span>
            </div>

            <button
              onClick={() => setRequirement((prev) => Math.max(0, prev - 5))}
              className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition"
              aria-label="Decrease requirement"
            >
              <ChevronDown className="w-6 h-6 text-green-500" />
            </button>
            <p className="text-gray-400 text-sm mt-3">Requirement</p>
            {isRequirementZero && <p className="text-red-500 text-xs mt-2">Cannot be 0</p>}
          </div>
        </div>

        {/* Glow Color */}
        <div className="mb-8">
          <label className="block text-gray-400 text-sm mb-3">Glow Color</label>
          <div className="grid grid-cols-6 gap-2">
            {GLOW_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setGlowColor(color.value)}
                className={`w-full aspect-square rounded-lg transition border-2 ${
                  glowColor === color.value ? "border-white" : "border-gray-700"
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-gray-400 text-sm mb-3">Tags</label>

          {/* Existing Tags as Checkboxes */}
          {existingTags.length > 0 && (
            <div className="mb-4 space-y-2">
              {existingTags.map((tag) => (
                <label key={tag} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => handleToggleExistingTag(tag)}
                    className="w-4 h-4 rounded bg-gray-800 border-gray-700 accent-green-500"
                  />
                  <span className="text-gray-400 text-sm">{tag}</span>
                </label>
              ))}
            </div>
          )}

          {/* Add New Tag */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
              placeholder="Add new tag"
              className="flex-1 bg-gray-800 text-gray-400 placeholder-gray-600 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500 transition"
            />
            <button
              onClick={handleAddTag}
              className={`px-3 py-2 rounded text-sm font-medium transition ${
                hasTextInTagField
                  ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                  : "bg-green-500 hover:bg-green-600 text-black"
              }`}
            >
              Add
            </button>
          </div>

          {/* Selected Tags Display */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <div
                  key={tag}
                  className="bg-green-500 text-black px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:opacity-70 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Button */}
        <button
          onClick={handleAdd}
          disabled={!canAddSubject}
          className={`w-full py-3 rounded-full font-medium transition ${
            canAddSubject
              ? "bg-gray-800 hover:bg-gray-700 text-gray-400 cursor-pointer"
              : "bg-gray-700 text-gray-600 cursor-not-allowed opacity-50"
          }`}
        >
          Add
        </button>

        {/* Close on background click */}
        <div className="fixed inset-0 -z-10" onClick={onClose} />
      </div>
    </div>
  )
}
