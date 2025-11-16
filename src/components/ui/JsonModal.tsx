import React, { useRef, useEffect, useState } from "react";

interface JsonModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  onClose: () => void;
  title?: string;
  triggerElement?: HTMLElement | null;
}

export const JsonModal: React.FC<JsonModalProps> = ({
  data,
  title,
  triggerElement,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!data || !triggerElement || !modalRef.current) return;

    // 브라우저가 레이아웃을 완료한 후 실행
    requestAnimationFrame(() => {
      if (!modalRef.current) return;

      const rect = triggerElement.getBoundingClientRect();
      const modalRect = modalRef.current.getBoundingClientRect();

      let top = rect.bottom + window.scrollY + 8;
      let left = rect.left + window.scrollX;

      if (left + modalRect.width > window.innerWidth) {
        left = rect.right + window.scrollX - modalRect.width;
      }

      if (top + modalRect.height > window.innerHeight + window.scrollY) {
        top = rect.top + window.scrollY - modalRect.height - 8;
      }

      setPosition({ top, left });
    });
  }, [triggerElement]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        ref={modalRef}
        className={`absolute p-6 rounded-lg max-w-2xl max-h-[80vh] overflow-auto bg-indigo-500 shadow-xl pointer-events-auto ${
          position ? "slide-in-fwd-center" : "opacity-0"
        }`}
        style={position ? { top: `${position.top}px`, left: `${position.left}px` } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <pre className="text-sm p-4 bg-indigo-800 rounded overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};