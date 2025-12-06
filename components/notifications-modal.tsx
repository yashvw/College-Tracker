"use client"

import type React from "react"

interface Notification {
  id: string
  type: "reminder" | "backup"
  title: string
  description: string
  timestamp: string
  data?: {
    taskId?: string
  }
  reminderDate?: string
  isDull?: boolean
}

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
  notifications: Notification[]
  onRemoveNotification: (id: string) => void
  onRemindTomorrow: (id: string) => void
  onBackupData?: () => void
  subjects: Array<{
    id: string
    name: string
    attended: number
    missed: number
    requirement: number
  }>
}

export default function NotificationsModal({
  isOpen,
  onClose,
  notifications,
  onRemoveNotification,
  onRemindTomorrow,
  onBackupData,
  subjects,
}: NotificationsModalProps) {
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Notifications</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No notifications yet</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              let borderColor = "border-gray-700"
              let bgColor = "bg-gray-800"
              let iconColor = "text-gray-400"
              let icon = null
              const isDull = notification.isDull || false

              if (notification.type === "reminder") {
                borderColor = isDull ? "border-gray-600" : "border-blue-500"
                bgColor = isDull ? "bg-gray-800 bg-opacity-40" : "bg-blue-900 bg-opacity-20"
                iconColor = isDull ? "text-gray-500" : "text-blue-500"
                icon = <span className={`${iconColor} text-lg flex-shrink-0`}>🕐</span>
              } else if (notification.type === "backup") {
                borderColor = isDull ? "border-gray-600" : "border-orange-500"
                bgColor = isDull ? "bg-gray-800 bg-opacity-40" : "bg-orange-900 bg-opacity-20"
                iconColor = isDull ? "text-gray-500" : "text-orange-500"
                icon = <span className={`${iconColor} text-lg flex-shrink-0`}>⚠️</span>
              }

              return (
                <div
                  key={notification.id}
                  className={`rounded-lg p-4 border ${borderColor} ${bgColor} ${isDull ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    {icon}

                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold ${isDull ? "text-gray-500" : "text-white"}`}>
                        {notification.title}
                      </h3>
                      <p className={`text-sm mt-1 ${isDull ? "text-gray-600" : "text-gray-300"}`}>
                        {notification.description}
                      </p>
                      <p className={`text-xs mt-2 ${isDull ? "text-gray-700" : "text-gray-500"}`}>
                        {notification.timestamp}
                        {isDull && notification.reminderDate && (
                          <> • Reminder set for {new Date(notification.reminderDate).toLocaleDateString()}</>
                        )}
                      </p>

                      {!isDull && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {notification.type === "reminder" && (
                            <button
                              onClick={() => onRemindTomorrow(notification.id)}
                              className="flex-1 min-w-fit px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition"
                            >
                              Remind Tomorrow
                            </button>
                          )}
                          {notification.type === "backup" && onBackupData && (
                            <button
                              onClick={() => {
                                onBackupData()
                                onRemoveNotification(notification.id)
                              }}
                              className="flex-1 min-w-fit px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition"
                            >
                              Backup Data
                            </button>
                          )}
                          <button
                            onClick={() => onRemoveNotification(notification.id)}
                            className="flex-1 min-w-fit px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
