'use client';

import { useState, useRef, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import ScrollFade from "@/components/scroll-fade";
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

// Icons
const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const HelpIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface POData {
  poNumber: string;
  vendorCode: string;
  quantity: number;
  estimatedCost: number;
}

interface DataPoint {
  id: string;
  sku: string;
  productName: string;
  warehouseLocation: string;
  predictedDemand: number;
  currentInventory: number;
  currentGapItemCount: number;
  itemValueMetric: number;
  aggregateMetric: number;
  importance: number; // Maps to item_value_metric
  urgency: number; // Maps to current_gap_item_count
  category: string;
  lastOrderDate: string;
  poData: POData;
}

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
  const [promoRecommendations, setPromoRecommendations] = useState<any[]>([]);
  const [selectedPromo, setSelectedPromo] = useState<any | null>(null);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [metadataPoints, setMetadataPoints] = useState<DataPoint[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [highlightedPromoItems, setHighlightedPromoItems] = useState<string[]>([]);
  const [pdfMapping, setPdfMapping] = useState<Record<string, string>>({});

  const columns: ColumnDef<DataPoint>[] = [
    {
      accessorKey: 'sku',
      header: 'Item Number',
      cell: (info) => <span className="font-medium">{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'warehouseLocation',
      header: 'Warehouse',
      cell: (info) => <span className="text-sm">{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'predictedDemand',
      header: 'Predicted Demand',
      cell: (info) => (
        <span className="text-sm">
          {(info.getValue() as number).toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
      ),
    },
    {
      accessorKey: 'currentInventory',
      header: 'Current Inventory',
      cell: (info) => (
        <span className="text-sm">
          {(info.getValue() as number).toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
      ),
    },
    {
      accessorKey: 'urgency',
      header: 'Gap (Urgency)',
      cell: (info) => (
        <span className="font-semibold text-warning">
          {(info.getValue() as number).toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
      ),
    },
    {
      accessorKey: 'importance',
      header: 'Value (Importance)',
      cell: (info) => (
        <span className="font-semibold text-pop-primary">
          {(info.getValue() as number).toFixed(3)}
        </span>
      ),
    },
    {
      accessorKey: 'aggregateMetric',
      header: 'Aggregate Metric',
      cell: (info) => (
        <span className="text-sm">
          {(info.getValue() as number).toFixed(3)}
        </span>
      ),
    },
  ];

  const table = useReactTable({
    data: metadataPoints,
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

  // Fetch AI Metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoadingMetadata(true);
        const response = await fetch('/api/ai-metadata');
        const result = await response.json();
        
        if (result.success) {
          const mappedData = result.data.map((item: any, index: number) => ({
            id: String(index + 1),
            sku: item.sku,
            productName: item.productName,
            warehouseLocation: item.warehouseLocation,
            predictedDemand: item.predictedDemand,
            currentInventory: item.currentInventory,
            currentGapItemCount: item.currentGapItemCount,
            itemValueMetric: item.itemValueMetric,
            aggregateMetric: item.aggregateMetric,
            importance: item.importance, // item_value_metric
            urgency: item.urgency, // current_gap_item_count
            category: item.category,
            lastOrderDate: item.lastOrderDate,
            poData: {
              poNumber: `PO-2026-${String(index + 1).padStart(3, '0')}`,
              vendorCode: item.warehouseLocation,
              quantity: Math.round(item.predictedDemand),
              estimatedCost: Math.round(item.currentGapItemCount * item.itemValueMetric * 10),
            },
          }));
          setMetadataPoints(mappedData);
        }
      } catch (error) {
        console.error('Failed to fetch AI metadata:', error);
        // Fallback to sample data if API fails
        setMetadataPoints([]);
      } finally {
        setLoadingMetadata(false);
      }
    };
    
    fetchMetadata();
  }, []);

  // Fetch PDF Mapping
  useEffect(() => {
    const fetchPdfMapping = async () => {
      try {
        const response = await fetch('/data/pdf_mapping.json');
        const data = await response.json();
        
        // Create a map of vendor_code to pdf_url
        const mapping: Record<string, string> = {};
        data.forEach((item: any) => {
          mapping[item.vendor_code] = item.pdf_url;
        });
        setPdfMapping(mapping);
      } catch (error) {
        console.error('Failed to fetch PDF mapping:', error);
      }
    };
    
    fetchPdfMapping();
  }, []);

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
  const importanceValues = metadataPoints.map(d => d.importance);
  const urgencyValues = metadataPoints.map(d => d.urgency);
  
  const minImportance = 0;
  const maxImportance = Math.ceil(Math.max(...importanceValues, 1));
  const minUrgency = 0; // Always normalize from 0
  const maxUrgency = Math.max(...urgencyValues, 1); // Prevent division by zero
  
  const importanceRange = maxImportance - minImportance;
  const urgencyRange = maxUrgency; // Range is just the max value
  
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
  
  // For Y-axis (urgency), show normalized values 0-1
  const getNormalizedUrgencyTicks = () => {
    return [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  };
  
  const importanceTicks = getTickValues(minImportance, maxImportance);
  const urgencyTicks = getNormalizedUrgencyTicks();

  // Load promo recommendations from localStorage or fetch
  useEffect(() => {
    const loadPromos = async () => {
      // Check localStorage first
      const cached = localStorage.getItem('promoRecommendations');
      const cacheTimestamp = localStorage.getItem('promoRecommendationsTimestamp');
      
      // Cache for 24 hours
      const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : Infinity;
      const cacheValid = cacheAge < 24 * 60 * 60 * 1000;

      if (cached && cacheValid) {
        setPromoRecommendations(JSON.parse(cached));
        return;
      }

      // Fetch from API
      setLoadingPromos(true);
      try {
        const response = await fetch('/api/analyze-promotions', { method: 'POST' });
        const data = await response.json();
        
        if (data.success && data.recommendations) {
          setPromoRecommendations(data.recommendations);
          localStorage.setItem('promoRecommendations', JSON.stringify(data.recommendations));
          localStorage.setItem('promoRecommendationsTimestamp', Date.now().toString());
        }
      } catch (error) {
        console.error('Failed to load promo recommendations:', error);
      } finally {
        setLoadingPromos(false);
      }
    };

    loadPromos();
  }, []);

  return (
    <div className="p-8 space-y-6">
      {/* Header with Icons */}
      <ScrollFade>
        <div className="flex items-center justify-between">
        <PageHeader
          title="Demand Intelligence"
          description="AI-powered demand analysis and forecasting to optimize inventory decisions"
        />
        
        {/* Top Right Icons */}
        <div className="flex items-center gap-3">
          <button className="p-2.5 glass-button-small rounded-xl hover:scale-105 transition-transform duration-200 focus:outline-none active:scale-95">
            <HelpIcon />
          </button>
          <button className="p-2.5 glass-button-small rounded-xl hover:scale-105 transition-transform duration-200 focus:outline-none active:scale-95 relative">
            <BellIcon />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
          </button>
          <button className="p-2.5 glass-button-small rounded-xl hover:scale-105 transition-transform duration-200 focus:outline-none active:scale-95">
            <SettingsIcon />
          </button>
        </div>
      </div>
      </ScrollFade>

      {/* Canvas Section */}
      <ScrollFade delay={100}>
      <div className="glass-panel rounded-2xl p-6 relative">
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
                      Urgency (Normalized) →
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
                    
                    {/* Y-axis Tick Labels (Urgency - Normalized 0-1) */}
                    {urgencyTicks.map(tick => {
                      const y = (h - bottomPadding) - (tick * plotHeight);
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
            {metadataPoints.map(point => {
              const leftPadding = 60;
              const bottomPadding = 100;
              const w = containerRef.current?.clientWidth || 1200;
              const h = containerRef.current?.clientHeight || 600;
              const plotWidth = w - leftPadding - 20;
              const plotHeight = h - bottomPadding - 20;
              
              // Normalize to 0-based range
              const normalizedImportance = (point.importance - minImportance) / importanceRange;
              const normalizedUrgency = point.urgency / urgencyRange; // Normalize from 0 to max
              
              const px = leftPadding + normalizedImportance * plotWidth;
              const py = (h - bottomPadding) - normalizedUrgency * plotHeight;

              const isSelected = selectedPoint?.id === point.id;
              const isHovered = hoveredPoint?.id === point.id;
              const isHighlighted = highlightedRow === point.id;
              const isPromoRelated = highlightedPromoItems.includes(point.sku);

              return (
                <div
                  key={point.id}
                  className="data-point absolute flex items-center justify-center transition-all duration-200 cursor-pointer"
                  style={{
                    left: px,
                    top: py,
                    width: POINT_SIZE,
                    height: POINT_SIZE,
                    transform: `translate(-50%, -50%) scale(${isSelected || isHovered || isHighlighted || isPromoRelated ? HOVER_SCALE : 1})`,
                    zIndex: isSelected || isHovered || isHighlighted || isPromoRelated ? 50 : 10
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
                        : isPromoRelated
                        ? 'bg-warning ring-2 ring-warning ring-offset-2 animate-pulse'
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
                  <span className="text-sm text-neutral-600">Warehouse:</span>
                  <span className="text-sm font-semibold text-neutral-900">{selectedPoint.warehouseLocation}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Predicted Demand:</span>
                  <span className="text-sm font-semibold text-neutral-900">{selectedPoint.predictedDemand.toLocaleString(undefined, { maximumFractionDigits: 0 })} units</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Current Inventory:</span>
                  <span className="text-sm font-semibold text-neutral-900">{selectedPoint.currentInventory.toLocaleString(undefined, { maximumFractionDigits: 0 })} units</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Gap (Raw):</span>
                  <span className="text-sm font-semibold text-neutral-900">{selectedPoint.urgency.toLocaleString(undefined, { maximumFractionDigits: 0 })} units</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Urgency (Normalized):</span>
                  <span className="text-sm font-semibold text-warning">{maxUrgency > 0 ? (selectedPoint.urgency / maxUrgency).toFixed(3) : '0.000'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Value (Importance):</span>
                  <span className="text-sm font-semibold text-pop-primary">{selectedPoint.importance.toFixed(3)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Aggregate Metric:</span>
                  <span className="text-sm font-semibold text-neutral-900">{selectedPoint.aggregateMetric.toFixed(3)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href="/reorder"
                  className="block w-full px-4 py-2.5 bg-pop-primary text-white text-center font-medium rounded-xl hover:bg-pop-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-pop-primary/30"
                >
                  Navigate to Reorder Center
                </a>
                
                {pdfMapping[selectedPoint.warehouseLocation] && (
                  <a
                    href={pdfMapping[selectedPoint.warehouseLocation]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white border-2 border-pop-primary text-pop-primary text-center font-medium rounded-xl hover:bg-pop-primary/5 transition-colors focus:outline-none focus:ring-2 focus:ring-pop-primary/30"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    View Purchase Order PDF
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      </ScrollFade>

      {/* Table Section */}
      <ScrollFade delay={200}>
      <div className="glass-panel rounded-2xl p-6">
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
                    const point = metadataPoints.find(p => p.id === row.original.id);
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
      </ScrollFade>

      {/* AI Promo Recommendations Section - Full Width */}
      <ScrollFade delay={300} className="col-span-12">
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">AI Promo Recommendations</h3>
              <p className="text-sm text-neutral-600">Optimal promotion timing based on historical data and events</p>
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto pr-2" style={{ maxHeight: '420px' }}>
            {loadingPromos ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-neutral-600">Analyzing promotions...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {promoRecommendations.map((promo, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 bg-neutral-50/50 rounded-xl border border-neutral-200/30 hover:border-pop-primary/30 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => setSelectedPromo(promo)}
                    onMouseEnter={() => setHighlightedPromoItems(promo.itemNumbers || [])}
                    onMouseLeave={() => setHighlightedPromoItems([])}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-neutral-900">{promo.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            promo.confidence === 'High' 
                              ? 'bg-success/10 text-success' 
                              : promo.confidence === 'Medium-High'
                              ? 'bg-pop-primary/10 text-pop-primary'
                              : 'bg-warning/10 text-warning'
                          }`}>
                            {promo.confidence}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-neutral-600 mb-2">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {promo.timing}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {promo.event}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-2xl font-bold text-pop-primary">{promo.score}</span>
                          <span className="text-xs text-neutral-600">/100</span>
                        </div>
                        <span className="text-xs text-neutral-600">AI Score</span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-700 mb-3 leading-relaxed">{promo.reasoning}</p>

                    <div className="grid grid-cols-4 gap-3 mb-2">
                      <div className="text-center">
                        <p className="text-xs text-neutral-600">Revenue</p>
                        <p className="text-sm font-semibold text-success">{promo.projectedRevenue}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-neutral-600">Units</p>
                        <p className="text-sm font-semibold text-neutral-900">{promo.projectedUnits}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-neutral-600">ROI</p>
                        <p className="text-sm font-semibold text-pop-primary">{promo.roi}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-neutral-600">Confidence</p>
                        <p className="text-sm font-semibold text-neutral-900">{promo.confidence}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-200/50">
                      <span className="text-xs text-neutral-500 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Based on: {promo.csvBasis}
                      </span>
                      <button 
                        className="text-xs text-pop-primary hover:underline font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPromo(promo);
                        }}
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button 
              className="w-full mt-4 px-4 py-2.5 glass-button rounded-xl text-sm font-medium text-neutral-700 hover:text-pop-primary transition-colors duration-200 focus:outline-none active:scale-95 sticky bottom-0 bg-white"
              onClick={async () => {
                localStorage.removeItem('promoRecommendations');
                localStorage.removeItem('promoRecommendationsTimestamp');
                setLoadingPromos(true);
                try {
                  const response = await fetch('/api/analyze-promotions', { method: 'POST' });
                  const data = await response.json();
                  if (data.success && data.recommendations) {
                    setPromoRecommendations(data.recommendations);
                    localStorage.setItem('promoRecommendations', JSON.stringify(data.recommendations));
                    localStorage.setItem('promoRecommendationsTimestamp', Date.now().toString());
                  }
                } catch (error) {
                  console.error('Failed to reload promo recommendations:', error);
                } finally {
                  setLoadingPromos(false);
                }
              }}
            >
              Generate More Recommendations
            </button>
          </div>
        </div>
      </ScrollFade>

      {/* Promo Details Modal */}
      {selectedPromo && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPromo(null)}
        >
          <div 
            className="glass-panel rounded-2xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">{selectedPromo.title}</h2>
                <div className="flex items-center gap-3 text-sm text-neutral-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {selectedPromo.timing}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {selectedPromo.event}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedPromo.confidence === 'High' 
                      ? 'bg-success/10 text-success' 
                      : selectedPromo.confidence === 'Medium-High'
                      ? 'bg-pop-primary/10 text-pop-primary'
                      : 'bg-warning/10 text-warning'
                  }`}>
                    {selectedPromo.confidence} Confidence
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPromo(null)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-linear-to-br from-green-50 to-green-100 rounded-xl">
                <p className="text-xs text-green-700 mb-1">Projected Revenue</p>
                <p className="text-2xl font-bold text-green-700">{selectedPromo.projectedRevenue}</p>
              </div>
              <div className="p-4 bg-linear-to-br from-blue-50 to-blue-100 rounded-xl">
                <p className="text-xs text-blue-700 mb-1">Projected Units</p>
                <p className="text-2xl font-bold text-blue-700">{selectedPromo.projectedUnits}</p>
              </div>
              <div className="p-4 bg-linear-to-br from-purple-50 to-purple-100 rounded-xl">
                <p className="text-xs text-purple-700 mb-1">Expected ROI</p>
                <p className="text-2xl font-bold text-purple-700">{selectedPromo.roi}</p>
              </div>
              <div className="p-4 bg-linear-to-br from-orange-50 to-orange-100 rounded-xl">
                <p className="text-xs text-orange-700 mb-1">AI Score</p>
                <p className="text-2xl font-bold text-orange-700">{selectedPromo.score}/100</p>
              </div>
            </div>

            {/* Chain of Thought Reasoning */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-pop-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Reasoning Process
              </h3>

              {selectedPromo.chainOfThought && Object.entries(selectedPromo.chainOfThought).map(([key, value], idx) => (
                <div key={key} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-pop-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-neutral-900 mb-1 capitalize">
                        {key.replace(/_/g, ' ').replace(/step\d+\s*/i, '')}
                      </h4>
                      <p className="text-sm text-neutral-700 leading-relaxed">{String(value)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Metrics */}
            {selectedPromo.metrics && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">Data Analysis Metrics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-xs text-neutral-600 mb-1">Avg Margin %</p>
                    <p className="text-lg font-semibold text-neutral-900">{(selectedPromo.metrics.avgMargin * 100).toFixed(2)}%</p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-xs text-neutral-600 mb-1">Avg Gross Profit</p>
                    <p className="text-lg font-semibold text-neutral-900">${selectedPromo.metrics.avgGrossProfit.toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-xs text-neutral-600 mb-1">Avg Unit Price</p>
                    <p className="text-lg font-semibold text-neutral-900">${selectedPromo.metrics.avgUnitPrice.toFixed(2)}</p>
                  </div>
                  {selectedPromo.metrics.avgExtendedPrice !== undefined && (
                    <div className="p-3 bg-neutral-50 rounded-lg">
                      <p className="text-xs text-neutral-600 mb-1">Avg Extended Price</p>
                      <p className="text-lg font-semibold text-neutral-900">${selectedPromo.metrics.avgExtendedPrice.toFixed(2)}</p>
                    </div>
                  )}
                  {selectedPromo.metrics.avgExtendedCost !== undefined && (
                    <div className="p-3 bg-neutral-50 rounded-lg">
                      <p className="text-xs text-neutral-600 mb-1">Avg Extended Cost</p>
                      <p className="text-lg font-semibold text-neutral-900">${selectedPromo.metrics.avgExtendedCost.toFixed(2)}</p>
                    </div>
                  )}
                  {selectedPromo.metrics.avgQuantity !== undefined && (
                    <div className="p-3 bg-neutral-50 rounded-lg">
                      <p className="text-xs text-neutral-600 mb-1">Avg Quantity</p>
                      <p className="text-lg font-semibold text-neutral-900">{selectedPromo.metrics.avgQuantity.toFixed(1)}</p>
                    </div>
                  )}
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-xs text-neutral-600 mb-1">Total Volume</p>
                    <p className="text-lg font-semibold text-neutral-900">{selectedPromo.metrics.totalVolume.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-xs text-neutral-600 mb-1">Seasonality Score</p>
                    <p className="text-lg font-semibold text-neutral-900">{selectedPromo.metrics.seasonalityScore.toFixed(1)}</p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-xs text-neutral-600 mb-1">Profitability Score</p>
                    <p className="text-lg font-semibold text-neutral-900">{selectedPromo.metrics.profitabilityScore.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Data Source */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 mb-4">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Data Source: {selectedPromo.csvBasis}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button 
                className="flex-1 py-3 glass-button rounded-xl font-medium hover:scale-[1.02] transition-transform"
                onClick={() => setSelectedPromo(null)}
              >
                Close
              </button>
              <button className="flex-1 py-3 bg-pop-primary text-white rounded-xl font-medium hover:scale-[1.02] transition-transform">
                Create Promotion Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
