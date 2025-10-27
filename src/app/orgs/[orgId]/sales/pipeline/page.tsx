"use client";
import { useState } from "react";

// ===================== stage =====================
interface Stage {
  id: string;
  title: string;
}
const stages: Stage[] = [
  { id: "lead", title: "Lead" },
  { id: "qualified", title: "Qualified" },
  { id: "proposal", title: "Proposal" },
];

function DroppableStage({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border p-4 rounded">
      <h2 className="font-bold mb-4">{title}</h2>
      <div className="min-h-[200px]">{children}</div>
    </div>
  );
}
// ===================== /stage =====================

// ===================== item =====================

interface Item {
  id: string;
  title: string;
  stage: string;
}

const initialItems: Item[] = [
  { id: "1", title: "Sample Item 1", stage: "lead" },
  { id: "2", title: "Sample Item 2", stage: "qualified" },
];
function SortableItem({ id, title }: { id: string; title: string }) {
  return <div className="p-3 mb-2 rounded border cursor-pointer">{title}</div>;
}

// ===================== /item =====================

export default function PipelinePage() {
  const [items, setItems] = useState<Item[]>(initialItems);

  return (
    <div className="grid grid-cols-3 gap-4">
      {stages.map((stage) => {
        const stageItems = items.filter((item) => item.stage === stage.id);
        return (
          <DroppableStage key={stage.id} id={stage.id} title={stage.title}>
            {stageItems.map((item) => (
              <SortableItem key={item.id} id={item.id} title={item.title} />
            ))}
          </DroppableStage>
        );
      })}
    </div>
  );
}
