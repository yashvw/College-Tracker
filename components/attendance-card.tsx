"use client"

import { useState } from "react"
import { Minus, Plus, Trash2, Edit } from "lucide-react"
import CircularProgress from "./circular-progress"
import DeleteConfirmationModal from "./delete-confirmation-modal"

interface AttendanceCardProps {
  subjectId: string
  subject: string
  attended: number
  missed: number
  requirement: number
  glowColor?: string
  onAttendedIncrease: () => void
  onAttendedDecrease: () => void
  onMissedIncrease: () => void
  onMissedDecrease: () => void
  onDelete: () => void
  onEdit: () => void
}

export default function AttendanceCard({
  subjectId,
  subject,
  attended,
  missed,
  requirement,
  glowColor = "#22c55e",
  onAttendedIncrease,
  onAttendedDecrease,
  onMissedIncrease,
  onMissedDecrease,
  onDelete,
  onEdit,
}: AttendanceCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const total = attended + missed
  const percentage = total > 0 ? Math.round((attended / total) * 100) : 0

  const isBelowRequirement = percentage < requirement && total > 0
  const effectiveGlowColor = isBelowRequirement ? "#ffffff" : glowColor

  let skipMessage = ""

  if (isBelowRequirement && total > 0) {
    // Formula: (attended + x) / (total + x) > requirement/100
    // Solving for x: x > (requirement/100 * total - attended) / (1 - requirement/100)
    const classesNeeded = Math.ceil(((requirement / 100) * total - attended) / (1 - requirement / 100))
    skipMessage = `${classesNeeded} class${classesNeeded !== 1 ? "es" : ""} needed to get back on track 💀`
  } else if (total > 0) {
    const maxSkippable = Math.floor((attended - (requirement / 100) * total) / (requirement / 100))
    skipMessage = `You can skip ${Math.max(0, maxSkippable)} class${maxSkippable !== 1 ? "es" : ""}`
  } else {
    skipMessage = "Start tracking attendance"
  }

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    setIsDeleteModalOpen(false)
    onDelete()
  }

  return (
    <>
      <div
        className={`rounded-2xl p-6 h-full flex flex-col justify-between relative ${
          isBelowRequirement ? "bg-red-950" : "bg-gray-900"
        }`}
      >
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg border-2 border-blue-500 hover:bg-blue-500 hover:bg-opacity-10 transition"
            title="Edit subject"
          >
            <Edit className="w-4 h-4 text-blue-500" />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-1.5 rounded-lg border-2 border-red-500 hover:bg-red-500 hover:bg-opacity-10 transition"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>

        {/* Header */}
        <h2 className="text-xl font-bold mb-4 pr-12">{subject}</h2>

        {/* Stats and Progress */}
        <div className="flex justify-between items-center mb-4 flex-1">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{attended}</span>
              <span className="text-gray-500 text-xs">Attended</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{missed}</span>
              <span className="text-gray-500 text-xs">Missed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{total}</span>
              <span className="text-gray-500 text-xs">Total</span>
            </div>
          </div>

          <div className="flex-shrink-0">
            <CircularProgress percentage={percentage} glowColor={effectiveGlowColor} />
          </div>
        </div>

        {/* Requirement - Dynamic Message */}
        <div className="mb-4">
          <p className="text-white font-medium text-sm mb-1">{skipMessage}</p>
          <p className="text-gray-500 text-xs">Requirement : {requirement}%</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 text-xs">
          {/* Attended Controls */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Attended</span>
            <button
              onClick={onAttendedDecrease}
              className="p-1.5 rounded-full border border-gray-700 hover:border-gray-600 transition"
            >
              <Minus className="w-3 h-3 text-gray-400" />
            </button>
            <button
              onClick={onAttendedIncrease}
              className="p-1.5 rounded-full bg-green-500 hover:bg-green-600 transition"
            >
              <Plus className="w-3 h-3 text-black" />
            </button>
          </div>

          {/* Missed Controls */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Missed</span>
            <button
              onClick={onMissedDecrease}
              className="p-1.5 rounded-full border border-gray-700 hover:border-gray-600 transition"
            >
              <Minus className="w-3 h-3 text-gray-400" />
            </button>
            <button
              onClick={onMissedIncrease}
              className="p-1.5 rounded-full bg-green-500 hover:bg-green-600 transition"
            >
              <Plus className="w-3 h-3 text-black" />
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        subjectName={subject}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
