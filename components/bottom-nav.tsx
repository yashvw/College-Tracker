"use client"

import { GraduationCap, Calendar, CheckSquare, Target } from "lucide-react"

interface BottomNavProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export default function BottomNav({ currentPage, onPageChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 px-2 sm:px-4 py-3 sm:py-4">
      <div className="flex items-center justify-between max-w-full mx-auto gap-1 sm:gap-4">
        <button
          onClick={() => onPageChange("attendance")}
          className={`flex flex-col items-center gap-1 sm:gap-2 py-2 px-2 sm:px-4 rounded-lg transition flex-1 ${
            currentPage === "attendance" ? "text-green-500" : "text-gray-500 hover:text-gray-400"
          }`}
        >
          <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-xs font-medium text-center">Attendance</span>
        </button>
        <button
          onClick={() => onPageChange("todos")}
          className={`flex flex-col items-center gap-1 sm:gap-2 py-2 px-2 sm:px-4 rounded-lg transition flex-1 ${
            currentPage === "todos" ? "text-green-500" : "text-gray-500 hover:text-gray-400"
          }`}
        >
          <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-xs font-medium text-center">Todo</span>
        </button>
        <button
          onClick={() => onPageChange("habits")}
          className={`flex flex-col items-center gap-1 sm:gap-2 py-2 px-2 sm:px-4 rounded-lg transition flex-1 ${
            currentPage === "habits" ? "text-green-500" : "text-gray-500 hover:text-gray-400"
          }`}
        >
          <Target className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-xs font-medium text-center">Habits</span>
        </button>
        <button
          onClick={() => onPageChange("exams")}
          className={`flex flex-col items-center gap-1 sm:gap-2 py-2 px-2 sm:px-4 rounded-lg transition flex-1 ${
            currentPage === "exams" ? "text-green-500" : "text-gray-500 hover:text-gray-400"
          }`}
        >
          <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-xs font-medium text-center">Exams</span>
        </button>
      </div>
    </div>
  )
}
