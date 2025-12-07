"use client"

import { useState, useEffect } from "react"
import { ChevronUp, ChevronDown, X, Plus } from "lucide-react"
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
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

interface Subject {
  id: string
  name: string
  attended: number
  missed: number
  requirement: number
  glowColor: string
  tags: string[]
}

interface EditSubjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (subjectId: string, updates: Partial<Subject>) => void
  subject: Subject
  existingTags: string[]
}

const GLOW_COLORS = [
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Orange", value: "#f97316" },
  { name: "Red", value: "#ef4444" },
]

export default function EditSubjectModal({ isOpen, onClose, onSave, subject, existingTags }: EditSubjectModalProps) {
  const [subjectName, setSubjectName] = useState("")
  const [attended, setAttended] = useState(0)
  const [missed, setMissed] = useState(0)
  const [requirement, setRequirement] = useState(75)
  const [glowColor, setGlowColor] = useState("#22c55e")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    if (subject) {
      setSubjectName(subject.name)
      setAttended(subject.attended)
      setMissed(subject.missed)
      setRequirement(subject.requirement)
      setGlowColor(subject.glowColor)
      setSelectedTags(subject.tags)
    }
  }, [subject, isOpen])

  const canSave = subjectName.trim()

  const handleSave = () => {
    if (!canSave) return

    onSave(subject.id, {
      name: subjectName,
      attended,
      missed,
      requirement,
      glowColor,
      tags: selectedTags,
    })
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Subject</DialogTitle>
          <DialogDescription>
            Update attendance and settings for this subject
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Subject Name */}
          <div className="space-y-2">
            <Label htmlFor="subject-name">Subject Name</Label>
            <Input
              id="subject-name"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="e.g., Physics, Mathematics, Chemistry"
              className="text-lg"
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* Attended */}
            <div className="space-y-2">
              <Label className="text-xs text-center block">Attended</Label>
              <Card className="p-3">
                <div className="flex flex-col items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAttended(attended + 1)}
                    className="h-8 w-8"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <span className="text-2xl font-bold">{attended}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAttended(Math.max(0, attended - 1))}
                    className="h-8 w-8"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>

            {/* Missed */}
            <div className="space-y-2">
              <Label className="text-xs text-center block">Missed</Label>
              <Card className="p-3">
                <div className="flex flex-col items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMissed(missed + 1)}
                    className="h-8 w-8"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <span className="text-2xl font-bold">{missed}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMissed(Math.max(0, missed - 1))}
                    className="h-8 w-8"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>

            {/* Requirement */}
            <div className="space-y-2">
              <Label className="text-xs text-center block">Requirement</Label>
              <Card className="p-3">
                <div className="flex flex-col items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setRequirement((prev) => Math.min(100, prev + 5))}
                    className="h-8 w-8"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={requirement}
                      onChange={(e) => {
                        const v = Number(e.target.value)
                        if (!isNaN(v)) setRequirement(Math.min(100, Math.max(1, v)))
                      }}
                      className="w-14 text-center text-lg font-bold h-8 px-1"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setRequirement((prev) => Math.max(1, prev - 5))}
                    className="h-8 w-8"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Glow Color */}
          <div className="space-y-2">
            <Label>Progress Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {GLOW_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setGlowColor(color.value)}
                  className={`w-full aspect-square rounded-lg transition border-2 ${
                    glowColor === color.value ? "border-primary ring-2 ring-primary/20" : "border-border"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  aria-label={`Select ${color.name} color`}
                />
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label>Tags</Label>

            {/* Existing Tags */}
            {existingTags.length > 0 && (
              <div className="space-y-2">
                {existingTags.map((tag) => (
                  <div key={tag} className="flex items-center gap-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => handleToggleExistingTag(tag)}
                    />
                    <Label
                      htmlFor={`tag-${tag}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {tag}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Tag */}
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                placeholder="Create new tag"
                className="flex-1"
              />
              <Button
                onClick={handleAddTag}
                variant="secondary"
                size="sm"
                disabled={!newTag.trim()}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="default" className="pl-3 pr-1 py-1">
                    {tag}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveTag(tag)}
                      className="h-4 w-4 ml-1 hover:bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!canSave}
              className="flex-1"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
