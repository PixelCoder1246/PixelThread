'use client';

import styles from './Pagination.module.css';

const s = styles as Record<string, string>;

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(currentPage, totalPages, maxVisiblePages);

  return (
    <nav
      className={[s.pagination, className].filter(Boolean).join(' ')}
      aria-label="Pagination"
    >
      {showFirstLast && (
        <button
          type="button"
          className={[
            s['pagination-item'],
            s['pagination-previous'],
            currentPage === 1 ? s.disabled : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="First page"
        >
          ««
        </button>
      )}

      {showPrevNext && (
        <button
          type="button"
          className={[
            s['pagination-item'],
            s['pagination-previous'],
            currentPage === 1 ? s.disabled : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          « <span>Previous</span>
        </button>
      )}

      {pages.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className={s['pagination-ellipsis']}
              aria-hidden="true"
            >
              ...
            </span>
          );
        }

        return (
          <button
            key={page}
            type="button"
            className={[
              s['pagination-item'],
              page === currentPage ? s.active : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      {showPrevNext && (
        <button
          type="button"
          className={[
            s['pagination-item'],
            s['pagination-next'],
            currentPage === totalPages ? s.disabled : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <span>Next</span> »
        </button>
      )}

      {showFirstLast && (
        <button
          type="button"
          className={[
            s['pagination-item'],
            s['pagination-next'],
            currentPage === totalPages ? s.disabled : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
        >
          »»
        </button>
      )}
    </nav>
  );
}

function getVisiblePages(
  currentPage: number,
  totalPages: number,
  maxVisible: number
): (number | 'ellipsis')[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(2, currentPage - half);
  const end = Math.min(totalPages - 1, start + maxVisible - 3);

  if (end - start + 1 < maxVisible - 2) {
    start = Math.max(2, end - maxVisible + 3);
  }

  const pages: (number | 'ellipsis')[] = [1];

  if (start > 2) pages.push('ellipsis');

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages - 1) pages.push('ellipsis');

  pages.push(totalPages);

  return pages;
}
