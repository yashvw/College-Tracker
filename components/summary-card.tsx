"use client"

import CircularProgress from "./circular-progress"

interface SummaryCardProps {
  subjects: Array<{
    id: string
    name: string
    attended: number
    missed: number
  }>
}

export default function SummaryCard({ subjects }: SummaryCardProps) {
  // Calculate overall attendance percentage
  const totalAttended = subjects.reduce((sum, subject) => sum + subject.attended, 0)
  const totalClasses = subjects.reduce((sum, subject) => sum + subject.attended + subject.missed, 0)
  const overallPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-lg p-8 mb-8 border border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">Overall Attendance</h2>
          <p className="text-gray-400 text-sm mb-4">
            {totalAttended} attended out of {totalClasses} classes
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Total Attended</span>
              <span className="text-green-500 font-semibold">{totalAttended}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Total Missed</span>
              <span className="text-red-500 font-semibold">
                {subjects.reduce((sum, subject) => sum + subject.missed, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Total Subjects</span>
              <span className="text-blue-500 font-semibold">{subjects.length}</span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 ml-8">
          <div className="relative w-32 h-32">
            <CircularProgress percentage={overallPercentage} glowColor="#22c55e" />
          </div>
        </div>
      </div>
    </div>
  )
}
