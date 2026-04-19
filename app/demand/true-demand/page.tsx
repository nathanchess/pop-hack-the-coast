'use client';

import { useState, useRef, useEffect } from 'react';
import PageHeader from "@/components/page-header";
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

const POINT_SIZE = 12;
const HOVER_SCALE = 1.5;

interface POData {
  poNumber: string;
  quantity: number;
  leadTime: number;
  supplier: string;
  estimatedCost: number;
}

interface DataPoint {
  id: string;
  sku: string;
  productName: string;
  importance: number;
  urgency: number;
  category: string;
  lastOrderDate: string;
  poData: POData;
}

const sampleData: DataPoint[] = [
  { id: '1', sku: 'SKU-1001', productName: 'Ginger Honey Crystals', importance: 8.5, urgency: 9.2, category: 'Tea', lastOrderDate: '2026-03-15', poData: { poNumber: 'PO-2026-001', quantity: 5000, leadTime: 45, supplier: 'Asian Imports Ltd', estimatedCost: 12500 } },
  { id: '2', sku: 'SKU-1002', productName: 'Oolong Tea Premium', importance: 7.8, urgency: 6.5, category: 'Tea', lastOrderDate: '2026-04-01', poData: { poNumber: 'PO-2026-002', quantity: 3000, leadTime: 30, supplier: 'Tea World Inc', estimatedCost: 9800 } },
  { id: '3', sku: 'SKU-1003', productName: 'Jasmine Green Tea', importance: 9.1, urgency: 8.7, category: 'Tea', lastOrderDate: '2026-03-28', poData: { poNumber: 'PO-2026-003', quantity: 4500, leadTime: 35, supplier: 'Green Valley', estimatedCost: 11200 } },
  { id: '4', sku: 'SKU-1004', productName: 'Herbal Detox Blend', importance: 6.2, urgency: 4.3, category: 'Herbal', lastOrderDate: '2026-02-20', poData: { poNumber: 'PO-2026-004', quantity: 2000, leadTime: 25, supplier: 'Herbal Solutions', estimatedCost: 5600 } },
  { id: '5', sku: 'SKU-1005', productName: 'Ginseng Extract', importance: 9.5, urgency: 9.8, category: 'Supplement', lastOrderDate: '2026-04-10', poData: { poNumber: 'PO-2026-005', quantity: 1500, leadTime: 60, supplier: 'Asian Imports Ltd', estimatedCost: 18900 } },
  { id: '6', sku: 'SKU-1006', productName: 'White Tea Organic', importance: 5.8, urgency: 3.2, category: 'Tea', lastOrderDate: '2026-01-15', poData: { poNumber: 'PO-2026-006', quantity: 1800, leadTime: 40, supplier: 'Organic Tea Co', estimatedCost: 7200 } },
  { id: '7', sku: 'SKU-1007', productName: 'Chamomile Flowers', importance: 4.5, urgency: 2.8, category: 'Herbal', lastOrderDate: '2026-03-05', poData: { poNumber: 'PO-2026-007', quantity: 2500, leadTime: 20, supplier: 'Herbal Solutions', estimatedCost: 4800 } },
  { id: '8', sku: 'SKU-1008', productName: 'Black Tea Classic', importance: 8.9, urgency: 7.6, category: 'Tea', lastOrderDate: '2026-04-12', poData: { poNumber: 'PO-2026-008', quantity: 6000, leadTime: 28, supplier: 'Tea World Inc', estimatedCost: 14400 } },
  { id: '9', sku: 'SKU-1009', productName: 'Peppermint Leaves', importance: 3.2, urgency: 2.1, category: 'Herbal', lastOrderDate: '2025-12-18', poData: { poNumber: 'PO-2026-009', quantity: 1200, leadTime: 15, supplier: 'Fresh Herbs LLC', estimatedCost: 2400 } },
  { id: '10', sku: 'SKU-1010', productName: 'Earl Grey Supreme', importance: 7.6, urgency: 8.9, category: 'Tea', lastOrderDate: '2026-04-08', poData: { poNumber: 'PO-2026-010', quantity: 3500, leadTime: 32, supplier: 'Tea World Inc', estimatedCost: 10500 } },
  { id: '11', sku: 'SKU-1011', productName: 'Matcha Powder', importance: 9.8, urgency: 6.4, category: 'Tea', lastOrderDate: '2026-03-22', poData: { poNumber: 'PO-2026-011', quantity: 800, leadTime: 50, supplier: 'Japanese Imports', estimatedCost: 16800 } },
  { id: '12', sku: 'SKU-1012', productName: 'Turmeric Blend', importance: 6.7, urgency: 5.5, category: 'Herbal', lastOrderDate: '2026-02-28', poData: { poNumber: 'PO-2026-012', quantity: 2200, leadTime: 30, supplier: 'Spice Route Co', estimatedCost: 6600 } },
  { id: '13', sku: 'SKU-1013', productName: 'Rooibos Red Tea', importance: 4.8, urgency: 6.2, category: 'Tea', lastOrderDate: '2026-03-18', poData: { poNumber: 'PO-2026-013', quantity: 1600, leadTime: 45, supplier: 'African Tea Ltd', estimatedCost: 4800 } },
  { id: '14', sku: 'SKU-1014', productName: 'Lavender Relaxation', importance: 5.5, urgency: 7.8, category: 'Herbal', lastOrderDate: '2026-04-05', poData: { poNumber: 'PO-2026-014', quantity: 1900, leadTime: 22, supplier: 'Herbal Solutions', estimatedCost: 5200 } },
  { id: '15', sku: 'SKU-1015', productName: 'Dragon Well Tea', importance: 8.2, urgency: 4.6, category: 'Tea', lastOrderDate: '2026-02-10', poData: { poNumber: 'PO-2026-015', quantity: 1100, leadTime: 55, supplier: 'Green Valley', estimatedCost: 8800 } },
];

