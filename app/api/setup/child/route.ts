import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { familyId, childName, avatarAnimal } = await req.json();

    const supabase = await createClient();

    const { data, error } = await (supabase as any)
      .from('children')
      .insert([
        {
          family_id: familyId,
          name: childName,
          avatar_animal: avatarAnimal,
          monetary_enabled: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating child:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create child' },
      { status: 500 },
    );
  }
}
