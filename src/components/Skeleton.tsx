export function EventCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="h-48 skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 rounded-lg skeleton" />
        <div className="h-4 w-full rounded-lg skeleton" />
        <div className="h-4 w-2/3 rounded-lg skeleton" />
        <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="h-4 w-20 rounded-lg skeleton" />
          <div className="h-4 w-24 rounded-lg skeleton" />
        </div>
      </div>
    </div>
  );
}

export function EventGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-6 space-y-3">
      <div className="h-5 w-1/2 rounded-lg skeleton" />
      <div className="h-4 w-full rounded-lg skeleton" />
      <div className="h-4 w-3/4 rounded-lg skeleton" />
    </div>
  );
}
