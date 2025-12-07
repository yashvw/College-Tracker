"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

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
  const isNewFeature = step.isNewFeature
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="text-5xl mb-2">{step.icon}</div>
          <DialogTitle className="text-2xl">
            {step.title}
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed pt-2">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              {currentStep === steps.length - 1 ? "Done" : "Next"}
              {currentStep !== steps.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
