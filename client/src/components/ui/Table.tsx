'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Skeleton from './Skeleton';
import styles from './Table.module.css';

interface TableColumn<T> {
  key: string;
  label: string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface TableProps<T extends Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data found',
  className,
}: TableProps<T>) {
  const renderCell = (item: T, column: TableColumn<T>, index: number): React.ReactNode => {
    if (column.render) return column.render(item, index);
    return String(item[column.key] ?? '');
  };

  return (
    <div className={cn(styles.wrapper, className)}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={styles.th}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {isLoading
            ? Array.from({ length: 5 }).map((_, rowIdx) => (
                <tr key={rowIdx}>
                  {columns.map((col) => (
                    <td key={col.key} className={styles.td}>
                      <Skeleton variant="text" width="80%" />
                    </td>
                  ))}
                </tr>
              ))
            : data.length === 0
              ? (
                <tr>
                  <td colSpan={columns.length} className={styles.empty}>
                    {emptyMessage}
                  </td>
                </tr>
              )
              : data.map((item, rowIdx) => (
                  <tr key={rowIdx} className={styles.tr}>
                    {columns.map((col) => (
                      <td key={col.key} className={styles.td}>
                        {renderCell(item, col, rowIdx)}
                      </td>
                    ))}
                  </tr>
                ))}
        </tbody>
      </table>
    </div>
  );
}
