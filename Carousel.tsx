import React, { useRef } from 'react';

interface CarouselProps {
    children: React.ReactNode;
}

const Carousel: React.FC<CarouselProps> = ({ children }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (scrollOffset: number) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft += scrollOffset;
        }
    };

    const ChevronLeft = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
    );
    const ChevronRight = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    );

    return (
        <div className="relative carousel-container">
            <button
                onClick={() => scroll(-300)}
                className="carousel-button absolute top-1/2 left-0 -translate-y-1/2 z-10 p-2 bg-white/70 dark:bg-gray-800/70 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                aria-label="Previous"
            >
                <ChevronLeft />
            </button>
            <div
                ref={scrollContainerRef}
                className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide"
            >
                {children}
            </div>
            <button
                onClick={() => scroll(300)}
                className="carousel-button absolute top-1/2 right-0 -translate-y-1/2 z-10 p-2 bg-white/70 dark:bg-gray-800/70 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                aria-label="Next"
            >
                <ChevronRight />
            </button>
        </div>
    );
};

export default Carousel;