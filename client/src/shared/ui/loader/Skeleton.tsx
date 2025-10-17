interface SkeletonProps {
    className?: string;
}

export const Skeleton = ({className}: SkeletonProps) => (
    <div className={`animate-pulse bg-white/10 rounded ${className ?? ""}`}/>
);
