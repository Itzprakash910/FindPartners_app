
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const baseButtonClasses = "px-4 py-2 mx-1 rounded-lg transition-colors duration-200";
  const pageButtonClasses = `${baseButtonClasses} text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-300 hover:bg-rose-100 dark:hover:bg-rose-900/50`;
  const activeButtonClasses = `${baseButtonClasses} bg-rose-800 text-white font-bold cursor-default`;
  const arrowButtonClasses = `${baseButtonClasses} text-gray-600 bg-white dark:bg-gray-800 dark:text-gray-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 disabled:opacity-50 disabled:cursor-not-allowed`;

  const ChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
  const ChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;

  return (
    <nav className="mt-12 flex justify-center items-center" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={arrowButtonClasses}
        aria-label="Go to previous page"
      >
          <ChevronLeft />
      </button>

      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={currentPage === number ? activeButtonClasses : pageButtonClasses}
          aria-current={currentPage === number ? 'page' : undefined}
        >
          {number}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={arrowButtonClasses}
        aria-label="Go to next page"
      >
        <ChevronRight />
      </button>
    </nav>
  );
};

export default Pagination;
