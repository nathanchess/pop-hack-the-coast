'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

// Icons
const WaveIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
  </svg>
);

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

const TrendUpIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendDownIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
);

export default function Dashboard() {
  const [displayedText, setDisplayedText] = useState('');
  const [userName, setUserName] = useState('Guest');
  const [isTyping, setIsTyping] = useState(true);
  
  useEffect(() => {
    // Get name from cookie
    const name = Cookies.get('userName') || 'Guest';
    setUserName(name);
    
    const fullText = `Good morning, ${name}`;
    let index = 0;
    
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayedText(fullText.slice(0, index));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 50);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-8 min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div className="flex items-center gap-3">
          <WaveIcon />
          <h1 className="text-3xl font-bold text-neutral-900">
            {displayedText}
            {isTyping && <span className="animate-pulse">|</span>}
          </h1>
        </div>
        
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

      {/* Bento Box Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Total Revenue - Large Card */}
        <div className="col-span-12 lg:col-span-4 glass-panel rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="space-y-4">
            <p className="text-sm font-medium text-neutral-600">Total Revenue</p>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-neutral-900">$45.2M</h2>
              <div className="flex items-center gap-2 text-success">
                <TrendUpIcon />
                <span className="text-sm font-medium">+12% from last month</span>
              </div>
            </div>
            <div className="pt-4 border-t border-neutral-200/50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Gross Profit</span>
                <span className="text-sm font-semibold text-neutral-900">$12.8M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Avg Margin</span>
                <span className="text-sm font-semibold text-neutral-900">28.3%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Units Sold */}
        <div className="col-span-6 lg:col-span-4 glass-panel rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '150ms' }}>
          <div className="space-y-4">
            <p className="text-sm font-medium text-neutral-600">Total Units Sold</p>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-neutral-900">2.4M</h2>
              <div className="flex items-center gap-2 text-success">
                <TrendUpIcon />
                <span className="text-sm font-medium">+8.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active SKUs */}
        <div className="col-span-6 lg:col-span-4 glass-panel rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="space-y-4">
            <p className="text-sm font-medium text-neutral-600">Active SKUs</p>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-neutral-900">847</h2>
              <div className="flex items-center gap-2 text-neutral-600">
                <span className="text-sm font-medium">Out of 1,000 total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue by Channel - Large Table */}
        <div className="col-span-12 lg:col-span-7 glass-panel rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '250ms' }}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">Revenue Distribution by Channel</h3>
              <button className="text-sm text-pop-primary hover:underline focus:outline-none">View All</button>
            </div>
            
            <div className="space-y-3">
              {[
                { channel: 'Chain', revenue: '$18.2M', percentage: 40, units: '960K', growth: '+12%', positive: true },
                { channel: 'Supermarket', revenue: '$11.5M', percentage: 25, units: '612K', growth: '+8%', positive: true },
                { channel: 'Herbal', revenue: '$9.1M', percentage: 20, units: '485K', growth: '+15%', positive: true },
                { channel: 'Online', revenue: '$4.5M', percentage: 10, units: '242K', growth: '-3%', positive: false },
                { channel: 'Other', revenue: '$2.0M', percentage: 5, units: '121K', growth: '+5%', positive: true },
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-sm font-medium text-neutral-900 w-24">{item.channel}</span>
                      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-pop-primary rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-neutral-900 w-20 text-right">{item.revenue}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pl-24 text-xs text-neutral-600">
                    <span>{item.units} units</span>
                    <span className={item.positive ? 'text-success' : 'text-danger'}>{item.growth}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly AI Digest */}
        <div className="col-span-12 lg:col-span-5 glass-panel rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '300ms' }}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-ai-accent/10 rounded-lg">
                <svg className="w-5 h-5 text-ai-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">Weekly AI Insights</h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-neutral-50/50 rounded-xl border border-neutral-200/30">
                <div className="flex items-start gap-3">
                  <div className="w-1 h-full bg-ai-accent rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-neutral-900">Demand Spike Detected</p>
                    <p className="text-xs text-neutral-600">3 SKUs showing unusual demand patterns in Chain channel. Reorder recommended.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-neutral-50/50 rounded-xl border border-neutral-200/30">
                <div className="flex items-start gap-3">
                  <div className="w-1 h-full bg-warning rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-neutral-900">Low Stock Alert</p>
                    <p className="text-xs text-neutral-600">12 items approaching reorder point across all warehouses.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-neutral-50/50 rounded-xl border border-neutral-200/30">
                <div className="flex items-start gap-3">
                  <div className="w-1 h-full bg-success rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-neutral-900">Promotion Success</p>
                    <p className="text-xs text-neutral-600">Recent TPR campaign in Herbal channel exceeded forecast by 23%.</p>
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 px-4 py-2.5 glass-button-small rounded-xl text-sm font-medium text-neutral-700 hover:text-pop-primary transition-colors duration-200 focus:outline-none active:scale-95">
                View All Insights
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="col-span-12 lg:col-span-4 glass-panel rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '350ms' }}>
          <div className="space-y-4">
            <p className="text-sm font-medium text-neutral-600">Average Order Value</p>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-neutral-900">$18,750</h2>
              <div className="flex items-center gap-2 text-success">
                <TrendUpIcon />
                <span className="text-sm font-medium">+5.2%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 glass-panel rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '400ms' }}>
          <div className="space-y-4">
            <p className="text-sm font-medium text-neutral-600">Open Purchase Orders</p>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-neutral-900">127</h2>
              <div className="flex items-center gap-2 text-neutral-600">
                <span className="text-sm font-medium">$2.3M in transit</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 glass-panel rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '450ms' }}>
          <div className="space-y-4">
            <p className="text-sm font-medium text-neutral-600">Inventory Turnover</p>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-neutral-900">6.2x</h2>
              <div className="flex items-center gap-2 text-danger">
                <TrendDownIcon />
                <span className="text-sm font-medium">-0.3x</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
