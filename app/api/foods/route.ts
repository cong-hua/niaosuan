import { getAllFoods, searchFoods } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '1500');

    if (query) {
      // Search foods
      const results = await searchFoods(query, limit);
      return NextResponse.json({
        success: true,
        data: results,
        query,
        count: results.length
      });
    } else {
      // Get all foods - use pagination to get all items
      const allFoods = await getAllFoods(); // This now gets all foods without limit
      return NextResponse.json({
        success: true,
        data: allFoods,
        count: allFoods.length
      });
    }

  } catch (error) {
    console.error('Food search API error:', error);
    return NextResponse.json({
      error: 'Failed to fetch foods',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}