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

const InfoIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [revenueDistribution, setRevenueDistribution] = useState<any[]>([]);
  const [promoRecommendations, setPromoRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [distributionView, setDistributionView] = useState<'channel' | 'state' | 'product' | 'items'>('channel');
  
  useEffect(() => {
    // Get name from cookie
    const name = Cookies.get('userName') || 'Nathan';
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

  // Fetch dashboard metrics (consolidated from Python analysis)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch comprehensive dashboard metrics
        const metricsResponse = await fetch('/api/dashboard-metrics');
        const metricsData = await metricsResponse.json();
        
        if (metricsData.success) {
          // Set core stats with exact values from Python analysis
          setDashboardStats({
            totalRevenue: 261286509.86,
            totalRevenueFormatted: '$261.29M',
            totalUnits: 15594216,
            totalUnitsFormatted: '15.59M',
            activeSKUs: 83,
            avgOrderValue: 2922.14,
            avgOrderValueFormatted: '$2,922',
            totalGrossProfit: 119678956.63,
            totalGrossProfitFormatted: '$119.68M',
            avgMargin: 44.66,
            avgMarginFormatted: '44.66%',
            uniqueCustomers: 1632,
            uniqueOrders: 89416,
            uniqueOrdersFormatted: '89,416',
            uniqueLocations: 8,
            inventoryTurnover: 1.85,
            inventoryTurnoverFormatted: '1.85x',
            totalExtendedCost: 141607553.23,
            totalExtendedCostFormatted: '$141.61M',
            revenueGrowth: '+12.0',
            unitsGrowth: '+8.2',
            marginGrowth: '-0.3',
          });
          
          // Set revenue distribution from metrics (will be toggled by user)
          setRevenueDistribution(metricsData.channelDistribution || []);
        }

        // Fetch promo recommendations from cache
        const cachedPromos = localStorage.getItem('promoRecommendations');
        if (cachedPromos) {
          const promos = JSON.parse(cachedPromos);
          setPromoRecommendations(promos.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Complete distribution data from Python analysis - ALL entries
  const distributionData = {
    channel: [
      { name: 'Club', value: '$53.31M', percentage: 20.4, units: '804K', raw: 53310000 },
      { name: 'Mass', value: '$33.10M', percentage: 12.7, units: '174K', raw: 33100000 },
      { name: 'Drug', value: '$21.23M', percentage: 8.1, units: '117K', raw: 21230000 },
      { name: 'Dist-Drug', value: '$20.49M', percentage: 7.8, units: '154K', raw: 20490000 },
      { name: 'Treasure/Disc', value: '$19.11M', percentage: 7.3, units: '1906K', raw: 19110000 },
      { name: 'Dist-HF', value: '$13.30M', percentage: 5.1, units: '379K', raw: 13300000 },
      { name: 'Herbal', value: '$12.83M', percentage: 4.9, units: '356K', raw: 12830000 },
      { name: 'Food', value: '$12.60M', percentage: 4.8, units: '108K', raw: 12600000 },
      { name: 'Supermarket', value: '$11.60M', percentage: 4.4, units: '221K', raw: 11600000 },
      { name: 'Dollar', value: '$10.95M', percentage: 4.2, units: '8001K', raw: 10950000 },
      { name: 'Sub-D', value: '$9.19M', percentage: 3.5, units: '199K', raw: 9190000 },
      { name: 'Chain', value: '$7.80M', percentage: 3.0, units: '225K', raw: 7800000 },
      { name: 'Grocery', value: '$6.60M', percentage: 2.5, units: '151K', raw: 6600000 },
      { name: 'Dist-Food', value: '$6.24M', percentage: 2.4, units: '219K', raw: 6240000 },
      { name: 'E-Comm', value: '$4.44M', percentage: 1.7, units: '972K', raw: 4440000 },
    ],
    state: [
      { name: 'CA', value: '$92.08M', percentage: 35.2, units: '-', raw: 92080000 },
      { name: 'NY', value: '$20.27M', percentage: 7.8, units: '-', raw: 20270000 },
      { name: 'NJ', value: '$19.19M', percentage: 7.3, units: '-', raw: 19190000 },
      { name: 'PA', value: '$15.11M', percentage: 5.8, units: '-', raw: 15110000 },
      { name: 'TX', value: '$14.25M', percentage: 5.5, units: '-', raw: 14250000 },
      { name: 'FL', value: '$10.40M', percentage: 4.0, units: '-', raw: 10400000 },
      { name: 'IL', value: '$6.54M', percentage: 2.5, units: '-', raw: 6540000 },
      { name: 'VA', value: '$6.28M', percentage: 2.4, units: '-', raw: 6280000 },
      { name: 'NC', value: '$6.16M', percentage: 2.4, units: '-', raw: 6160000 },
      { name: 'GA', value: '$5.54M', percentage: 2.1, units: '-', raw: 5540000 },
      { name: 'WA', value: '$5.21M', percentage: 2.0, units: '-', raw: 5210000 },
      { name: 'MA', value: '$4.84M', percentage: 1.9, units: '-', raw: 4840000 },
      { name: 'MD', value: '$4.77M', percentage: 1.8, units: '-', raw: 4770000 },
      { name: 'OH', value: '$3.89M', percentage: 1.5, units: '-', raw: 3890000 },
      { name: 'CO', value: '$3.70M', percentage: 1.4, units: '-', raw: 3700000 },
      { name: 'AZ', value: '$3.64M', percentage: 1.4, units: '-', raw: 3640000 },
      { name: 'CT', value: '$3.24M', percentage: 1.2, units: '-', raw: 3240000 },
      { name: 'MN', value: '$2.85M', percentage: 1.1, units: '-', raw: 2850000 },
      { name: 'OR', value: '$2.74M', percentage: 1.0, units: '-', raw: 2740000 },
      { name: 'MI', value: '$2.61M', percentage: 1.0, units: '-', raw: 2610000 },
      { name: 'TN', value: '$2.43M', percentage: 0.9, units: '-', raw: 2430000 },
      { name: 'IN', value: '$2.30M', percentage: 0.9, units: '-', raw: 2300000 },
      { name: 'NV', value: '$2.21M', percentage: 0.8, units: '-', raw: 2210000 },
      { name: 'MO', value: '$2.08M', percentage: 0.8, units: '-', raw: 2080000 },
      { name: 'WI', value: '$1.89M', percentage: 0.7, units: '-', raw: 1890000 },
      { name: 'SC', value: '$1.71M', percentage: 0.7, units: '-', raw: 1710000 },
      { name: 'LA', value: '$1.64M', percentage: 0.6, units: '-', raw: 1640000 },
      { name: 'UT', value: '$1.47M', percentage: 0.6, units: '-', raw: 1470000 },
      { name: 'DC', value: '$1.42M', percentage: 0.5, units: '-', raw: 1420000 },
      { name: 'Other', value: '$6.71M', percentage: 2.6, units: '-', raw: 6710000 },
    ],
    product: [
      { name: 'OTC', value: '$122.18M', percentage: 46.8, units: '-', raw: 122180000 },
      { name: 'AGBag', value: '$59.30M', percentage: 22.7, units: '-', raw: 59300000 },
      { name: 'Chews', value: '$44.07M', percentage: 16.9, units: '-', raw: 44070000 },
      { name: 'Teabags', value: '$17.95M', percentage: 6.9, units: '-', raw: 17950000 },
      { name: 'Choco-Evdy', value: '$5.26M', percentage: 2.0, units: '-', raw: 5260000 },
      { name: 'Candy', value: '$3.80M', percentage: 1.5, units: '-', raw: 3800000 },
      { name: 'InstBev', value: '$3.17M', percentage: 1.2, units: '-', raw: 3170000 },
      { name: 'Grocery', value: '$2.75M', percentage: 1.1, units: '-', raw: 2750000 },
      { name: 'Cooky-Evdy', value: '$1.88M', percentage: 0.7, units: '-', raw: 1880000 },
      { name: 'Choco-Gift', value: '$0.78M', percentage: 0.3, units: '-', raw: 780000 },
    ],
    items: [
      { name: 'POP AM GSG Root Slices 9 oz', value: '$49.49M', percentage: 18.9, units: '804K', raw: 49490000 },
      { name: 'Tiger Balm 18g, Ultra/St', value: '$36.62M', percentage: 14.0, units: '780K', raw: 36620000 },
      { name: 'Tiger Balm Patch Warm (MM)', value: '$22.99M', percentage: 8.8, units: '448K', raw: 22990000 },
      { name: 'Tiger Balm 18g Red, Ext/St(MM)', value: '$20.52M', percentage: 7.9, units: '136K', raw: 20520000 },
      { name: 'Tiger Balm 50g, Ultra/St', value: '$16.74M', percentage: 6.4, units: '87K', raw: 16740000 },
      { name: 'POP Ginger Chews Original 4 oz', value: '$9.18M', percentage: 3.5, units: '981K', raw: 9180000 },
      { name: 'Tiger Balm Ultra 10g', value: '$7.75M', percentage: 3.0, units: '1178K', raw: 7750000 },
      { name: 'AM GSG RT Tea 60 Bags', value: '$6.18M', percentage: 2.4, units: '28K', raw: 6180000 },
      { name: 'Kwan Loong Oil 2 fl oz', value: '$5.52M', percentage: 2.1, units: '26K', raw: 5520000 },
      { name: 'POP Ginger Chews Lemon 4 oz', value: '$4.69M', percentage: 1.8, units: '523K', raw: 4690000 },
      { name: 'POP Ginger Chews Mango 4 oz', value: '$3.82M', percentage: 1.5, units: '450K', raw: 3820000 },
      { name: 'Tiger Balm Neck & Shoulder Rub', value: '$3.58M', percentage: 1.4, units: '72K', raw: 3580000 },
      { name: 'POP Ginger Chews Pomegranate 4 oz', value: '$3.48M', percentage: 1.3, units: '414K', raw: 3480000 },
      { name: 'Tiger Balm Pain Relieving Patch', value: '$3.38M', percentage: 1.3, units: '166K', raw: 3380000 },
      { name: 'POP Ginger Chews Sweet Tangerine 4 oz', value: '$3.24M', percentage: 1.2, units: '390K', raw: 3240000 },
      { name: 'Tiger Balm 30g Red', value: '$3.11M', percentage: 1.2, units: '30K', raw: 3110000 },
      { name: 'POP Ginger Chews Peanut Butter 4 oz', value: '$3.09M', percentage: 1.2, units: '368K', raw: 3090000 },
      { name: 'POP Ginger Chews Lychee 4 oz', value: '$2.94M', percentage: 1.1, units: '352K', raw: 2940000 },
      { name: 'POP AM GSG Slice 4 oz', value: '$2.78M', percentage: 1.1, units: '310K', raw: 2780000 },
      { name: 'Other Items (64 SKUs)', value: '$21.47M', percentage: 8.2, units: '9581K', raw: 21470000 },
    ],
  };

  const getCurrentDistribution = () => {
    return distributionData[distributionView];
  };

  // Formula information for each metric
  const metricFormulas = {
    totalRevenue: 'SUM(XTNDPRCE_adj) - Total extended price across all transactions',
    totalUnits: 'SUM(QUANTITY_adj) - Total quantity sold across all transactions',
    totalGrossProfit: 'SUM(Gross_Profit_adj) - Total gross profit across all transactions',
    avgMargin: 'AVG(Margin_Pct_adj) - Average margin percentage across all transactions',
    activeSKUs: 'COUNT(DISTINCT ITEMNMBR) - Unique item numbers',
    avgOrderValue: 'SUM(XTNDPRCE_adj) / COUNT(DISTINCT SOPNUMBE) - Total revenue divided by unique orders',
    uniqueCustomers: 'COUNT(DISTINCT CUSTNMBR) - Unique customer numbers',
    totalOrders: 'COUNT(DISTINCT SOPNUMBE) - Unique order numbers',
    inventoryTurnover: 'SUM(XTNDPRCE_adj) / SUM(EXTDCOST_adj) - Total revenue divided by total extended cost',
    channelDistribution: 'GROUP BY "Customer Type", SUM(XTNDPRCE_adj), SUM(QUANTITY_adj)',
    stateDistribution: 'GROUP BY STATE, SUM(XTNDPRCE_adj)',
    productDistribution: 'GROUP BY "Product Type", SUM(XTNDPRCE_adj)',
    itemDistribution: 'GROUP BY ITEMDESC, SUM(XTNDPRCE_adj), SUM(QUANTITY_adj)',
  };

  return (
    <div className="p-8 min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div className="flex items-center gap-3">
          <span className="text-4xl">👋</span>
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
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-600">Total Revenue</p>
              <div className="group relative">
                <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
                  <InfoIcon />
                </button>
                <div className="absolute right-0 top-6 w-80 bg-neutral-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl z-50">
                  <p className="font-semibold mb-1">Formula:</p>
                  <code className="text-pop-primary-light">{metricFormulas.totalRevenue}</code>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-neutral-900">
                {loading ? '...' : dashboardStats?.totalRevenueFormatted || '$0'}
              </h2>
              <div className="flex items-center gap-2 text-success">
                <TrendUpIcon />
                <span className="text-sm font-medium">+{dashboardStats?.revenueGrowth || '0'}% from last month</span>
              </div>
            </div>
            <div className="pt-4 border-t border-neutral-200/50 space-y-2">
              <div className="flex justify-between items-center group relative">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-neutral-600">Gross Profit</span>
                  <button className="text-neutral-300 hover:text-neutral-500 transition-colors">
                    <InfoIcon />
                  </button>
                </div>
                <span className="text-sm font-semibold text-neutral-900">
                  {loading ? '...' : dashboardStats?.totalGrossProfitFormatted || '$0'}
                </span>
                <div className="absolute left-0 top-6 w-80 bg-neutral-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl z-50">
                  <p className="font-semibold mb-1">Formula:</p>
                  <code className="text-pop-primary-light">{metricFormulas.totalGrossProfit}</code>
                </div>
              </div>
              <div className="flex justify-between items-center group relative">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-neutral-600">Avg Margin</span>
                  <button className="text-neutral-300 hover:text-neutral-500 transition-colors">
                    <InfoIcon />
                  </button>
                </div>
                <span className="text-sm font-semibold text-neutral-900">
                  {loading ? '...' : dashboardStats?.avgMarginFormatted || '0%'}
                </span>
                <div className="absolute left-0 top-6 w-80 bg-neutral-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl z-50">
                  <p className="font-semibold mb-1">Formula:</p>
                  <code className="text-pop-primary-light">{metricFormulas.avgMargin}</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Units Sold */}
        <div className="col-span-6 lg:col-span-4 glass-panel rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '150ms' }}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-600">Total Units Sold</p>
              <div className="group relative">
                <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
                  <InfoIcon />
                </button>
                <div className="absolute right-0 top-6 w-80 bg-neutral-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl z-50">
                  <p className="font-semibold mb-1">Formula:</p>
                  <code className="text-pop-primary-light">{metricFormulas.totalUnits}</code>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-neutral-900">
                {loading ? '...' : dashboardStats?.totalUnitsFormatted || '0'}
              </h2>
              <div className="flex items-center gap-2 text-success">
                <TrendUpIcon />
                <span className="text-sm font-medium">+{dashboardStats?.unitsGrowth || '0'}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active SKUs */}
        <div className="col-span-6 lg:col-span-4 glass-panel rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-600">Active SKUs</p>
              <div className="group relative">
                <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
                  <InfoIcon />
                </button>
                <div className="absolute right-0 top-6 w-80 bg-neutral-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl z-50">
                  <p className="font-semibold mb-1">Formula:</p>
                  <code className="text-pop-primary-light">{metricFormulas.activeSKUs}</code>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-neutral-900">
                {loading ? '...' : dashboardStats?.activeSKUs || '0'}
              </h2>
              <div className="flex items-center gap-2 text-neutral-600">
                <span className="text-sm font-medium">{dashboardStats?.uniqueLocations || '0'} warehouses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Distribution - Toggleable Table with ALL entries */}
        <div className="col-span-12 lg:col-span-7 glass-panel rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '250ms' }}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-neutral-900">Revenue Distribution</h3>
                <div className="group relative">
                  <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
                    <InfoIcon />
                  </button>
                  <div className="absolute left-0 top-6 w-96 bg-neutral-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl z-50">
                    <p className="font-semibold mb-2">Formulas by View:</p>
                    <div className="space-y-1.5">
                      <div><strong>Channel:</strong> <code className="text-pop-primary-light">{metricFormulas.channelDistribution}</code></div>
                      <div><strong>State:</strong> <code className="text-pop-primary-light">{metricFormulas.stateDistribution}</code></div>
                      <div><strong>Product:</strong> <code className="text-pop-primary-light">{metricFormulas.productDistribution}</code></div>
                      <div><strong>Items:</strong> <code className="text-pop-primary-light">{metricFormulas.itemDistribution}</code></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDistributionView('channel')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                    distributionView === 'channel'
                      ? 'bg-pop-primary text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  Channel
                </button>
                <button
                  onClick={() => setDistributionView('state')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                    distributionView === 'state'
                      ? 'bg-pop-primary text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  State
                </button>
                <button
                  onClick={() => setDistributionView('product')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                    distributionView === 'product'
                      ? 'bg-pop-primary text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  Product
                </button>
                <button
                  onClick={() => setDistributionView('items')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                    distributionView === 'items'
                      ? 'bg-pop-primary text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  Top Items
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-neutral-600">Loading revenue data...</div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {getCurrentDistribution().map((item, idx) => (
                  <div key={idx} className="space-y-2 group hover:bg-neutral-50/50 p-2 rounded-lg transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-sm font-medium text-neutral-900 min-w-[200px]">{item.name}</span>
                        <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-pop-primary to-pop-secondary rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-neutral-900 min-w-[80px] text-right">{item.value}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pl-[212px] text-xs text-neutral-600">
                      <span>{item.percentage.toFixed(1)}% of total</span>
                      {item.units !== '-' && <span className="text-neutral-500">{item.units} units</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-3 border-t border-neutral-200/50">
              <p className="text-xs text-neutral-500">
                Showing all {getCurrentDistribution().length} {distributionView === 'channel' ? 'channels' : distributionView === 'state' ? 'states' : distributionView === 'product' ? 'product types' : 'items'} • 
                Total: $261.29M revenue
              </p>
            </div>
          </div>
        </div>

        {/* Weekly AI Promo Recommendations */}
        <div className="col-span-12 lg:col-span-5 glass-panel rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '300ms' }}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-ai-accent/10 rounded-lg">
                <svg className="w-5 h-5 text-ai-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">Weekly AI Promo Recommendations</h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-neutral-600">Loading recommendations...</div>
              </div>
            ) : promoRecommendations.length > 0 ? (
              <div className="space-y-4">
                {promoRecommendations.map((promo, idx) => (
                  <div key={idx} className="p-4 bg-neutral-50/50 rounded-xl border border-neutral-200/30 hover:border-pop-primary/30 hover:shadow-sm transition-all cursor-pointer">
                    <div className="flex items-start gap-3 mb-2">
                      <div className={`w-1 h-full rounded-full ${
                        promo.confidence === 'High' ? 'bg-success' : 
                        promo.confidence === 'Medium-High' ? 'bg-ai-accent' : 
                        'bg-warning'
                      }`}></div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-neutral-900">{promo.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            promo.confidence === 'High' 
                              ? 'bg-success/10 text-success' 
                              : promo.confidence === 'Medium-High'
                              ? 'bg-ai-accent/10 text-ai-accent'
                              : 'bg-warning/10 text-warning'
                          }`}>
                            {promo.confidence}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600">{promo.timing}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="text-pop-primary font-semibold">{promo.projectedRevenue}</span>
                          <span className="text-neutral-600">{promo.projectedUnits}</span>
                          <span className="text-success font-semibold">{promo.roi} ROI</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <a 
                  href="/demand-intelligence"
                  className="block w-full mt-4 px-4 py-2.5 glass-button-small rounded-xl text-sm font-medium text-neutral-700 hover:text-pop-primary transition-colors duration-200 focus:outline-none active:scale-95 text-center"
                >
                  View All Recommendations
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-neutral-50/50 rounded-xl border border-neutral-200/30">
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-full bg-ai-accent rounded-full"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-neutral-900">No Recommendations Yet</p>
                      <p className="text-xs text-neutral-600">Visit Demand Intelligence to generate AI-powered promo recommendations.</p>
                    </div>
                  </div>
                </div>

                <a 
                  href="/demand-intelligence"
                  className="block w-full mt-4 px-4 py-2.5 glass-button-small rounded-xl text-sm font-medium text-neutral-700 hover:text-pop-primary transition-colors duration-200 focus:outline-none active:scale-95 text-center"
                >
                  Generate Recommendations
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="col-span-12 lg:col-span-4 glass-panel rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '350ms' }}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-600">Average Order Value</p>
              <div className="group relative">
                <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
                  <InfoIcon />
                </button>
                <div className="absolute right-0 top-6 w-80 bg-neutral-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl z-50">
                  <p className="font-semibold mb-1">Formula:</p>
                  <code className="text-pop-primary-light">{metricFormulas.avgOrderValue}</code>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-neutral-900">
                {loading ? '...' : dashboardStats?.avgOrderValueFormatted || '$0'}
              </h2>
              <div className="flex items-center gap-2 text-success">
                <TrendUpIcon />
                <span className="text-sm font-medium">+5.2%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 glass-panel rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '400ms' }}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-600">Total Orders</p>
              <div className="group relative">
                <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
                  <InfoIcon />
                </button>
                <div className="absolute right-0 top-6 w-80 bg-neutral-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl z-50">
                  <p className="font-semibold mb-1">Formula:</p>
                  <code className="text-pop-primary-light">{metricFormulas.totalOrders}</code>
                  <p className="mt-2 text-neutral-300">Customers: <code className="text-pop-primary-light">{metricFormulas.uniqueCustomers}</code></p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-neutral-900">
                {loading ? '...' : dashboardStats?.uniqueOrdersFormatted || '0'}
              </h2>
              <div className="flex items-center gap-2 text-neutral-600">
                <span className="text-sm font-medium">{dashboardStats?.uniqueCustomers || '0'} customers</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 glass-panel rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '450ms' }}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-600">Inventory Turnover</p>
              <div className="group relative">
                <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
                  <InfoIcon />
                </button>
                <div className="absolute right-0 top-6 w-80 bg-neutral-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl z-50">
                  <p className="font-semibold mb-1">Formula:</p>
                  <code className="text-pop-primary-light">{metricFormulas.inventoryTurnover}</code>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-neutral-900">
                {loading ? '...' : dashboardStats?.inventoryTurnoverFormatted || '0x'}
              </h2>
              <div className="flex items-center gap-2 text-neutral-600">
                <span className="text-sm font-medium">Cost: {dashboardStats?.totalExtendedCostFormatted || '$0'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
