"use client";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rect" | "circle";
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({
  className = "",
  variant = "rect",
  width,
  height,
}: SkeletonProps) {
  const base = "animate-pulse bg-[rgba(255,255,255,0.06)] rounded-xl";

  const styles: Record<string, string> = {
    text: "h-4 w-full rounded",
    rect: `h-20 w-full ${base}`,
    circle: "h-10 w-10 rounded-full",
  };

  return (
    <div
      className={`${base} ${styles[variant]} ${className}`}
      style={{ width, height }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="w-20" />
        <Skeleton variant="circle" className="w-8 h-8" />
      </div>
      <Skeleton variant="text" className="w-32 h-6" />
      <div className="flex items-center gap-2 pt-3 border-t border-[rgba(255,255,255,0.06)]">
        <Skeleton variant="text" className="w-12" />
        <Skeleton variant="text" className="w-24" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] space-y-4">
      <Skeleton variant="text" className="w-24 h-5" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton variant="text" className="flex-1" />
            <Skeleton variant="text" className="w-20" />
            <Skeleton variant="text" className="w-16" />
            <Skeleton variant="text" className="w-20" />
            <Skeleton variant="text" className="w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
