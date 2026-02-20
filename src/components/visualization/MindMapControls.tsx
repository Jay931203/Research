'use client';

import { useReactFlow } from 'reactflow';
import { LayoutGrid, Maximize, ZoomIn, ZoomOut } from 'lucide-react';

interface MindMapControlsProps {
  direction: 'TB' | 'LR';
  onDirectionChange: (direction: 'TB' | 'LR') => void;
}

export default function MindMapControls({
  direction,
  onDirectionChange,
}: MindMapControlsProps) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const buttonClass =
    'rounded-lg border border-gray-200 bg-white p-2 text-gray-600 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700';

  return (
    <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
      <button
        onClick={() => zoomIn({ duration: 200 })}
        className={buttonClass}
        title="확대"
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      <button
        onClick={() => zoomOut({ duration: 200 })}
        className={buttonClass}
        title="축소"
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <button
        onClick={() => fitView({ padding: 0.2, duration: 300 })}
        className={buttonClass}
        title="전체 보기"
      >
        <Maximize className="h-4 w-4" />
      </button>

      <div className="my-1 border-t border-gray-200 dark:border-gray-700" />

      <button
        onClick={() => onDirectionChange(direction === 'TB' ? 'LR' : 'TB')}
        className={buttonClass}
        title={direction === 'TB' ? '가로 레이아웃으로 전환' : '세로 레이아웃으로 전환'}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
    </div>
  );
}
