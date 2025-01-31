import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CircleOff,
  PencilLine,
  Timer,
} from "lucide-react";

export const statuses = [
  {
    value: "Scheduled",
    label: "Scheduled",
    icon: Timer,
  },
  {
    value: "Canceled",
    label: "Canceled",
    icon: CircleOff,
  },
  {
    value: "Updated",
    label: "Updated",
    icon: PencilLine,
  },
];

export const priorities = [
  {
    label: "Low",
    value: "low",
    icon: ArrowDown,
  },
  {
    label: "Medium",
    value: "medium",
    icon: ArrowRight,
  },
  {
    label: "High",
    value: "high",
    icon: ArrowUp,
  },
];
