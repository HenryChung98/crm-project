"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Item = {
  id: string;
  title: string;
  stage: string;
};

type Stage = {
  id: string;
  title: string;
};

const stages: Stage[] = [
  { id: "lead", title: "Lead" },
  { id: "qualified", title: "Qualified" },
  { id: "proposal", title: "Proposal" },
];

const initialItems: Item[] = [
  { id: "1", title: "Sample Item 1", stage: "lead" },
  { id: "2", title: "Sample Item 2", stage: "lead" },
];

function SortableItem({ id, title }: { id: string; title: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 mb-2 rounded border cursor-pointer"
    >
      {title}
    </div>
  );
}

function DroppableStage({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="border p-4 rounded">
      <h2 className="font-bold mb-4">{title}</h2>
      <div className="min-h-[200px]">{children}</div>
    </div>
  );
}

export default function DNDEgPage() {
  const [items, setItems] = useState<Item[]>(initialItems);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeItem = items.find((item) => item.id === activeId);
    if (!activeItem) return;

    const overStage = stages.find((stage) => stage.id === overId);

    if (overStage && activeItem.stage !== overId) {
      setItems(items.map((item) => (item.id === activeId ? { ...item, stage: overId } : item)));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeItem = items.find((item) => item.id === activeId);
    const overItem = items.find((item) => item.id === overId);

    if (!activeItem || !overItem) return;

    if (activeItem.stage === overItem.stage) {
      const stageItems = items.filter((item) => item.stage === activeItem.stage);
      const oldIndex = stageItems.findIndex((item) => item.id === activeId);
      const newIndex = stageItems.findIndex((item) => item.id === overId);

      const reorderedStageItems = arrayMove(stageItems, oldIndex, newIndex);
      const otherItems = items.filter((item) => item.stage !== activeItem.stage);

      setItems([...otherItems, ...reorderedStageItems]);
    }
  };

  return (
    <div className="p-8">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-3 gap-4">
          {stages.map((stage) => {
            const stageItems = items.filter((item) => item.stage === stage.id);
            return (
              <DroppableStage key={stage.id} id={stage.id} title={stage.title}>
                <SortableContext
                  items={stageItems.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {stageItems.map((item) => (
                    <SortableItem key={item.id} id={item.id} title={item.title} />
                  ))}
                </SortableContext>
              </DroppableStage>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}
