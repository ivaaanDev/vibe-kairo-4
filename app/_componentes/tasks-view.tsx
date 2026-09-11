"use client";

import { QuickTaskInput } from "./quick-task-input";
import { TagFilter } from "./tag-filter";
import { TaskList } from "./task-list";
import { ViewHeader } from "./view-header";

export function TasksView() {
  return (
    <>
      <ViewHeader titulo="Tareas" acciones={<TagFilter />}>
        <div className="pt-3 pb-2">
          <QuickTaskInput />
        </div>
      </ViewHeader>
      <TaskList />
    </>
  );
}
