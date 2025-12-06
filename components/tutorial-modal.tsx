"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronLeft, X } from "lucide-react"

interface TutorialModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
    }
  }, [isOpen])

  const steps = [
    {
      title: "✨ New: To-Do List",
      description:
        "Click the checkmark icon to access your to-do list. Add up to 10 todos, check them off to move to the bin, and restore them if needed. The bin clears daily after midnight.",
      icon: "✅",
      isNewFeature: true,
    },
    {
      title: "✨ New: Notification Reminders",
      description:
        "Click the bell icon to view all your notifications including task reminders, backup reminders, and attendance alerts. Press 'Remind Tomorrow' to reschedule reminders for the next day.",
      icon: "🔔",
      isNewFeature: true,
    },
    {
      title: "✨ New: Import & Export",
      description:
        "Use the settings icon to export your data as a backup or import previously saved data. This helps you keep your data safe and transfer it between devices.",
      icon: "💾",
      isNewFeature: true,
    },
    {
      title: "✨ New: Edit Subject Tiles",
      description:
        "Click the blue edit button on any subject card to modify its name, attendance requirement, glow color, and tags. Make changes anytime to keep your subjects up to date.",
      icon: "✏️",
      isNewFeature: true,
    },
    {
      title: "Add Your Subjects",
      description:
        "Click the + button in the top right to add your subjects. You can customize the glow color and add tags to organize them.",
      icon: "➕",
      isNewFeature: false,
    },
    {
      title: "Track Attendance",
      description:
        "Use the + and - buttons to update your attended and missed classes. The percentage circle shows your attendance rate.",
      icon: "📊",
      isNewFeature: false,
    },
    {
      title: "Below Requirement Alert",
      description:
        "When your attendance falls below the requirement, the subject card turns red with a white glow. You can't change the glow color until attendance is back on track.",
      icon: "🔴",
      isNewFeature: false,
    },
    {
      title: "Manage Exams & Assignments",
      description:
        "Click the calendar icon to view and manage your exam dates and assignment deadlines. Set reminders for tasks and they'll appear in your notifications.",
      icon: "📅",
      isNewFeature: false,
    },
    {
      title: "You're All Set!",
      description:
        "Start tracking your attendance and managing your deadlines. Click the X button or anywhere outside this popup to close it.",
      icon: "✨",
      isNewFeature: false,
    },
  ]

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onClose()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const step = steps[currentStep]
  const isNewFeatureSlide = step.isNewFeature

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        className={`rounded-lg p-8 max-w-md w-full mx-4 cursor-default relative ${
          isNewFeatureSlide
            ? "bg-gradient-to-br from-amber-700 via-amber-600 to-amber-800 shadow-lg shadow-amber-500/50"
            : "bg-gray-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-800 rounded transition z-10"
          title="Close tutorial"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Icon */}
        <div className="text-5xl mb-4">{step.icon}</div>

        {/* Title */}
        <h2 className={`text-2xl font-bold mb-3 ${isNewFeatureSlide ? "text-amber-50" : "text-white"}`}>
          {step.title}
        </h2>

        {/* Description */}
        <p className={`mb-6 leading-relaxed ${isNewFeatureSlide ? "text-amber-100" : "text-gray-400"}`}>
          {step.description}
        </p>

        {/* Progress Indicator */}
        <div className="flex gap-1 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition ${
                index === currentStep ? "bg-green-500" : index < currentStep ? "bg-green-500" : "bg-gray-700"
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition flex items-center justify-center gap-2"
          >
            {currentStep === steps.length - 1 ? "Done" : "Next"}
            {currentStep !== steps.length - 1 && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Step Counter */}
        <p className={`text-center text-sm mt-4 ${isNewFeatureSlide ? "text-amber-200" : "text-gray-500"}`}>
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>
    </div>
  )
}
