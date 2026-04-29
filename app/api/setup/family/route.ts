import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId, familyName } = await req.json();

    const supabase = await createClient();

    const { data, error } = await (supabase as any)
      .from('families')
      .insert([
        {
          parent_user_id: userId,
          family_name: familyName,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating family:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create family' },
      { status: 500 },
    );
  }
}
