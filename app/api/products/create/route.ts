import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, price, quantity_unit = 'item', description, user_id } = body;

    // Validate required fields
    if (!name || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: name and price are required' },
        { status: 400 }
      );
    }

    // Validate price
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    // Determine if this is a webhook call or authenticated request
    let sellerId: string;
    let supabase;

    if (user_id) {
      // Webhook call with user_id - use service role to bypass RLS
      sellerId = user_id;
      supabase = createServiceRoleClient();
    } else {
      // Standard authenticated request - use regular client with RLS
      supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized. Please sign in to create products.' },
          { status: 401 }
        );
      }
      sellerId = user.id;
    }

    // Create product
    const { data: product, error: dbError } = await supabase
      .from('products')
      .insert({
        name: name.trim(),
        price: priceNum,
        quantity_unit: quantity_unit.toLowerCase(),
        description: description?.trim() || null,
        seller_id: sellerId,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to create product', details: dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
      message: `Product "${name}" listed successfully for $${priceNum} per ${quantity_unit}`,
    });

  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
