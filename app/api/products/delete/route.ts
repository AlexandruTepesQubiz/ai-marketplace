import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id } = body;

    // Validate product_id
    if (!product_id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to delete products.' },
        { status: 401 }
      );
    }

    // First, verify the product exists and belongs to the user
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .eq('seller_id', user.id)
      .single();

    if (fetchError || !product) {
      return NextResponse.json(
        { error: 'Product not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    // Delete the product (RLS policy will ensure only the owner can delete)
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', product_id)
      .eq('seller_id', user.id);

    if (deleteError) {
      console.error('Database error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete product', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Product "${product.name}" has been deleted successfully`,
    });

  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
