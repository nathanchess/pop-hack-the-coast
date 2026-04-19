import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Database schema information (hardcoded)
const DATABASE_SCHEMA = {
  ai_metadata_v2: {
    description: 'AI-powered inventory metadata with demand predictions and gap analysis',
    columns: {
      ITEMNMBR: 'Item/SKU number',
      'warehouse location': 'Warehouse location code',
      'predicted_demand for location (item count)': 'AI-predicted demand quantity for this location',
      'Current inventory for location (item count)': 'Current inventory level at this location',
      'Current gap (item count)': 'Gap between predicted demand and current inventory (urgency metric - Y-axis on 2D canvas)',
      'Item value': 'Value/importance score for the item (importance metric - X-axis on 2D canvas)',
      'Aggregate metric': 'Combined metric score for prioritization',
    },
    totalRows: 744,
    example: 'ITEMNMBR: "T-32202", warehouse location: "3", predicted_demand: 1602465.94, current_inventory: 3614.83, gap: 1598851.11',
  },
  sales_transaction_history: {
    description: 'Historical sales transaction data',
    columns: {
      SOPNUMBE: 'Sales order number',
      CUSTNMBR: 'Customer number',
      ITEMNMBR: 'Item number',
      ITEMDESC: 'Item description',
      QUANTITY: 'Quantity sold',
      XTNDPRCE: 'Extended price (revenue)',
      EXTDCOST: 'Extended cost',
      'Customer Type': 'Channel/customer type',
      STATE: 'State code',
      'Product Type': 'Product category',
    },
    aggregations: {
      total_revenue: '$261.29M',
      total_units: '15.59M',
      active_skus: 83,
      total_orders: 89416,
      average_order_value: '$2,922.14',
      warehouse_locations: 8,
      inventory_turnover: '1.85x',
    },
  },
};

interface AIMetadataRow {
  ITEMNMBR: string;
  warehouse_location: string;
  predicted_demand_for_location: number;
  current_inventory_for_location: number;
  current_gap_item_count: number;
  item_value_metric: number;
  aggregate_metric: number;
}

async function loadAIMetadata(): Promise<AIMetadataRow[]> {
  const filePath = path.join(process.cwd(), 'public', 'data', 'ai_metadata_v2.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  return new Promise((resolve, reject) => {
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map((row: any) => ({
          ITEMNMBR: row.ITEMNMBR || '',
          warehouse_location: row['warehouse location'] || '',
          predicted_demand_for_location: parseFloat(row['predicted_demand for location (item count)']) || 0,
          current_inventory_for_location: parseFloat(row['Current inventory for location (item count)']) || 0,
          current_gap_item_count: parseFloat(row['Current gap (item count)']) || 0,
          item_value_metric: parseFloat(row['Item value']) || 0,
          aggregate_metric: parseFloat(row['Aggregate metric']) || 0,
        }));
        resolve(data);
      },
      error: (error: any) => reject(error),
    });
  });
}

