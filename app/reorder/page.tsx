'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import ScrollFade from "@/components/scroll-fade";

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

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  status: 'Draft' | 'Pending' | 'Approved' | 'In Transit' | 'Received';
  totalAmount: number;
  itemCount: number;
  dueDate: string;
  createdDate: string;
  priority: 'High' | 'Medium' | 'Low';
  pdfUrl?: string;
  vendorCode?: string;
}

interface PDFMapping {
  po_number: string;
  vendor_code: string;
  quantity: number;
  estimated_cost: number;
  pdf_url: string;
}

export default function ReorderPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [selectedPOs, setSelectedPOs] = useState<string[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  // Fetch PDF mappings and create POs
  useEffect(() => {
    const fetchPdfMappings = async () => {
      try {
        const response = await fetch('/data/pdf_mapping.json');
        const data: PDFMapping[] = await response.json();
        
        // Map PDF data to PurchaseOrder format
        const mappedPOs: PurchaseOrder[] = data.map((pdf, index) => ({
          id: pdf.po_number,
          poNumber: pdf.po_number,
          supplier: `Vendor ${pdf.vendor_code}`,
          vendorCode: pdf.vendor_code,
          status: 'Approved',
          totalAmount: pdf.estimated_cost,
          itemCount: Math.ceil(pdf.quantity / 100), // Estimate item types
          dueDate: new Date(Date.now() + (15 + index * 2) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          createdDate: new Date(Date.now() - (5 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: pdf.estimated_cost > 10000 ? 'High' : pdf.estimated_cost > 1000 ? 'Medium' : 'Low',
          pdfUrl: pdf.pdf_url,
        }));
        
        setPurchaseOrders(mappedPOs);
      } catch (error) {
        console.error('Failed to fetch PDF mappings:', error);
      }
    };
    
    fetchPdfMappings();
  }, []);

  const filteredPOs = purchaseOrders.filter(po => 
    po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    po.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    po.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-neutral-100 text-neutral-700';
      case 'Pending': return 'bg-warning/10 text-warning';
      case 'Approved': return 'bg-success/10 text-success';
      case 'In Transit': return 'bg-pop-primary/10 text-pop-primary';
      case 'Received': return 'bg-neutral-200 text-neutral-900';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-danger';
      case 'Medium': return 'text-warning';
      case 'Low': return 'text-neutral-600';
      default: return 'text-neutral-600';
    }
  };

  const togglePOSelection = (id: string) => {
    setSelectedPOs(prev => 
      prev.includes(id) ? prev.filter(poId => poId !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header with Icons */}
      <ScrollFade>
      <div className="flex items-center justify-between">
        <PageHeader
          title="Reorder Center"
          description="Manage inventory reorder points and purchase orders"
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

      {/* Recommended Purchase Order PDFs */}
      {/* Your POs Section */}
      <ScrollFade delay={100}>
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900">Your POs</h3>
          <div className="flex items-center gap-3">
            <button 
              disabled={selectedPOs.length === 0}
              className="px-4 py-2 glass-button text-sm font-medium rounded-xl hover:glass-button-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export ({selectedPOs.length})
            </button>
            <button className="px-4 py-2 bg-pop-primary text-white text-sm font-medium rounded-xl hover:bg-pop-primary-dark transition-colors active:scale-95">
              + Upload New PO
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search POs by number, supplier, or status..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-pop-primary/30 focus:border-pop-primary transition-all text-neutral-900 placeholder:text-neutral-500"
            />
          </div>
        </div>

        {/* PO Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPOs.map((po) => (
            <div
              key={po.id}
              className={`glass-panel p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                selectedPOs.includes(po.id) 
                  ? 'border-pop-primary bg-pop-primary/5 shadow-lg ring-2 ring-pop-primary/20 scale-[1.02]' 
                  : 'border-transparent hover:border-neutral-200 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] active:translate-y-0'
              }`}
              style={{
                transform: selectedPOs.includes(po.id) ? 'translateY(-2px) scale(1.02)' : undefined,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* PDF Preview */}
              <div 
                className="relative mb-4 h-48 rounded-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-95 group"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePOSelection(po.id);
                }}
              >
                {po.pdfUrl ? (
                  <>
                    <iframe
                      src={`${po.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      title={`Preview of ${po.poNumber}`}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="text-xs font-medium text-white bg-black/80 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        Click card to select
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-linear-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                    <svg className="w-16 h-16 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2 z-10">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(po.status)}`}>
                    {po.status}
                  </span>
                </div>
                
                {/* PDF Indicator */}
                {po.pdfUrl && (
                  <div className="absolute top-2 left-2 z-10">
                    <div className="p-1.5 bg-pop-primary/90 rounded-lg backdrop-blur-sm">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                )}
                
                {/* Selection Indicator */}
                {selectedPOs.includes(po.id) && (
                  <div className="absolute inset-0 border-4 border-pop-primary rounded-lg pointer-events-none z-10" />
                )}
                {selectedPOs.includes(po.id) && (
                  <div className="absolute top-2 left-2 z-20">
                    <div className="w-6 h-6 bg-pop-primary rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* PO Info */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-neutral-900">{po.poNumber}</h4>
                    <p className="text-sm text-neutral-600">{po.supplier}</p>
                  </div>
                  <span className={`text-sm font-medium ${getPriorityColor(po.priority)}`}>
                    {po.priority}
                  </span>
                </div>

                <div className="pt-3 border-t border-neutral-200/50 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Amount:</span>
                    <span className="font-semibold text-neutral-900">${po.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Items:</span>
                    <span className="font-semibold text-neutral-900">{po.itemCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Due Date:</span>
                    <span className="font-semibold text-neutral-900">{new Date(po.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3">
                  <button
                    onClick={() => setSelectedPO(po)}
                    className="flex-1 px-3 py-2 glass-button rounded-lg text-sm font-medium hover:glass-button-hover transition-all active:scale-95"
                  >
                    View Details
                  </button>
                  {po.pdfUrl ? (
                    <a
                      href={po.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 px-3 py-2 bg-pop-primary text-white rounded-lg text-sm font-medium hover:bg-pop-primary-dark transition-all flex items-center justify-center gap-1 active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      View PDF
                    </a>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle send email
                      }}
                      className="flex-1 px-3 py-2 bg-pop-primary text-white rounded-lg text-sm font-medium hover:bg-pop-primary-dark transition-all flex items-center justify-center gap-1 active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Email
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPOs.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-neutral-600">No purchase orders found</p>
          </div>
        )}
      </div>
      </ScrollFade>

      {/* Detail Modal */}
      {selectedPO && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPO(null)}>
          <div className="glass-panel rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-neutral-900">{selectedPO.poNumber}</h3>
                <p className="text-neutral-600">{selectedPO.supplier}</p>
              </div>
              <button
                onClick={() => setSelectedPO(null)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-neutral-600">Status</p>
                <span className={`inline-block mt-1 px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedPO.status)}`}>
                  {selectedPO.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Priority</p>
                <p className={`font-semibold mt-1 ${getPriorityColor(selectedPO.priority)}`}>{selectedPO.priority}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Amount</p>
                <p className="font-semibold text-lg text-neutral-900 mt-1">${selectedPO.totalAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Item Count</p>
                <p className="font-semibold text-lg text-neutral-900 mt-1">{selectedPO.itemCount} items</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Created Date</p>
                <p className="font-semibold text-neutral-900 mt-1">{new Date(selectedPO.createdDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Due Date</p>
                <p className="font-semibold text-neutral-900 mt-1">{new Date(selectedPO.dueDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2.5 bg-pop-primary text-white font-medium rounded-xl hover:bg-pop-primary-dark transition-colors">
                Edit PO
              </button>
              <button className="flex-1 px-4 py-2.5 glass-button rounded-xl font-medium hover:glass-button-hover transition-colors">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
