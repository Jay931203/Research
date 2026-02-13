'use client';

import { memo, useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from 'reactflow';
import type { RelationshipEdgeData } from '@/types';
import { RELATIONSHIP_STYLES } from '@/lib/visualization/graphUtils';

function CustomEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}: EdgeProps<RelationshipEdgeData>) {
  const [hovered, setHovered] = useState(false);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  if (!data) return null;

  const relStyle = RELATIONSHIP_STYLES[data.relationship_type];

  return (
    <>
      {/* Improve pointer hit-area for easier hover */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />

      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          opacity: hovered ? 1 : 0.7,
          transition: 'opacity 0.2s',
        }}
        markerEnd={markerEnd}
      />

      {data.show_label !== false && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan pointer-events-auto"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div
              className={`
                px-2 py-0.5 rounded text-[10px] font-semibold
                border shadow-sm transition-all duration-200
                ${hovered ? 'scale-110 shadow-md' : ''}
              `}
              style={{
                color: relStyle.color,
                borderColor: relStyle.color,
                backgroundColor: 'white',
              }}
            >
              {relStyle.label}
            </div>

            {hovered && data.description && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50
                  bg-gray-900 text-white text-[10px] px-3 py-2 rounded-lg shadow-xl
                  max-w-[200px] whitespace-normal leading-relaxed"
              >
                <div className="font-semibold mb-0.5" style={{ color: relStyle.color }}>
                  {relStyle.label} (강도: {data.strength}/10)
                </div>
                {data.description}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(CustomEdgeComponent);
