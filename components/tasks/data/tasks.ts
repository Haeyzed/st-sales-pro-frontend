import { labels, priorities, statuses } from "./data"
import { type Task } from "./schema"

// Mock tasks data - in production, this would come from an API
export const tasks: Task[] = Array.from({ length: 100 }, (_, i) => {
  return {
    id: `TASK-${String(i + 1000).padStart(4, "0")}`,
    title: `Task ${i + 1}: Implement feature ${i + 1}`,
    status: statuses[i % statuses.length].value,
    label: labels[i % labels.length].value,
    priority: priorities[i % priorities.length].value,
  }
})
