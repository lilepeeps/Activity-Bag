import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { childId, amountCents, note } = await req.json();

    if (!childId || !amountCents || amountCents <= 0) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Get the current user to verify they're the parent
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 },
      );
    }

    // Verify the parent owns the child
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('family_id')
      .eq('id', childId)
      .single();

    if (childError || !child) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 },
      );
    }

    const { data: family, error: familyError } = await supabase
      .from('families')
      .select('parent_user_id')
      .eq('id', child.family_id)
      .single();

    if (familyError || !family || family.parent_user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 },
      );
    }

    // Create the payout record
    const { data, error } = await (supabase as any)
      .from('allowance_payouts')
      .insert([
        {
          child_id: childId,
          amount_cents: amountCents,
          note: note || null,
          paid_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating payout:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payout' },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const childId = req.nextUrl.searchParams.get('childId');

    if (!childId) {
      return NextResponse.json(
        { error: 'childId parameter required' },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Get the current user to verify they're the parent
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 },
      );
    }

    // Verify the parent owns the child
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('family_id')
      .eq('id', childId)
      .single();

    if (childError || !child) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 },
      );
    }

    const { data: family, error: familyError } = await supabase
      .from('families')
      .select('parent_user_id')
      .eq('id', child.family_id)
      .single();

    if (familyError || !family || family.parent_user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 },
      );
    }

    // Fetch payouts for this child
    const { data: payouts, error: payoutsError } = await supabase
      .from('allowance_payouts')
      .select('*')
      .eq('child_id', childId)
      .order('paid_at', { ascending: false });

    if (payoutsError) throw payoutsError;

    return NextResponse.json(payouts || []);
  } catch (error) {
    console.error('Error fetching payouts:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch payouts' },
      { status: 500 },
    );
  }
}
