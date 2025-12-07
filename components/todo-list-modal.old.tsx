"use client"

import { useState } from "react"
import { Trash2, RotateCcw } from "lucide-react"

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

interface TodoListModalProps {
  todos: Todo[]
  onAddTodo: (text: string) => void
  onToggleTodo: (id: string) => void
  onDeleteTodo: (id: string) => void
  onRestoreTodo: (id: string) => void
  binTodos: Todo[]
}

export default function TodoListModal({
  todos,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onRestoreTodo,
  binTodos,
}: TodoListModalProps) {
  const [newTodo, setNewTodo] = useState("")
  const [showBin, setShowBin] = useState(false)
  const [showLimitWarning, setShowLimitWarning] = useState(false)

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      if (todos.length >= 10) {
        setShowLimitWarning(true)
        setTimeout(() => setShowLimitWarning(false), 3000)
        return
      }
      onAddTodo(newTodo)
      setNewTodo("")
    }
  }

  return (
    <div className="space-y-4">
      {/* Add Todo Section */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddTodo()}
          placeholder="Add a new todo..."
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition"
        />
        <button
          onClick={handleAddTodo}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition"
        >
          Add
        </button>
      </div>

      {/* Limit Warning */}
      {showLimitWarning && (
        <div className="p-3 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg text-red-300 text-sm">
          Maximum 10 todos allowed at a time. Complete or delete some todos first.
        </div>
      )}

      {/* Bin Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowBin(!showBin)}
          className="flex items-center gap-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition"
        >
          <Trash2 className="w-4 h-4" />
          Bin ({binTodos.length})
        </button>
      </div>

      {/* Bin Section */}
      {showBin && (
        <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-white mb-3">Deleted Today</h3>
          {binTodos.length === 0 ? (
            <p className="text-gray-500 text-sm">No deleted todos today</p>
          ) : (
            binTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-800"
              >
                <span className={`text-sm ${todo.completed ? "line-through text-gray-500" : "text-gray-400"}`}>
                  {todo.text}
                </span>
                <button
                  onClick={() => onRestoreTodo(todo.id)}
                  className="p-1 hover:bg-gray-800 rounded transition"
                  title="Restore"
                >
                  <RotateCcw className="w-4 h-4 text-blue-400" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Todos List */}
      <div className="space-y-2">
        {todos.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No todos yet. Add one to get started!</p>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggleTodo(todo.id)}
                className="w-5 h-5 rounded cursor-pointer accent-green-500"
              />
              <span className={`flex-1 ${todo.completed ? "line-through text-gray-500" : "text-white"}`}>
                {todo.text}
              </span>
              <button
                onClick={() => onDeleteTodo(todo.id)}
                className="p-1 hover:bg-gray-700 rounded transition"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
