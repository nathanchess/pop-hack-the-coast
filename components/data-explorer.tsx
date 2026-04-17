'use client';

import { useState, useMemo, useEffect } from 'react';
import Papa from 'papaparse';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';

// Dataset definitions
const datasets = [
  {
    id: 'sales',
    name: 'Sales Transaction History',
    file: '/data/POP_SalesTransactionHistory.csv',
    description: '3 years of sales data with customer and product details',
  },
  {
    id: 'inventory',
    name: 'Inventory Snapshot',
    file: '/data/POP_InventorySnapshot.csv',
    description: 'Current inventory levels across all warehouses',
  },
  {
    id: 'po-history',
    name: 'Purchase Order History',
    file: '/data/POP_PurchaseOrderHistory.csv',
    description: 'Historical purchase orders and receipts',
  },
  {
    id: 'item-spec',
    name: 'Item Spec Master',
    file: '/data/POP_ItemSpecMaster.csv',
    description: 'SKU specifications including lead times and MOQ',
  },
  {
    id: 'chargebacks',
    name: 'Chargebacks & Deductions',
    file: '/data/POP_ChargeBack_Deductions_Penalties_Freight.csv',
    description: 'Promotional and penalty data',
  },
  {
    id: 'imports',
    name: 'Import Shipment Status',
    file: '/data/POP_ImportShipmentStatus.csv',
    description: 'In-transit international shipments',
  },
  {
    id: 'transfers',
    name: 'Internal Transfer History',
    file: '/data/POP_InternalTransferHistory.csv',
    description: 'Warehouse-to-warehouse transfers',
  },
  {
    id: 'assembly',
    name: 'Assembly Orders',
    file: '/data/POP_AssemblyOrders.csv',
    description: 'Bill of materials for assembled SKUs',
  },
  {
    id: 'dictionary',
    name: 'Data Dictionary',
    file: '/data/POP_DataDictionary.csv',
    description: 'Field definitions and metadata',
  },
];

export default function DataExplorer() {
  const [selectedDataset, setSelectedDataset] = useState(datasets[0]);
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<ColumnDef<any>[]>([]);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [tableKey, setTableKey] = useState(0);

  // Load CSV data
  useEffect(() => {
    setLoading(true);
    setSorting([]);
    setGlobalFilter('');
    setTableKey(prev => prev + 1);
    
    Papa.parse<Record<string, any>>(selectedDataset.file, {
      download: true,
      header: true,
      complete: (results) => {
        const csvData = results.data.filter((row) => {
          return Object.values(row).some((val) => val !== '');
        });
        
        setData(csvData);

        // Create columns from CSV headers
        if (csvData.length > 0 && csvData[0]) {
          const headers = Object.keys(csvData[0]);
          const cols: ColumnDef<any>[] = headers.map((header) => ({
            id: `${selectedDataset.id}-${header}`,
            accessorKey: header,
            header: header,
            cell: (info) => {
              const value = info.getValue();
              return (
                <div className="truncate max-w-xs" title={String(value)}>
                  {String(value)}
                </div>
              );
            },
          }));
          setColumns(cols);
        }
        
        setLoading(false);
      },
      error: (error) => {
        console.error('Error loading CSV:', error);
        setLoading(false);
      },
    });
  }, [selectedDataset]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  });

  return (
    <div className="p-8 space-y-6 animate-fade-up">
      {/* Header */}
      <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Data Explorer</h1>
        <p className="text-neutral-600">Browse and analyze all data sources</p>
      </div>

      {/* Dataset Selector */}
      <div className="glass-panel rounded-2xl p-6 space-y-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Select Dataset</h2>
          <div className="text-sm text-neutral-600">
            {data.length.toLocaleString()} rows • {columns.length} columns
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {datasets.map((dataset, idx) => (
            <button
              key={dataset.id}
              onClick={() => setSelectedDataset(dataset)}
              style={{ animationDelay: `${300 + idx * 50}ms` }}
              className={`
                glass-button p-4 rounded-xl text-left transition-all duration-300 animate-fade-up
                focus:outline-none focus:ring-2 focus:ring-pop-primary/30
                active:scale-95
                ${
                  selectedDataset.id === dataset.id
                    ? 'glass-button-active ring-2 ring-pop-primary/30'
                    : 'hover:glass-button-hover'
                }
              `}
            >
              <div className="font-medium text-sm text-neutral-900 mb-1">
                {dataset.name}
              </div>
              <div className="text-xs text-neutral-600 line-clamp-2">
                {dataset.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Controls */}
      <div className="glass-panel rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search across all columns..."
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-pop-primary/30 focus:border-pop-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <span>Page Size:</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="px-3 py-2 rounded-lg border border-neutral-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-pop-primary/30 transition-all"
            >
              {[25, 50, 100, 250].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-12 flex items-center justify-center animate-fade-up">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-pop-primary/20 border-t-pop-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading data...</p>
          </div>
        </div>
      ) : (
        <div key={tableKey} className="glass-panel rounded-2xl overflow-hidden animate-fade-up">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-neutral-200/50">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider bg-neutral-50/50 backdrop-blur-sm"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={`flex items-center gap-2 ${
                              header.column.getCanSort()
                                ? 'cursor-pointer select-none hover:text-neutral-900'
                                : ''
                            }`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getIsSorted() && (
                              <span className="text-pop-primary">
                                {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="animate-fade-up" style={{ animationDelay: '100ms' }}>
                {table.getRowModel().rows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`
                      border-b border-neutral-200/30 hover:bg-neutral-50/50 transition-colors
                      ${idx % 2 === 0 ? 'bg-white/20' : 'bg-white/40'}
                    `}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 text-sm text-neutral-700"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-neutral-200/50 bg-neutral-50/30 backdrop-blur-sm animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-600">
                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}{' '}
                of {table.getFilteredRowModel().rows.length} results
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="glass-button-small px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pop-primary/30 active:scale-95 transition-transform"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="glass-button-small px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pop-primary/30 active:scale-95 transition-transform"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="px-4 py-2 text-sm text-neutral-700">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </div>

                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="glass-button-small px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pop-primary/30 active:scale-95 transition-transform"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="glass-button-small px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pop-primary/30 active:scale-95 transition-transform"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
