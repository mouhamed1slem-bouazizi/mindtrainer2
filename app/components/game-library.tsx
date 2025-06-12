import { Brain } from "lucide-react"
import { TaskSwitcherGame } from "./games/task-switcher-game"

export const games = [
  {
    id: "taskSwitcher",
    title: "Task Switcher",
    description: "Test your cognitive flexibility by switching between different tasks and rules",
    icon: Brain,
    color: "bg-purple-500",
    difficulty: "Advanced",
    duration: "10-15 min",
    category: "Executive Function",
    component: TaskSwitcherGame,
    skills: ["Cognitive Flexibility", "Task Switching", "Executive Control", "Attention"],
    benefits: [
      "Improves mental flexibility",
      "Enhances multitasking abilities",
      "Strengthens executive control",
      "Develops cognitive adaptability",
    ],
  },
]
