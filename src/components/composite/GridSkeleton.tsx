export const GridSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card rounded-xl p-6 h-64 flex flex-col gap-4 animate-pulse">
          <div className="flex justify-between items-start">
            <div className="h-6 bg-border/50 rounded-md w-1/2"></div>
            <div className="h-6 bg-border/50 rounded-full w-16"></div>
          </div>
          <div className="h-4 bg-border/50 rounded-md w-1/3"></div>
          <div className="mt-auto space-y-3">
            <div className="h-2 bg-border/50 rounded-full w-full"></div>
            <div className="flex justify-between">
              <div className="h-4 bg-border/50 rounded-md w-1/4"></div>
              <div className="h-4 bg-border/50 rounded-md w-1/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
