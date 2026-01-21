import './LoadingSkeleton.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

export function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius = '0.25rem',
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius,
      }}
    />
  );
}

export function SkeletonRow() {
  return (
    <div className="skeleton-row">
      <Skeleton width={24} height={24} borderRadius="50%" />
      <Skeleton width="60%" height={16} />
      <Skeleton width={16} height={16} />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card__header">
        <Skeleton width="40%" height={20} />
        <Skeleton width="20%" height={16} />
      </div>
      <div className="skeleton-card__body">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    </div>
  );
}

interface LoadingSkeletonProps {
  rows?: number;
  type?: 'row' | 'card';
}

export function LoadingSkeleton({ rows = 5, type = 'row' }: LoadingSkeletonProps) {
  if (type === 'card') {
    return (
      <div className="loading-skeleton">
        <SkeletonCard />
        <div className="loading-skeleton__rows">
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="loading-skeleton">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}
