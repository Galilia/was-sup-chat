import {Skeleton} from "./Skeleton";

export const SidebarSkeleton = () => (
    <div className="p-5 space-y-3">
        {Array.from({length: 8}).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full"/>
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-1/2"/>
                    <Skeleton className="h-3 w-1/3"/>
                </div>
            </div>
        ))}
    </div>
);
