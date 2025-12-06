"use client"

import { useState } from "react"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  subjectName: string
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteConfirmationModal({
  isOpen,
  subjectName,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  const [checkboxes, setCheckboxes] = useState({
    understand: false,
    permanent: false,
    confirm: false,
  })

  const allChecked = checkboxes.understand && checkboxes.permanent && checkboxes.confirm

  const handleCheckboxChange = (key: keyof typeof checkboxes) => {
    setCheckboxes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleConfirm = () => {
    if (allChecked) {
      onConfirm()
      setCheckboxes({ understand: false, permanent: false, confirm: false })
      onClose()
    }
  }

  const handleClose = () => {
    setCheckboxes({ understand: false, permanent: false, confirm: false })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-2">Delete {subjectName}</h2>
        <p className="text-gray-400 text-sm mb-6">
          This action cannot be undone. Please confirm by checking all boxes below.
        </p>

        {/* Checkboxes */}
        <div className="space-y-4 mb-8">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checkboxes.understand}
              onChange={() => handleCheckboxChange("understand")}
              className="w-5 h-5 rounded border-2 border-gray-600 bg-gray-800 cursor-pointer accent-green-500"
            />
            <span className="text-gray-300 text-sm">I understand this will delete all attendance records</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checkboxes.permanent}
              onChange={() => handleCheckboxChange("permanent")}
              className="w-5 h-5 rounded border-2 border-gray-600 bg-gray-800 cursor-pointer accent-green-500"
            />
            <span className="text-gray-300 text-sm">This action is permanent and cannot be reversed</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checkboxes.confirm}
              onChange={() => handleCheckboxChange("confirm")}
              className="w-5 h-5 rounded border-2 border-gray-600 bg-gray-800 cursor-pointer accent-green-500"
            />
            <span className="text-gray-300 text-sm">I confirm I want to delete this subject</span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 transition rounded-lg font-medium text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!allChecked}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              allChecked
                ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
