/**
 * RESPONSIVE TABLE COMPONENT
 * 
 * Purpose:
 * Mobile-optimized table that transforms to cards on small screens
 * Follows theming guidelines with brand colors
 * 
 * Usage:
 * <ResponsiveTable
 *   headers={['Name', 'Email', 'Status']}
 *   rows={data}
 *   renderRow={(item) => (
 *     <>
 *       <ResponsiveTableCell label="Name">{item.name}</ResponsiveTableCell>
 *       <ResponsiveTableCell label="Email">{item.email}</ResponsiveTableCell>
 *       <ResponsiveTableCell label="Status">
 *         <StatusBadge status={item.status} />
 *       </ResponsiveTableCell>
 *     </>
 *   )}
 *   onRowClick={(item) => router.push(`/items/${item.id}`)}
 * />
 */

'use client';

import { ReactNode } from 'react';

interface ResponsiveTableProps<T> {
  headers: string[];
  rows: T[];
  renderRow: (item: T, index: number) => ReactNode;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function ResponsiveTable<T>({
  headers,
  rows,
  renderRow,
  onRowClick,
  emptyMessage = 'No items found',
  className = '',
}: ResponsiveTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-brand-text-tertiary">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto bg-brand-bg rounded-xl shadow-sm">
        <table className={`w-full ${className}`}>
          <thead className="bg-brand-bg-secondary border-b border-brand-border">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-brand-text-tertiary uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {rows.map((row, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'cursor-pointer hover:bg-brand-bg-tertiary transition-colors' : ''}
              >
                {renderRow(row, index)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {rows.map((row, index) => (
          <div
            key={index}
            onClick={() => onRowClick?.(row)}
            className={`bg-brand-bg rounded-xl shadow-sm p-4 space-y-3 ${
              onRowClick ? 'cursor-pointer active:bg-brand-bg-tertiary transition-colors' : ''
            }`}
          >
            {renderRow(row, index)}
          </div>
        ))}
      </div>
    </>
  );
}

interface ResponsiveTableCellProps {
  children: ReactNode;
  label?: string;
  className?: string;
}

export function ResponsiveTableCell({ children, label, className = '' }: ResponsiveTableCellProps) {
  return (
    <>
      {/* Desktop: Regular table cell */}
      <td className={`hidden md:table-cell px-6 py-4 whitespace-nowrap ${className}`}>
        {children}
      </td>

      {/* Mobile: Label + Value pair */}
      {label && (
        <div className="md:hidden flex justify-between items-center">
          <span className="text-sm font-medium text-brand-text-tertiary">{label}:</span>
          <span className={`text-sm text-brand-text ${className}`}>{children}</span>
        </div>
      )}
    </>
  );
}