function buildSystemPrompt(metadata: AIMetadataRow[]): string {
  // Calculate summary statistics
  const totalItems = metadata.length;
  const totalGap = metadata.reduce((sum, item) => sum + Math.max(0, item.current_gap_item_count), 0);
  const avgPredictedDemand = metadata.reduce((sum, item) => sum + item.predicted_demand_for_location, 0) / totalItems;
  const warehouses = [...new Set(metadata.map(item => item.warehouse_location))];
  
  // Get top gaps
  const topGaps = metadata
    .filter(item => item.current_gap_item_count > 0)
    .sort((a, b) => b.current_gap_item_count - a.current_gap_item_count)
    .slice(0, 20);

  // Get high priority items
  const highPriority = metadata
    .filter(item => item.current_gap_item_count > 100 && item.item_value_metric > 50)
    .sort((a, b) => b.aggregate_metric - a.aggregate_metric)
    .slice(0, 20);

  // Warehouse summaries
  const warehouseStats = metadata.reduce((acc, item) => {
    if (!acc[item.warehouse_location]) {
      acc[item.warehouse_location] = {
        itemCount: 0,
        totalDemand: 0,
        totalInventory: 0,
        totalGap: 0,
        avgValueMetric: 0,
        itemsWithGaps: 0,
      };
    }
    acc[item.warehouse_location].itemCount += 1;
    acc[item.warehouse_location].totalDemand += item.predicted_demand_for_location;
    acc[item.warehouse_location].totalInventory += item.current_inventory_for_location;
    acc[item.warehouse_location].totalGap += Math.max(0, item.current_gap_item_count);
    acc[item.warehouse_location].avgValueMetric += item.item_value_metric;
    if (item.current_gap_item_count > 0) {
      acc[item.warehouse_location].itemsWithGaps += 1;
    }
    return acc;
  }, {} as Record<string, any>);

  return `You are an AI inventory analyst assistant with access to real-time inventory and sales data.

# DATABASE SCHEMA

## ai_metadata_v2.csv (${totalItems} rows)
${JSON.stringify(DATABASE_SCHEMA.ai_metadata_v2, null, 2)}

## sales_transaction_history.csv
${JSON.stringify(DATABASE_SCHEMA.sales_transaction_history, null, 2)}

# CURRENT INVENTORY DATA SUMMARY

**Total SKUs Tracked:** ${totalItems}
**Warehouse Locations:** ${warehouses.length} (${warehouses.join(', ')})
**Total Inventory Gap:** ${totalGap.toLocaleString()} units
**Average Predicted Demand:** ${avgPredictedDemand.toFixed(0)} units per item

## Warehouse Statistics
${Object.entries(warehouseStats)
  .sort(([, a]: any, [, b]: any) => b.totalGap - a.totalGap)
  .map(([warehouse, stats]: any) => {
    const fillRate = ((stats.totalInventory / stats.totalDemand) * 100).toFixed(1);
    const gapPercentage = ((stats.itemsWithGaps / stats.itemCount) * 100).toFixed(1);
    return `
### ${warehouse}
- Items: ${stats.itemCount}
- Predicted Demand: ${stats.totalDemand.toLocaleString()} units
- Current Inventory: ${stats.totalInventory.toLocaleString()} units
- Fill Rate: ${fillRate}%
- Items with Gaps: ${stats.itemsWithGaps} (${gapPercentage}%)
- Total Gap: ${stats.totalGap.toLocaleString()} units
- Avg Value Metric: ${(stats.avgValueMetric / stats.itemCount).toFixed(1)}
`;
  }).join('\n')}

## Top 20 Items with Largest Inventory Gaps
${topGaps.map((item, idx) => `${idx + 1}. **${item.ITEMNMBR}** (${item.warehouse_location}) - Gap: ${item.current_gap_item_count.toLocaleString()} units | Demand: ${item.predicted_demand_for_location.toLocaleString()} | Inventory: ${item.current_inventory_for_location.toLocaleString()} | Priority: ${item.aggregate_metric.toFixed(1)}`).join('\n')}

## Top 20 High Priority Items (High Urgency + High Importance)
${highPriority.map((item, idx) => `${idx + 1}. **${item.ITEMNMBR}** (${item.warehouse_location}) - Gap: ${item.current_gap_item_count.toLocaleString()} | Value: ${item.item_value_metric.toFixed(1)} | Priority: ${item.aggregate_metric.toFixed(1)}`).join('\n')}

# YOUR ROLE

You are a helpful AI assistant that answers questions about inventory, demand forecasting, and warehouse operations.

**Critical Formatting Guidelines:**
- AVOID excessive line breaks - use single line breaks between sections
- When listing items, use compact format: "Item (Location) - Key metrics on same line"
- For tables with 5 or fewer items: use compact list format instead of markdown tables
- For tables with 6+ items: use clean markdown tables with pipes (|)
- Keep responses concise and scannable
- Use **bold** sparingly for truly important metrics only
- Avoid repeating column headers in every row

**Response Format:**
- Use ## for main sections (not too many headers)
- For small lists (≤5 items): Use numbered list with inline metrics
- For larger datasets (6+ items): Use markdown table with aligned columns
- Single line break between list items
- Double line break only between major sections
- Be direct and actionable

**Example Good Format:**
## Top 5 Inventory Gaps
1. **F-04211** (Warehouse 2) - Gap: 821,195 units | Demand: 821,875 | Current: 679
2. **AC-B9SL** (Warehouse U) - Gap: 446,624 units | Demand: 446,624 | Current: 0

**Key Insight:** F-04211 needs immediate restocking in Warehouse 2.

**Example Bad Format (DO NOT USE):**
1. **F-04211** (Warehouse 2)
   - Predicted Demand: 821,875
   - Current Inventory: 679
   - Gap: 821,195 units
   - Priority: 95.2

(Too many line breaks and redundant labels)`;
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    // Load the metadata
    const metadata = await loadAIMetadata();
    const systemPrompt = buildSystemPrompt(metadata);

    // Create streaming response
    const stream = await openai.chat.completions.create({
      model: 'gpt-5.4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      stream: true,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              const data = JSON.stringify({ content });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Error in streaming:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Error in AI agent:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
