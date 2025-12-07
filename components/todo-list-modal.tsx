"use client"

import { useState } from "react"
import { Trash2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
        <Input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
          placeholder="Add a new todo..."
          className="flex-1"
        />
        <Button onClick={handleAddTodo} disabled={!newTodo.trim()}>
          Add
        </Button>
      </div>

      {/* Limit Warning */}
      {showLimitWarning && (
        <Card className="p-3 bg-destructive/10 border-destructive">
          <p className="text-destructive text-sm">
            Maximum 10 todos allowed at a time. Complete or delete some todos first.
          </p>
        </Card>
      )}

      {/* Bin Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowBin(!showBin)}
          className="gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Bin
          <Badge variant="secondary" className="ml-1">
            {binTodos.length}
          </Badge>
        </Button>
      </div>

      {/* Bin Section */}
      {showBin && (
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold text-foreground">Deleted Today</h3>
          {binTodos.length === 0 ? (
            <p className="text-muted-foreground text-sm">No deleted todos today</p>
          ) : (
            <div className="space-y-2">
              {binTodos.map((todo) => (
                <Card
                  key={todo.id}
                  className="flex items-center justify-between p-3 bg-muted/50"
                >
                  <span
                    className={`text-sm ${
                      todo.completed ? "line-through text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {todo.text}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRestoreTodo(todo.id)}
                    className="h-8 w-8"
                    title="Restore"
                  >
                    <RotateCcw className="w-4 h-4 text-blue-500" />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Todos List */}
      <div className="space-y-2">
        {todos.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No todos yet. Add one to get started!
          </p>
        ) : (
          todos.map((todo) => (
            <Card
              key={todo.id}
              className="flex items-center gap-3 p-3 hover:bg-accent/50 transition"
            >
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => onToggleTodo(todo.id)}
                className="h-5 w-5"
              />
              <span
                className={`flex-1 ${
                  todo.completed ? "line-through text-muted-foreground" : "text-foreground"
                }`}
              >
                {todo.text}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteTodo(todo.id)}
                className="h-8 w-8"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
