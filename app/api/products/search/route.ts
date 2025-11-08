import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords } = body;

    // Validate keywords
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { error: 'Keywords array is required and must not be empty' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Build the fuzzy search query using PostgreSQL's text search and similarity features
    // We'll search across name, description, and meeting_point fields
    const searchTerms = keywords.map(k => k.trim().toLowerCase()).filter(k => k.length > 0);

    if (searchTerms.length === 0) {
      return NextResponse.json(
        { error: 'At least one non-empty keyword is required' },
        { status: 400 }
      );
    }

    console.log("Processed search terms:", searchTerms);

    // Fetch all products first - we'll do fuzzy matching in JavaScript
    // For better performance with large datasets, consider using pg_trgm extension
    const { data: allProducts, error: fetchError } = await supabase
      .from('products')
      .select('*');

    if (fetchError) {
      console.error('Database error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to search products', details: fetchError.message },
        { status: 500 }
      );
    }

    // Score each product based on keyword matches
    const scoredProducts = allProducts.map(product => {
      let score = 0;
      const productText = [
        product.name || '',
        product.description || '',
        product.meeting_point || '',
        product.quantity_unit || ''
      ].join(' ').toLowerCase();

      // Count matches for each keyword (fuzzy matching using includes)
      searchTerms.forEach(term => {
        // Exact match in name gets highest score
        if (product.name?.toLowerCase().includes(term)) {
          score += 10;
        }
        // Match in description gets medium score
        if (product.description?.toLowerCase().includes(term)) {
          score += 5;
        }
        // Match in meeting_point gets medium score
        if (product.meeting_point?.toLowerCase().includes(term)) {
          score += 5;
        }
        // Match in quantity_unit gets lower score
        if (product.quantity_unit?.toLowerCase().includes(term)) {
          score += 2;
        }
      });

      return { ...product, score };
    });

    // Filter products with score > 0 and sort by score descending
    const matchedProducts = scoredProducts
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // Return top 5 products
      .map(({ score, ...product }) => product); // Remove score from final result

    return NextResponse.json({
      success: true,
      products: matchedProducts,
      count: matchedProducts.length,
    });

  } catch (error) {
    console.error('Product search error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
