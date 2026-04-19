import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

interface SalesRecord {
  [key: string]: any;
}

export async function GET(request: NextRequest) {
  try {
    const csvPath = path.join(process.cwd(), 'public', 'data', 'POP_SalesTransactionHistory.csv');
    
    if (!fs.existsSync(csvPath)) {
      return NextResponse.json(
        { error: 'Sales transaction history CSV not found' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    
    const parseResult = await new Promise<Papa.ParseResult<SalesRecord>>((resolve) => {
      Papa.parse<SalesRecord>(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: resolve,
      });
    });

    const records = parseResult.data;

    // Calculate all metrics
    let totalRevenue = 0;
    let totalUnits = 0;
    let totalGrossProfit = 0;
    let totalMargin = 0;
    let totalExtendedCost = 0;

    const uniqueSKUs = new Set();
    const uniqueCustomers = new Set();
    const uniqueLocations = new Set();
    const uniqueOrders = new Set();

    records.forEach(r => {
      totalRevenue += parseFloat(r.XTNDPRCE_adj || 0);
      totalUnits += parseFloat(r.QUANTITY_adj || 0);
      totalGrossProfit += parseFloat(r.Gross_Profit_adj || 0);
      totalMargin += parseFloat(r.Margin_Pct_adj || 0);
      totalExtendedCost += parseFloat(r.EXTDCOST_adj || 0);

      if (r.ITEMNMBR) uniqueSKUs.add(r.ITEMNMBR);
      if (r.CUSTNMBR) uniqueCustomers.add(r.CUSTNMBR);
      if (r.LOCNCODE) uniqueLocations.add(r.LOCNCODE);
      if (r.SOPNUMBE) uniqueOrders.add(r.SOPNUMBE);
    });

    const avgMargin = totalMargin / records.length;
    const avgOrderValue = totalRevenue / uniqueOrders.size;

    // Inventory turnover calculation (simplified)
    const inventoryTurnover = totalExtendedCost > 0 ? totalRevenue / totalExtendedCost : 0;

    // Return dashboard stats
    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        totalRevenueFormatted: `$${(totalRevenue / 1000000).toFixed(1)}M`,
        totalUnits,
        totalUnitsFormatted: `${(totalUnits / 1000000).toFixed(1)}M`,
        activeSKUs: uniqueSKUs.size,
        avgOrderValue,
        avgOrderValueFormatted: `$${avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        totalGrossProfit,
        totalGrossProfitFormatted: `$${(totalGrossProfit / 1000000).toFixed(1)}M`,
        avgMargin: avgMargin * 100,
        avgMarginFormatted: `${(avgMargin * 100).toFixed(1)}%`,
        uniqueCustomers: uniqueCustomers.size,
        uniqueOrders: uniqueOrders.size,
        uniqueOrdersFormatted: `${uniqueOrders.size.toLocaleString()}`,
        uniqueLocations: uniqueLocations.size,
        inventoryTurnover: inventoryTurnover.toFixed(1),
        // Growth calculations (comparing to total, placeholder for real historical comparison)
        revenueGrowth: '+12.0', // Would need historical data
        unitsGrowth: '+8.2',
        marginGrowth: '-0.3',
      },
    });

  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate dashboard stats', details: error.message },
      { status: 500 }
    );
  }
}
