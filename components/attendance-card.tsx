"use client"

import { useState } from "react"
import { Minus, Plus, Trash2, Edit } from "lucide-react"
import CircularProgress from "./circular-progress"
import DeleteConfirmationModal from "./delete-confirmation-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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
      <Card className={`h-full flex flex-col ${isBelowRequirement ? "border-destructive/50 bg-destructive/5" : ""}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg font-semibold leading-tight">{subject}</CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onEdit}
                title="Edit subject"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={handleDeleteClick}
                title="Delete subject"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between space-y-4">
          {/* Stats and Progress */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{attended}</span>
                <span className="text-xs text-muted-foreground">Attended</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{missed}</span>
                <span className="text-xs text-muted-foreground">Missed</span>
              </div>
              <div className="flex items-baseline gap-2 pt-1 border-t">
                <span className="text-lg font-semibold">{total}</span>
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
            </div>

            <div className="flex-shrink-0">
              <CircularProgress percentage={percentage} glowColor={effectiveGlowColor} />
            </div>
          </div>

          {/* Requirement Badge and Message */}
          <div className="space-y-2">
            <Badge variant={isBelowRequirement ? "destructive" : "secondary"} className="font-normal">
              {skipMessage}
            </Badge>
            <p className="text-xs text-muted-foreground">Target: {requirement}%</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Attended Controls */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">Attended</p>
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onAttendedDecrease}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onAttendedIncrease}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Missed Controls */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">Missed</p>
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onMissedDecrease}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onMissedIncrease}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        subjectName={subject}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
