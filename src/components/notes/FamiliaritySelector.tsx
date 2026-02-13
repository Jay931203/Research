'use client';

import type { FamiliarityLevel } from '@/types';
import {
  FAMILIARITY_COLORS,
  FAMILIARITY_LABELS,
} from '@/lib/visualization/graphUtils';

interface FamiliaritySelectorProps {
  value: FamiliarityLevel;
  onChange: (level: FamiliarityLevel) => void;
  disabled?: boolean;
}

const LEVELS: FamiliarityLevel[] = [
  'not_started',
  'difficult',
  'moderate',
  'familiar',
  'expert',
];

export default function FamiliaritySelector({
  value,
  onChange,
  disabled = false,
}: FamiliaritySelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {LEVELS.map((level) => {
        const isSelected = value === level;
        const color = FAMILIARITY_COLORS[level];
        const label = FAMILIARITY_LABELS[level];

        return (
          <button
            key={level}
            onClick={() => !disabled && onChange(level)}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
            }`}
            style={
              isSelected
                ? { backgroundColor: color, color: '#fff', borderColor: color }
                : { borderColor: color + '60', color }
            }
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            {label}
          </button>
        );
      })}
    </div>
  );
}
