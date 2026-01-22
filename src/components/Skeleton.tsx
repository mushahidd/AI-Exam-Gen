import React from 'react';

// Shimmer animation skeleton component
export const Skeleton = ({ className = '' }: { className?: string }) => (
    <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded ${className}`} 
         style={{ animation: 'shimmer 1.5s infinite' }} />
);

// Card skeleton for classes/exams
export const CardSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 animate-fadeIn">
        <div className="flex justify-between items-start mb-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="flex gap-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
        </div>
        <Skeleton className="h-6 w-24 mb-3" />
        <Skeleton className="h-5 w-16 rounded-full mb-3" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4" />
    </div>
);

// Grid of card skeletons
export const CardGridSkeleton = ({ count = 6 }: { count?: number }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} />
        ))}
    </div>
);

// Button skeleton for horizontal scroll area
export const ButtonSkeleton = () => (
    <Skeleton className="h-11 w-32 rounded-full flex-shrink-0" />
);

// Page loading overlay with spinner
export const PageLoader = () => (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-gray-500 font-medium">Loading...</p>
        </div>
    </div>
);

// List skeleton for subjects/sessions
export const ListSkeleton = ({ count = 4 }: { count?: number }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="w-8 h-8 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

export default Skeleton;
