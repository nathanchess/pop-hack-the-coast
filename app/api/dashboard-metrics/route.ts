import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const metricsPath = path.join(process.cwd(), 'public', 'data', 'dashboard_metrics.json');
    
    if (!fs.existsSync(metricsPath)) {
      return NextResponse.json(
        { error: 'Dashboard metrics file not found' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(metricsPath, 'utf-8');
    const metrics = JSON.parse(fileContent);

    return NextResponse.json({
      success: true,
      ...metrics,
    });
  } catch (error: any) {
    console.error('Dashboard metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard metrics', details: error.message },
      { status: 500 }
    );
  }
}
