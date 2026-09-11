import type { Metadata } from "next";
import { TasksView } from "@/app/_componentes/tasks-view";

export const metadata: Metadata = { title: "Tareas" };

export default function PaginaTareas() {
  return <TasksView />;
}
