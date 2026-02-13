export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-2">
          <div className="h-5 w-12 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonText({ width = 'w-full' }: { width?: string }) {
  return (
    <div className={`animate-pulse ${width} h-3.5 rounded bg-gray-200 dark:bg-gray-700`} />
  );
}

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 ${className}`} />
  );
}
