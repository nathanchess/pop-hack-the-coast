import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

interface AIMetadataRecord {
  ITEMNMBR?: string;
  'warehouse location'?: string;
  'predicted_demand for location (item count)'?: string;
  'Current inventory for location (item count)'?: string;
  'Current gap (item count)'?: string;
  'Item value'?: string;
  'Aggregate metric'?: string;
  [key: string]: any;
}

export async function GET(request: NextRequest) {
  try {
    const csvPath = path.join(process.cwd(), 'public', 'data', 'ai_metadata_v2.csv');
    
    if (!fs.existsSync(csvPath)) {
      return NextResponse.json(
        { error: 'AI metadata CSV not found' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    
    const parseResult = await new Promise<Papa.ParseResult<AIMetadataRecord>>((resolve) => {
      Papa.parse<AIMetadataRecord>(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: resolve,
      });
    });

    const metadata = parseResult.data.filter(record => 
      record.ITEMNMBR && record['Item value'] && record['Current gap (item count)']
    ).map(record => ({
      sku: record.ITEMNMBR,
      productName: record.ITEMNMBR,
      warehouseLocation: record['warehouse location'] || 'Unknown',
      predictedDemand: parseFloat(record['predicted_demand for location (item count)'] || '0'),
      currentInventory: parseFloat(record['Current inventory for location (item count)'] || '0'),
      currentGapItemCount: parseFloat(record['Current gap (item count)'] || '0'),
      itemValueMetric: parseFloat(record['Item value'] || '0'),
      aggregateMetric: parseFloat(record['Aggregate metric'] || '0'),
      // For the 2D canvas mapping - matching user's specification
      importance: parseFloat(record['Item value'] || '0'), // X-axis
      urgency: parseFloat(record['Current gap (item count)'] || '0'), // Y-axis
      category: 'Product',
      lastOrderDate: new Date().toISOString().split('T')[0],
    }));

    return NextResponse.json({
      success: true,
      data: metadata,
      total: metadata.length,
    });

  } catch (error: any) {
    console.error('AI metadata fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI metadata', details: error.message },
      { status: 500 }
    );
  }
}