export default function TrueDemandPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [highlightedRow, setHighlightedRow] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const columns: ColumnDef<DataPoint>[] = [
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: (info) => <span className="font-medium">{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'productName',
      header: 'Product Name',
    },
    {
      accessorKey: 'importance',
      header: 'Importance',
      cell: (info) => (
        <span className="font-semibold text-pop-primary">
          {(info.getValue() as number).toFixed(1)}
        </span>
      ),
    },
    {
      accessorKey: 'urgency',
      header: 'Urgency',
      cell: (info) => (
        <span className="font-semibold text-warning">
          {(info.getValue() as number).toFixed(1)}
        </span>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
    },
    {
      accessorKey: 'lastOrderDate',
      header: 'Last Order',
    },
  ];

  const table = useReactTable({
    data: sampleData,
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
        pageSize: 25,
      },
    },
  });

  // Zoom with mouse wheel
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setTransform(p => ({
        ...p,
        k: Math.min(Math.max(0.5, p.k + e.deltaY * -0.001), 3)
      }));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.data-point')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform(p => ({
      ...p,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoomIn = () => setTransform(p => ({ ...p, k: Math.min(p.k + 0.3, 3) }));
  const handleZoomOut = () => setTransform(p => ({ ...p, k: Math.max(p.k - 0.3, 0.5) }));
  const handleReset = () => setTransform({ x: 0, y: 0, k: 1 });

  // Calculate dynamic ranges
  const importanceValues = sampleData.map(d => d.importance);
  const urgencyValues = sampleData.map(d => d.urgency);
  
  const minImportance = 0;
  const maxImportance = Math.ceil(Math.max(...importanceValues));
  const minUrgency = 0;
  const maxUrgency = Math.ceil(Math.max(...urgencyValues));
  
  const importanceRange = maxImportance - minImportance;
  const urgencyRange = maxUrgency - minUrgency;
  
  // Generate tick marks (aim for ~5-7 ticks)
  const getTickValues = (min: number, max: number) => {
    const range = max - min;
    const roughStep = range / 6;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const step = Math.ceil(roughStep / magnitude) * magnitude;
    
    const ticks = [];
    for (let i = min; i <= max; i += step) {
      ticks.push(i);
    }
    if (ticks[ticks.length - 1] < max) {
      ticks.push(max);
    }
    return ticks;
  };
  
  const importanceTicks = getTickValues(minImportance, maxImportance);
  const urgencyTicks = getTickValues(minUrgency, maxUrgency);

  return (
    <div className="p-8 space-y-6 animate-fade-up">
      <PageHeader
        title="True Demand Analysis"
        description="Separate promotional sales from organic demand to reveal true demand signals"
      />

      {/* Canvas Section */}
      <div className="glass-panel rounded-2xl p-6 relative animate-fade-up" style={{ animationDelay: '100ms' }}>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Urgency vs Importance Matrix</h2>
          <p className="text-sm text-neutral-600">Click and drag to pan • Scroll to zoom • Click points to view details</p>
        </div>
        
        {/* Controls */}
        <div className="absolute top-6 right-6 z-20 flex flex-col gap-2 glass-panel p-2 rounded-xl shadow-lg">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Zoom In"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          <div className="h-px bg-neutral-200 mx-1" />
          <button
            onClick={handleReset}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Reset View"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
        
        <div
          ref={containerRef}
          className="relative w-full h-[600px] rounded-xl border border-neutral-200/50 overflow-hidden select-none cursor-move bg-white"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.15) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            paddingBottom: '40px',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Transformed Content */}
          <div
            className="w-full h-full origin-center transition-transform duration-75 ease-out"
            style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})` }}
          >
            {/* Grid and Axes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E8E8E8" strokeWidth="0.5"/>
                </pattern>
              </defs>
              
              {(() => {
                const w = containerRef.current?.clientWidth || 1200;
                const h = containerRef.current?.clientHeight || 600;
                const leftPadding = 60;
                const bottomPadding = 100;
                const plotWidth = w - leftPadding - 20;
                const plotHeight = h - bottomPadding - 20;
                
                return (
                  <>
                    {/* Grid Background */}
                    <rect x={leftPadding} y="20" width={plotWidth} height={plotHeight} fill="url(#grid)" />
                    
                    {/* Axes */}
                    <line x1={leftPadding} y1="20" x2={leftPadding} y2={h - bottomPadding} stroke="#1A1A1A" strokeWidth="2" />
                    <line x1={leftPadding} y1={h - bottomPadding} x2={w - 20} y2={h - bottomPadding} stroke="#1A1A1A" strokeWidth="2" />
                    
                    {/* Axis Labels */}
                    <text x={leftPadding + plotWidth / 2} y={h - 20} textAnchor="middle" className="text-sm fill-neutral-900 font-medium">
                      Importance →
                    </text>
                    <text 
                      x={20} 
                      y={20 + plotHeight / 2} 
                      textAnchor="middle" 
                      transform={`rotate(-90, 20, ${20 + plotHeight / 2})`} 
                      className="text-sm fill-neutral-900 font-medium"
                    >
                      Urgency →
                    </text>
                    
                    {/* X-axis Tick Labels (Importance) */}
                    {importanceTicks.map(tick => {
                      const x = leftPadding + ((tick - minImportance) / importanceRange) * plotWidth;
                      return (
                        <g key={`x-${tick}`}>
                          <line 
                            x1={x} 
                            y1={h - bottomPadding} 
                            x2={x} 
                            y2={h - bottomPadding + 5} 
                            stroke="#1A1A1A" 
                            strokeWidth="1" 
                          />
                          <text 
                            x={x} 
                            y={h - bottomPadding + 20} 
                            textAnchor="middle" 
                            className="text-xs fill-neutral-600"
                          >
                            {tick.toFixed(1)}
                          </text>
                        </g>
                      );
                    })}
                    
                    {/* Y-axis Tick Labels (Urgency) */}
                    {urgencyTicks.map(tick => {
                      const y = (h - bottomPadding) - ((tick - minUrgency) / urgencyRange) * plotHeight;
                      return (
                        <g key={`y-${tick}`}>
                          <line 
                            x1={leftPadding - 5} 
                            y1={y} 
                            x2={leftPadding} 
                            y2={y} 
                            stroke="#1A1A1A" 
                            strokeWidth="1" 
                          />
                          <text 
                            x={leftPadding - 10} 
                            y={y + 4} 
                            textAnchor="end" 
                            className="text-xs fill-neutral-600"
                          >
                            {tick.toFixed(1)}
                          </text>
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>

            {/* Data Points */}
            {sampleData.map(point => {
              const leftPadding = 60;
              const bottomPadding = 100;
              const w = containerRef.current?.clientWidth || 1200;
              const h = containerRef.current?.clientHeight || 600;
              const plotWidth = w - leftPadding - 20;
              const plotHeight = h - bottomPadding - 20;
              
              // Normalize to 0-based range
              const normalizedImportance = (point.importance - minImportance) / importanceRange;
              const normalizedUrgency = (point.urgency - minUrgency) / urgencyRange;
              
              const px = leftPadding + normalizedImportance * plotWidth;
              const py = (h - bottomPadding) - normalizedUrgency * plotHeight;

              const isSelected = selectedPoint?.id === point.id;
              const isHovered = hoveredPoint?.id === point.id;
              const isHighlighted = highlightedRow === point.id;

              return (
                <div
                  key={point.id}
                  className="data-point absolute flex items-center justify-center transition-all duration-200 cursor-pointer"
                  style={{
                    left: px,
                    top: py,
                    width: POINT_SIZE,
                    height: POINT_SIZE,
                    transform: `translate(-50%, -50%) scale(${isSelected || isHovered || isHighlighted ? HOVER_SCALE : 1})`,
                    zIndex: isSelected || isHovered || isHighlighted ? 50 : 10
                  }}
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPoint(point);
                    setHighlightedRow(point.id);
                  }}
                >
                  <div
                    className={`w-full h-full rounded-full shadow-lg transition-all ${
                      isSelected || isHighlighted
                        ? 'bg-pop-primary ring-2 ring-pop-primary ring-offset-2'
                        : isHovered
                        ? 'bg-pop-primary-light'
                        : 'bg-success'
                    }`}
                  />

                  {/* Hover Tooltip */}
                  {isHovered && !selectedPoint && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none animate-fade-up">
                      <div className="glass-panel px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                        <p className="text-xs font-semibold text-neutral-900">{point.sku}</p>
                        <p className="text-xs text-neutral-600">{point.productName}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* PO Preview Modal */}
          {selectedPoint && (
            <div className="absolute top-4 right-4 glass-panel p-6 rounded-xl shadow-xl w-80 z-50 animate-fade-up">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">{selectedPoint.sku}</h3>
                  <p className="text-sm text-neutral-600">{selectedPoint.productName}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPoint(null);
                    setHighlightedRow(null);
                  }}
                  className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">PO Number:</span>
                  <span className="text-sm font-semibold text-neutral-900">{selectedPoint.poData.poNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Quantity:</span>
                  <span className="text-sm font-semibold text-neutral-900">{selectedPoint.poData.quantity.toLocaleString()} units</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Lead Time:</span>
                  <span className="text-sm font-semibold text-neutral-900">{selectedPoint.poData.leadTime} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Supplier:</span>
                  <span className="text-sm font-semibold text-neutral-900">{selectedPoint.poData.supplier}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Estimated Cost:</span>
                  <span className="text-sm font-semibold text-pop-primary">${selectedPoint.poData.estimatedCost.toLocaleString()}</span>
                </div>
              </div>

              <a
                href="/reorder"
                className="block w-full px-4 py-2.5 bg-pop-primary text-white text-center font-medium rounded-xl hover:bg-pop-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-pop-primary/30"
              >
                Navigate to Reorder Center
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-panel rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">AI Metadata Table</h2>
          
          <div className="flex items-center gap-4 mb-4">
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
              <span>Rows:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="px-3 py-2 rounded-lg border border-neutral-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-pop-primary/30 transition-all"
              >
                {[25, 50, 100].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-neutral-200/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider bg-neutral-50/50"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-2 ${
                            header.column.getCanSort() ? 'cursor-pointer select-none hover:text-neutral-900' : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
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
            <tbody>
              {table.getRowModel().rows.map((row, idx) => (
                <tr
                  key={row.id}
                  onClick={() => {
                    const point = sampleData.find(p => p.id === row.original.id);
                    if (point) {
                      setHighlightedRow(point.id);
                      setSelectedPoint(point);
                    }
                  }}
                  className={`
                    border-b border-neutral-200/30 hover:bg-neutral-50/50 transition-colors cursor-pointer
                    ${idx % 2 === 0 ? 'bg-white/20' : 'bg-white/40'}
                    ${highlightedRow === row.original.id ? 'bg-pop-primary/10' : ''}
                  `}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm text-neutral-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
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
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="glass-button-small px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="glass-button-small px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
